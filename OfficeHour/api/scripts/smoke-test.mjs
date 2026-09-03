#!/usr/bin/env node
/**
 * Office Hour API 冒烟测试。
 *
 * 全程跑在一个**临时数据库**里（officehour_smoke_<时间戳>），
 * 教师表也指向这个临时库（config.TEACHER_DB_NAME 默认跟随 DB_NAME），
 * 所以不会读也不会写真实的 GHA.Teachers / GHA.Office_Hours，跑完自动 drop。
 *
 *   node scripts/smoke-test.mjs              # 用 .env 里的 MONGO_URI
 *   KEEP=1 node scripts/smoke-test.mjs       # 保留临时库便于排查
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ── 环境：先注入 env，再动态 import 被测模块 ───────────────── */
const envFile = path.resolve(HERE, '../.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.MONGO_URI) {
  console.error('❌ 需要 MONGO_URI（本地跑请先配置 OfficeHour/api/.env）');
  process.exit(2);
}

const SMOKE_DB = `officehour_smoke_${Date.now()}`;
const SECRET = 'smoke-secret-' + 'x'.repeat(40);
process.env.DB_NAME = SMOKE_DB;
process.env.JWT_SECRET = SECRET;
process.env.JWT_SECRET_OLD = '';
process.env.OH_TERM = '26-27';
process.env.ADMIN_GROUPS = 'S,A';
process.env.NODE_ENV = 'test';
process.env.READ_RATE_MAX = '100000';
process.env.LOGIN_RATE_MAX = '100000';
process.env.WRITE_RATE_MAX = '100000';
// 自助上限设小，让「加到上限被挡」这个用例跑得快
process.env.OH_TEACHER_MAX_SLOTS = '6';

const { createApp } = await import('../src/app.js');
const { connectDb, closeDb, collections } = await import('../src/db.js');

await connectDb();
const server = createApp().listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

/* ── 测试夹具 ──────────────────────────────────────────────── */
const hashed = await bcrypt.hash('Str0ng!Passw0rd', 10);
const TEACHERS = [
  { email: 'teacher@ghedu.com', Name: '张老师', Password: hashed, Group: 'T' },
  { email: 'plain@ghedu.com', Name: '李老师', Password: 'plaintext999', Group: 'T' },
  { email: 'admin@ghedu.com', Name: '王校', Password: hashed, Group: 'S' },
  { email: 'vice@ghedu.com', Name: '汪校', Password: hashed, Group: 'A' },
  { email: 'clean@ghedu.com', Name: '保洁', Password: hashed, Group: 'C' },
];
await collections.teachers.insertMany(TEACHERS.map((t) => ({ ...t })));

const SLOT_FIXTURE = {
  term: '26-27', day: '周一', period: 10, cls: 'G10-1',
  teacherEmail: 'teacher@ghedu.com', teacherName: '张老师',
  room: '文体 114', time: '18:30–19:20', note: '', source: 'excel', fromExcel: true,
  createdAt: new Date(), updatedAt: new Date(),
};
const slotId = (await collections.officeHours.insertOne({ ...SLOT_FIXTURE })).insertedId;

const otherId = (await collections.officeHours.insertOne({
  ...SLOT_FIXTURE,
  cls: 'G11-2',
  teacherEmail: 'admin@ghedu.com',
  teacherName: '王校',
  room: '文体 103',
})).insertedId;

// 全表要有第11节的时间，老师换节次时接口才能反查到「第11节 = 19:40–20:30」
await collections.officeHours.insertOne({
  ...SLOT_FIXTURE,
  day: '周五', period: 11, cls: 'G11-3', time: '19:40–20:30',
  teacherEmail: 'vice@ghedu.com', teacherName: '汪校', room: '冬蕴楼 201',
});

/* ── 小工具 ────────────────────────────────────────────────── */
let passed = 0, failed = 0;
async function call(method, url, { body, token } = {}) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}
async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    // 只打首行会把 assert 的 expected/actual 截掉，排查时只能看到“不等”三个字
    const detail = (err.message || String(err)).split('\n').slice(0, 6).join('\n      ');
    console.log(`  ✗ ${name}\n      ${detail}`);
  }
}
async function login(email, password) {
  const r = await call('POST', '/api/auth/login', { body: { email, password } });
  return r;
}
const PW = 'Str0ng!Passw0rd';

try {
  console.log(`\n临时库: ${SMOKE_DB}\n`);

  console.log('── 健康检查与公开读 ──');
  await check('GET /api/health 不需要数据库也返回 ok', async () => {
    const { status, json } = await call('GET', '/api/health');
    assert.equal(status, 200);
    assert.equal(json.ok, true);
  });
  await check('GET /api/officehours 公开可读（无 token）', async () => {
    const { status, json } = await call('GET', '/api/officehours');
    assert.equal(status, 200);
    assert.equal(json.term, '26-27');
    assert.equal(json.count, 3);
    assert.equal(json.periods[0].time, '18:30–19:20', '应回传节次时间');
  });
  await check('★ 公开接口绝不泄露教师邮箱/密码', async () => {
    const { json } = await call('GET', '/api/officehours');
    const blob = JSON.stringify(json);
    assert.ok(!/teacherEmail/.test(blob), '响应里出现了 teacherEmail');
    assert.ok(!/@ghedu\.com/.test(blob), '响应里出现了邮箱');
    assert.ok(!/Password/.test(blob), '响应里出现了 Password');
  });
  await check('不存在的接口返回 404 JSON', async () => {
    const { status, json } = await call('GET', '/api/nope');
    assert.equal(status, 404);
    assert.ok(json.error);
  });
  await check('/mine 也回传节次时间（前端不用硬编码）', async () => {
    const t = (await login('teacher@ghedu.com', PW)).json.token;
    const { status, json } = await call('GET', '/api/officehours/mine', { token: t });
    assert.equal(status, 200);
    assert.equal(json.periods[0].p, 10);
    assert.equal(json.periods[0].time, '18:30–19:20');
    // 只有一节值班的老师也要拿到完整节次表，否则新增表单的下拉会缺项
    assert.equal(json.periods.length, 2, JSON.stringify(json.periods));
    // 完全自助：能改的是“什么时间在哪”，不能改的是“这是谁的”
    assert.deepEqual(json.editableFields, ['day', 'period', 'cls', 'room', 'note']);
  });
  await check('★ 管理员登录看公开接口才带邮箱，游客不带', async () => {
    const anon = await call('GET', '/api/officehours');
    assert.ok(!/teacherEmail/.test(JSON.stringify(anon.json)));
    const t = (await login('admin@ghedu.com', PW)).json.token;
    const asAdmin = await call('GET', '/api/officehours', { token: t });
    assert.ok(asAdmin.json.slots[0].teacherEmail, '管理员应能看到归属邮箱');
  });

  console.log('\n── 登录（复用 GHA.Teachers）──');
  let token;
  await check('bcrypt 密码登录成功并返回身份', async () => {
    const { status, json } = await login('teacher@ghedu.com', PW);
    assert.equal(status, 200);
    assert.ok(json.token);
    assert.equal(json.user.name, '张老师');
    assert.equal(json.user.group, 'T');
    assert.equal(json.user.isAdmin, false);
    token = json.token;
  });
  await check('★ 响应不含密码或密码哈希', async () => {
    const { json } = await login('teacher@ghedu.com', PW);
    const blob = JSON.stringify(json);
    assert.ok(!/\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{20,}/.test(blob), '响应里出现了 bcrypt 哈希');
    assert.deepEqual(Object.keys(json.user).sort(), ['email', 'group', 'isAdmin', 'name']);
    assert.ok(!('Password' in json), '顶层不应有 Password');
  });
  await check('密码错误 → 401', async () => {
    const { status } = await login('teacher@ghedu.com', 'wrong-password');
    assert.equal(status, 401);
  });
  await check('★ 账号不存在与密码错误返回同一句话（防邮箱枚举）', async () => {
    const a = await login('ghost@ghedu.com', PW);
    const b = await login('teacher@ghedu.com', 'wrong');
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.json.error, b.json.error, `两者不同: "${a.json.error}" vs "${b.json.error}"`);
  });
  await check('大小写不同的邮箱也能登录', async () => {
    const { status } = await login('Teacher@GHEDU.com', PW);
    assert.equal(status, 200);
  });
  await check('空邮箱/空密码 → 400', async () => {
    assert.equal((await login('', PW)).status, 400);
    assert.equal((await login('teacher@ghedu.com', '')).status, 400);
  });
  await check('★ 明文密码登录成功并自动升级为 bcrypt', async () => {
    const { status, json } = await login('plain@ghedu.com', 'plaintext999');
    assert.equal(status, 200);
    assert.equal(json.requiresPasswordChange, true, '应提示改密');
    const doc = await collections.teachers.findOne({ email: 'plain@ghedu.com' });
    assert.ok(doc.Password.startsWith('$2'), '密码没有被升级成 bcrypt');
    assert.ok(await bcrypt.compare('plaintext999', doc.Password), 'bcrypt 哈希应与原密码匹配');
  });
  await check('升级后仍可用同一密码登录', async () => {
    const { status } = await login('plain@ghedu.com', 'plaintext999');
    assert.equal(status, 200);
  });

  console.log('\n── 鉴权边界 ──');
  await check('无 token 访问 /mine → 401', async () => {
    assert.equal((await call('GET', '/api/officehours/mine')).status, 401);
  });
  await check('伪造/损坏 token → 401', async () => {
    assert.equal((await call('GET', '/api/officehours/mine', { token: 'abc.def.ghi' })).status, 401);
  });
  await check('用别的密钥签的 token → 401', async () => {
    const bad = jwt.sign({ email: 'admin@ghedu.com', name: '王校' }, 'not-the-secret', { expiresIn: '1h' });
    assert.equal((await call('GET', '/api/officehours/mine', { token: bad })).status, 401);
  });
  await check('★ FADsys 同密钥 + 同 payload 的 token 直接可用（SSO）', async () => {
    const sso = jwt.sign({ email: 'teacher@ghedu.com', name: '张老师' }, SECRET, { expiresIn: '7d' });
    const { status, json } = await call('GET', '/api/officehours/mine', { token: sso });
    assert.equal(status, 200);
    assert.equal(json.slots.length, 1, '张老师应只看到自己那 1 条');
    assert.equal(json.slots[0].teacherEmail, 'teacher@ghedu.com');
  });
  await check('★ 回查教师表：token 有效但账号已删 → 401', async () => {
    const t = jwt.sign({ email: 'ghost2@ghedu.com', name: '幽灵' }, SECRET, { expiresIn: '7d' });
    const { status } = await call('GET', '/api/officehours/mine', { token: t });
    assert.equal(status, 401);
  });
  await check('GET /api/auth/me 返回当前身份', async () => {
    const { status, json } = await call('GET', '/api/auth/me', { token });
    assert.equal(status, 200);
    assert.equal(json.user.email, 'teacher@ghedu.com');
  });

  console.log('\n── 老师改自己的 Office Hour ──');
  await check('改自己记录的教室 → 成功并落库', async () => {
    const { status, json } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { room: '冬蕴楼 201' }, token });
    assert.equal(status, 200);
    assert.equal(json.slot.room, '冬蕴楼 201');
    assert.equal(json.slot.source, 'teacher');
    assert.equal(json.slot.updatedByName, '张老师');
    const doc = await collections.officeHours.findOne({ _id: slotId });
    assert.equal(doc.room, '冬蕴楼 201');
  });
  await check('填备注 → 成功', async () => {
    const { status } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { note: '这节课我可能迟到 5 分钟' }, token });
    assert.equal(status, 200);
  });
  await check('★ 自助表单需要的可选值由后端给出（不让前端写死）', async () => {
    const { status, json } = await call('GET', '/api/officehours/mine/options', { token });
    assert.equal(status, 200);
    assert.ok(json.classes.includes('G10-1'), JSON.stringify(json.classes));
    assert.equal(json.days.length, 5, '星期清单不对');
    assert.equal(json.periods.length, 2, '节次清单不对');
    assert.ok(json.periods[0].time, '节次要带时间');
    assert.ok(json.ownCount >= 1 && json.maxSlots > json.ownCount, JSON.stringify({ c: json.ownCount, m: json.maxSlots }));
    assert.equal(json.canCreateClass, false, '老师不该能凭空造班级');
  });
  await check('★ 改别人的记录 → 404（不泄露是否存在）', async () => {
    const { status, json } = await call('PATCH', `/api/officehours/mine/${otherId}`, { body: { room: '偷改' }, token });
    assert.equal(status, 404);
    assert.equal(json.error, '记录不存在');
    const doc = await collections.officeHours.findOne({ _id: otherId });
    assert.equal(doc.room, '文体 103', '别人的记录被改动了！');
  });
  await check('★ 归属/学期/来源这些字段一律拒收，改了也算失败', async () => {
    for (const field of ['teacherEmail', 'term', 'source', 'updatedBy', 'fromExcel']) {
      const { status } = await call('PATCH', `/api/officehours/mine/${slotId}`, {
        body: { room: '文体 114', [field]: field === 'teacherEmail' ? 'admin@ghedu.com' : 'x' }, token,
      });
      assert.equal(status, 400, `${field} 应被拒绝`);
    }
    const doc = await collections.officeHours.findOne({ _id: slotId });
    assert.equal(doc.teacherEmail, 'teacher@ghedu.com', '归属被人塞改了！');
    assert.equal(doc.term, '26-27');
  });
  await check('★ 完全自助：老师可以换班（改自己记录的班级）', async () => {
    // G11-3 本学期有值班（周五第11节），但周一第10节还空着 → 可以换过去
    const { status, json } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { cls: 'G11-3' }, token });
    assert.equal(status, 200, json.error);
    assert.equal(json.slot.cls, 'G11-3');
    const doc = await collections.officeHours.findOne({ _id: slotId });
    assert.equal(doc.cls, 'G11-3');
    assert.equal(doc.teacherEmail, 'teacher@ghedu.com', '换班把归属弄丢了');
    const back = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { cls: 'G10-1' }, token });
    assert.equal(back.status, 200, '换回原班级被拒：' + JSON.stringify(back.json));
  });
  await check('★ 换到别人已占的格子 → 409，并说出是谁的班', async () => {
    const { status, json } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { cls: 'G11-2' }, token });
    assert.equal(status, 409);
    assert.match(json.error, /王校/);
    const doc = await collections.officeHours.findOne({ _id: slotId });
    assert.equal(doc.cls, 'G10-1', '被拒绝的请求不该已经落库');
  });
  await check('★ 改成不存在的班级 → 400（防手滑造出幽灵班）', async () => {
    for (const bad of ['G99-新班', 'G10', '初3(2)']) {
      const { status } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { cls: bad }, token });
      assert.equal(status, 400, `“${bad}” 不该被接受`);
    }
  });
  await check('★ 换节次会跟着换展示时间', async () => {
    const up = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { period: 11 }, token });
    assert.equal(up.status, 200, up.json.error);
    assert.equal(up.json.slot.time, '19:40–20:30', '换了节次但时间还是旧的');
    const down = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { period: 10 }, token });
    assert.equal(down.json.slot.time, '18:30–19:20');
  });
  await check('备注超长 → 400', async () => {
    const { status } = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { note: 'x'.repeat(201) }, token });
    assert.equal(status, 400);
  });
  await check('空 body → 400', async () => {
    assert.equal((await call('PATCH', `/api/officehours/mine/${slotId}`, { body: {}, token })).status, 400);
  });
  await check('非法 ID → 400', async () => {
    assert.equal((await call('PATCH', '/api/officehours/mine/not-an-objectid', { body: { room: 'x' }, token })).status, 400);
  });
  await check('★ 老师仍然不能走管理员端点（改他人、整表导入）', async () => {
    assert.equal((await call('POST', '/api/officehours', { body: { ...SLOT_FIXTURE }, token })).status, 403);
    assert.equal((await call('DELETE', `/api/officehours/${otherId}`, { token })).status, 403);
    assert.equal((await call('PUT', `/api/officehours/${otherId}`, { body: { room: '偷改' }, token })).status, 403);
    assert.equal((await call('POST', '/api/officehours/import', { body: { slots: [] }, token })).status, 403);
  });

  console.log('\n── 管理员权限 ──');
  let adminToken, viceToken;
  await check('Group=S 可管理', async () => {
    adminToken = (await login('admin@ghedu.com', PW)).json.token;
    assert.equal((await call('GET', '/api/officehours/admin/audit', { token: adminToken })).status, 200);
  });
  await check('★ Group=A（校领导）也算管理员', async () => {
    viceToken = (await login('vice@ghedu.com', PW)).json.token;
    const me = await call('GET', '/api/auth/me', { token: viceToken });
    assert.equal(me.json.user.isAdmin, true);
    assert.equal((await call('GET', '/api/officehours/admin/audit', { token: viceToken })).status, 200);
  });
  await check('Group=C（清洁）不是管理员 → 403', async () => {
    const t = (await login('clean@ghedu.com', PW)).json.token;
    assert.equal((await call('POST', '/api/officehours', { body: { ...SLOT_FIXTURE, cls: 'X1' }, token: t })).status, 403);
  });
  await check('管理员可改任意字段（含归属）', async () => {
    const { status, json } = await call('PUT', `/api/officehours/${otherId}`, { body: { room: '文体 199', cls: 'G11-2' }, token: adminToken });
    assert.equal(status, 200);
    assert.equal(json.slot.room, '文体 199');
  });
  await check('管理员改归属到不存在的教师 → 400', async () => {
    const { status } = await call('PUT', `/api/officehours/${otherId}`, { body: { teacherEmail: 'nobody@ghedu.com' }, token: adminToken });
    assert.equal(status, 400);
  });
  await check('管理员新增记录，重复主键 → 409', async () => {
    const body = { day: '周二', period: 11, cls: 'Pre-1', teacherEmail: 'teacher@ghedu.com', teacherName: '张老师', room: '文体 112' };
    const first = await call('POST', '/api/officehours', { body, token: adminToken });
    assert.equal(first.status, 201);
    const dup = await call('POST', '/api/officehours', { body, token: adminToken });
    assert.equal(dup.status, 409);
    // 清掉本用例建的记录，不影响后续计数
    await collections.officeHours.deleteOne({ term: '26-27', day: '周二', period: 11, cls: 'Pre-1' });
  });
  await check('非法星期/节次 → 400', async () => {
    const { status } = await call('POST', '/api/officehours', {
      body: { day: '周六', period: 11, cls: 'Z', teacherEmail: 'teacher@ghedu.com', room: 'r' }, token: adminToken,
    });
    assert.equal(status, 400);
  });

  console.log('\n── 批量导入 ──');
  await check('导入含未知邮箱 → 整批拒绝', async () => {
    const { status, json } = await call('POST', '/api/officehours/import', {
      body: { slots: [{ day: '周三', period: 10, cls: 'G10-2', teacherEmail: 'ghost@ghedu.com', teacherName: '幽灵', room: '文体 115' }] },
      token: adminToken,
    });
    assert.equal(status, 400);
    assert.ok(/不存在/.test(json.error), json.error);
  });
  await check('导入合法数据 → 新建 + 更新计数正确', async () => {
    const { status, json } = await call('POST', '/api/officehours/import', {
      body: {
        slots: [
          { day: '周三', period: 10, cls: 'G10-2', teacherEmail: 'teacher@ghedu.com', teacherName: '张老师', room: '文体 115', time: '18:30–19:20' },
          { day: '周一', period: 10, cls: 'G10-1', teacherEmail: 'teacher@ghedu.com', teacherName: '张老师', room: '文体 114', time: '18:30–19:20' },
        ],
      },
      token: adminToken,
    });
    assert.equal(status, 200);
    assert.ok(json.created >= 1 && json.updated >= 1, JSON.stringify(json));
  });
  await check('★ 重导入默认保留老师自己写的备注', async () => {
    const doc = await collections.officeHours.findOne({ _id: slotId });
    assert.equal(doc.note, '这节课我可能迟到 5 分钟', '备注被导入覆盖掉了');
  });
  await check('非法导入条目逐条带行号报错', async () => {
    const { json } = await call('POST', '/api/officehours/import', {
      body: { slots: [{ day: '周一', period: 10, cls: 'A', teacherEmail: 'teacher@ghedu.com', room: 'r' }, { day: '怪' }] },
      token: adminToken,
    });
    assert.ok(Array.isArray(json.errors), JSON.stringify(json));
    assert.ok(json.errors.some((e) => /第 2 条/.test(e)), '没定位到第二行的错误：' + JSON.stringify(json.errors));
  });
  await check('★ 导入不必上传 teacherName，由服务端从教师表反查', async () => {
    const { status, json } = await call('POST', '/api/officehours/import', {
      body: { slots: [{ day: '周四', period: 11, cls: 'G12', teacherEmail: 'teacher@ghedu.com', room: '冬蕴楼 102', time: '19:40–20:30' }] },
      token: adminToken,
    });
    assert.equal(status, 200, JSON.stringify(json));
    const doc = await collections.officeHours.findOne({ term: '26-27', day: '周四', period: 11, cls: 'G12' });
    assert.equal(doc.teacherName, '张老师', '姓名没被服务端回填');
  });

  console.log('\n── 老师自助新增 / 删除 / 删除碑 ──');
  let mineNew;
  await check('新增自己的值班 → 201，学生端公开读立刻能看到', async () => {
    const { status, json } = await call('POST', '/api/officehours/mine', {
      body: { day: '周二', period: 10, cls: 'G10-2', room: '冬蕴楼 305', note: '安静自习' }, token,
    });
    assert.equal(status, 201, json.error);
    assert.equal(json.slot.teacherEmail, 'teacher@ghedu.com');
    assert.equal(json.slot.time, '18:30–19:20', '新增没自动带上该节时间');
    assert.equal(json.slot.source, 'teacher');
    assert.equal(json.slot.fromExcel, false, '自己加的不应被当成排班表来的');
    mineNew = json.slot.id;
    const pub = await call('GET', '/api/officehours');
    const hit = pub.json.slots.find((s) => s.day === '周二' && s.period === 10 && s.cls === 'G10-2');
    assert.ok(hit && hit.teacherName === '张老师', '学生端看不到老师新增的值班');
    assert.ok(!('teacherEmail' in hit), '公开读把邮箱泄了');
  });
  await check('★ 同一时段多位老师填同一间教室（办公室）不算冲突', async () => {
    const a = await call('PATCH', `/api/officehours/mine/${slotId}`, { body: { room: '高老师办公室' }, token });
    assert.equal(a.status, 200, a.json.error);
    // 另一位老师、同一节、不同班、同一间办公室——答疑互不影响，必须能保存
    const b = await call('PUT', `/api/officehours/${otherId}`, { body: { room: '高老师办公室' }, token: adminToken });
    assert.equal(b.status, 200, b.json.error);
    assert.equal(b.json.slot.room, '高老师办公室');
  });
  await check('★ 自助新增时把地点填成办公室也可以（不比教室）', async () => {
    const r = await call('POST', '/api/officehours/mine', {
      body: { day: '周五', period: 11, cls: 'G10-1', room: '高老师办公室' }, token,
    });
    assert.equal(r.status, 201, r.json.error);
    assert.equal(r.json.slot.room, '高老师办公室');
    await call('DELETE', '/api/officehours/mine/' + r.json.slot.id, { token });
  });
  await check('★ 新增抢别人已占的班 → 409 并说出是谁', async () => {
    const { status, json } = await call('POST', '/api/officehours/mine',
      { body: { day: '周一', period: 10, cls: 'G11-2', room: 'r' }, token });
    assert.equal(status, 409); assert.match(json.error, /王校/);
  });
  await check('★ 新增让自己同一时段占两个班 → 409', async () => {
    const { status, json } = await call('POST', '/api/officehours/mine',
      { body: { day: '周一', period: 10, cls: 'G10-2', room: 'r' }, token });
    assert.equal(status, 409); assert.match(json.error, /同一时段|两个班/);
  });
  await check('新增与已有完全相同的一格 → 409（提示不用重复加）', async () => {
    const { status, json } = await call('POST', '/api/officehours/mine',
      { body: { day: '周一', period: 10, cls: 'G10-1', room: 'r' }, token });
    assert.equal(status, 409); assert.match(json.error, /已经有一条/);
  });
  await check('新增缺教室 / 非法星期 / 幽灵班 → 400', async () => {
    assert.equal((await call('POST', '/api/officehours/mine', { body: { day: '周二', period: 11, cls: 'G10-2' }, token })).status, 400);
    assert.equal((await call('POST', '/api/officehours/mine', { body: { day: '周六', period: 11, cls: 'G10-2', room: 'r' }, token })).status, 400);
    assert.equal((await call('POST', '/api/officehours/mine', { body: { day: '周二', period: 11, cls: 'G99', room: 'r' }, token })).status, 400);
  });
  await check('★ 唯一索引兜住绕过接口的重复写入', async () => {
    await assert.rejects(
      () => collections.officeHours.insertOne({
        term: '26-27', day: '周二', period: 10, cls: 'G12',
        teacherEmail: 'teacher@ghedu.com', teacherName: '张老师', room: 'r', source: 'excel', fromExcel: false,
      }),
      (e) => { assert.equal(e.code, 11000, '应被 uniq_teacher_term_day_period 拦下'); return true; }
    );
  });
  await check('★ 加到自助上限就会被挡，不会刷出几十条', async () => {
    const ids = [];
    let blocked = '';
    for (let p = 12; p <= 25 && !blocked; p++) {
      const r = await call('POST', '/api/officehours/mine',
        { body: { day: '周五', period: p, cls: 'G10-2', room: 'R' + p }, token });
      if (r.status === 409 && /上限/.test(r.json.error)) blocked = r.json.error;
      else if (r.status === 201) ids.push(r.json.slot.id);
      else throw new Error('意外状态 ' + r.status + ' ' + JSON.stringify(r.json));
    }
    assert.ok(blocked, '加满了也没被上限挡住');
    for (const id of ids) await call('DELETE', '/api/officehours/mine/' + id, { token });
  });
  await check('删除自己新增的 → 200，不记碑（本来就不在排班表里）', async () => {
    const { status, json } = await call('DELETE', `/api/officehours/mine/${mineNew}`, { token });
    assert.equal(status, 200, json.error);
    assert.equal(json.ledgered, false);
    assert.equal(await collections.deletions.countDocuments({ term: '26-27', day: '周二', period: 10, cls: 'G10-2' }), 0);
    const pub = await call('GET', '/api/officehours');
    assert.ok(!pub.json.slots.some((s) => s.id === mineNew), '删了但学生端还看得到');
  });
  await check('★ 删别人的记录 → 404 且真的没删掉', async () => {
    assert.equal((await call('DELETE', `/api/officehours/mine/${otherId}`, { token })).status, 404);
    assert.ok(await collections.officeHours.findOne({ _id: otherId }), '别人的记录被删了！');
  });
  await check('★ 删掉排班表来源的行会记碑，重导入不会把它复活', async () => {
    const { status } = await call('DELETE', `/api/officehours/mine/${slotId}`, { token });
    assert.equal(status, 200);
    assert.equal(await collections.deletions.countDocuments({ term: '26-27', day: '周一', period: 10, cls: 'G10-1' }), 1, '没留下删除碑');

    const r = await call('POST', '/api/officehours/import', {
      token: adminToken,
      body: { slots: [{ day: '周一', period: 10, cls: 'G10-1', teacherEmail: 'teacher@ghedu.com', room: '文体 114', time: '18:30–19:20' }] },
    });
    assert.equal(r.status, 200);
    assert.equal(r.json.skippedDeleted, 1, JSON.stringify(r.json));
    assert.equal(await collections.officeHours.countDocuments({ term: '26-27', day: '周一', period: 10, cls: 'G10-1' }), 0,
      '老师删掉的行又被导回来了！');
  });
  await check('★ 管理员显式 restoreDeleted 才恢复，并把碑拔掉', async () => {
    const r = await call('POST', '/api/officehours/import', {
      token: adminToken,
      body: { restoreDeleted: true, slots: [{ day: '周一', period: 10, cls: 'G10-1', teacherEmail: 'teacher@ghedu.com', room: '文体 114', time: '18:30–19:20' }] },
    });
    assert.equal(r.json.skippedDeleted, 0, JSON.stringify(r.json));
    assert.equal(r.json.created, 1);
    assert.equal(await collections.deletions.countDocuments({ term: '26-27', day: '周一', period: 10, cls: 'G10-1' }), 0, '碑没拔掉');
  });
  await check('审计里有 teacher_create / teacher_delete（含被删内容）', async () => {
    const { json } = await call('GET', '/api/officehours/admin/audit?limit=200', { token: adminToken });
    const acts = json.entries.map((e) => e.action);
    assert.ok(acts.includes('teacher_create'), '缺 teacher_create');
    assert.ok(acts.includes('teacher_delete'), '缺 teacher_delete');
    const del = json.entries.find((e) => e.action === 'teacher_delete');
    assert.ok(del.before && del.before.cls, '删除审计应留下被删记录的内容');
  });

  console.log('\n── 审计 ──');
  await check('老师改动与管理员操作都有审计记录', async () => {
    const { json } = await call('GET', '/api/officehours/admin/audit?limit=100', { token: adminToken });
    const acts = json.entries.map((e) => e.action);
    assert.ok(acts.includes('teacher_update'), '缺 teacher_update');
    assert.ok(acts.includes('admin_update') || acts.includes('admin_create'), '缺管理员写操作');
    assert.ok(acts.includes('import'), '缺 import');
    const t = json.entries.find((e) => e.action === 'teacher_update');
    assert.ok(t.before && 'room' in t.before, '审计应留下修改前的值');
    assert.ok(t.after && 'room' in t.after, '审计应留下修改后的值');
    assert.equal(t.email, 'teacher@ghedu.com');
  });
  await check('审计接口不接受非管理员', async () => {
    assert.equal((await call('GET', '/api/officehours/admin/audit', { token })).status, 403);
  });
} finally {
  server.close();
  await closeDb();
  if (!process.env.KEEP) {
    const c = new MongoClient(process.env.MONGO_URI);
    await c.connect();
    await c.db(SMOKE_DB).dropDatabase();
    await c.close();
    console.log(`\n🧹 已删除临时库 ${SMOKE_DB}`);
  } else {
    console.log(`\n保留临时库 ${SMOKE_DB}`);
  }
}

console.log(`\n${failed ? '❌' : '✅'} 冒烟测试: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
