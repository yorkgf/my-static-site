#!/usr/bin/env node
/**
 * 端到端验证：临时数据库 + 真实 API 服务 + 真实 Chrome 驱动 admin/学生页。
 *
 *   node OfficeHour/tests/e2e.mjs
 *
 * 全程用一个一次性数据库（officehour_e2e_<时间戳>），教师是**合成账号**
 * （密码由本脚本自己设定），绝不读写真实的 GHA.Teachers。跑完自动 drop。
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ENV_FILE = path.join(ROOT, 'OfficeHour/api/.env');
const API_DIR = path.join(ROOT, 'OfficeHour/api');
const SMOKE_PW = 'E2eTest!2026';
const API_PORT = 9200;
const WEB_PORT = 9201;

for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
  const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const E2E_DB = `officehour_e2e_${Date.now()}`;

const log = (...a) => console.log('[e2e]', ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

let mongo, apiProc, webProc, harnessOut = '';
let failed = 0, passed = 0;

function ok(name, cond, extra = '') {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return true; } catch { }
    await sleep(250);
  }
  return false;
}

async function cleanup() {
  try { if (apiProc) apiProc.kill('SIGTERM'); } catch { }
  try { if (webProc) webProc.kill('SIGTERM'); } catch { }
  try { if (mongo) { await mongo.db(E2E_DB).dropDatabase(); await mongo.close(); } } catch { }
}

try {
  /* ── 1. 临时库 + 合成教师 + 真实排班 ───────────────────── */
  mongo = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  await mongo.connect();
  const db = mongo.db(E2E_DB);
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'OfficeHour/data.json'), 'utf8'));
  const names = [...new Set(data.slots.map(s => s.teacherName))];
  const hash = await bcrypt.hash(SMOKE_PW, 10);

  await db.collection('Teachers').insertMany(names.map((n, i) => ({
    email: `e2e${i}@example.test`, Name: n, Password: hash,
    Group: i === 1 ? 'S' : 'T',        // 第 2 位当管理员，第 1 位是普通教师
  })));
  await db.collection('Office_Hours').createIndex({ term: 1, day: 1, period: 1, cls: 1 }, { unique: true });
  const emailByName = Object.fromEntries(names.map((n, i) => [n, `e2e${i}@example.test`]));
  const timeByP = Object.fromEntries(data.periods.map(p => [p.p, p.time]));
  await db.collection('Office_Hours').insertMany(data.slots.map(s => ({
    term: data.term, day: s.day, period: s.period, cls: s.cls,
    teacherEmail: emailByName[s.teacherName], teacherName: s.teacherName,
    room: s.room, time: timeByP[s.period], note: '', source: 'excel',
    createdAt: new Date(), updatedAt: new Date(),
  })));
  log(`临时库 ${E2E_DB}：${names.length} 个合成教师 + ${data.slots.length} 条排班`);

  /* ── 2. 起 API（子进程，指向临时库）────────────────────── */
  apiProc = spawn(process.execPath, ['src/index.js'], {
    cwd: API_DIR,
    env: {
      ...process.env, NODE_ENV: 'test', PORT: String(API_PORT),
      DB_NAME: E2E_DB, TEACHER_DB_NAME: E2E_DB,
      JWT_SECRET: 'e2e-secret-' + 'y'.repeat(40),
      OH_TERM: data.term, ADMIN_GROUPS: 'S,A',
      READ_RATE_MAX: '100000', LOGIN_RATE_MAX: '100000', WRITE_RATE_MAX: '100000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  apiProc.stdout.on('data', d => process.env.E2E_VERBOSE && process.stdout.write('[api] ' + d));
  apiProc.stderr.on('data', d => process.env.E2E_VERBOSE && process.stderr.write('[api!] ' + d));
  if (!await waitFor(`http://127.0.0.1:${API_PORT}/api/health`)) throw new Error('API 起不来');
  log('API 已就绪 :' + API_PORT);

  /* ── 3. 起静态服务 ─────────────────────────────────────── */
  webProc = spawn('python3', ['-m', 'http.server', String(WEB_PORT), '--bind', '127.0.0.1'],
    { cwd: ROOT, stdio: 'ignore' });
  if (!await waitFor(`http://127.0.0.1:${WEB_PORT}/officehour-admin.html`)) throw new Error('静态服务起不来');
  log('静态服务已就绪 :' + WEB_PORT);

  /* ── 4. API 侧先自检一轮 ───────────────────────────────── */
  console.log('\n── API 侧自检 ──');
  const pub = await (await fetch(`http://127.0.0.1:${API_PORT}/api/officehours`)).json();
  ok('公开读返回 72 条', pub.count === 72, 'count=' + pub.count);
  ok('公开读不含邮箱', !/teacherEmail/.test(JSON.stringify(pub)));
  const li = await fetch(`http://127.0.0.1:${API_PORT}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailByName[names[1]], password: SMOKE_PW }),
  });
  ok('合成教师可登录', li.status === 200, 'status=' + li.status);
  const { token } = await li.json();

  /* ── 5. Chrome 驱动 admin 页 ───────────────────────────── */
  console.log('\n── 浏览器端到端 ──');
  const chrome = process.env.CHROME || '/usr/bin/google-chrome';
  const url = `http://127.0.0.1:${WEB_PORT}/OfficeHour/tests/officehour.e2e.html`
    + `?api=http://127.0.0.1:${API_PORT}&pw=${encodeURIComponent(SMOKE_PW)}`
    + `&teacher=${encodeURIComponent(emailByName[names[0]])}&admin=${encodeURIComponent(emailByName[names[1]])}`
    + `&tname=${encodeURIComponent(names[0])}`;
  const profile = fs.mkdtempSync('/tmp/e2e-chrome-');
  const dom = await new Promise((resolve, reject) => {
    const p = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--user-data-dir=' + profile,
      '--virtual-time-budget=45000', '--dump-dom', url], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => process.env.E2E_VERBOSE && process.stderr.write('[chrome] ' + d));
    p.on('exit', code => (code === 0 || out.length > 100 ? resolve(out) : reject(new Error('chrome 退出码 ' + code))));
  });

  const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
  harnessOut = m ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '';
  console.log(harnessOut || '(harness 没有输出)');
  ok('浏览器用例全部通过', /ALL PASS/.test(harnessOut) && !/✗/.test(harnessOut));

  /* ── 6. 改动是否真落库 ─────────────────────────────────── */
  console.log('\n── 落库核验 ──');
  const changed = await db.collection('Office_Hours').findOne({ term: data.term, day: '周一', period: 10, cls: 'G10-1' });
  ok('教室改动已写入数据库', /E2E改过/.test(changed.room || ''), 'room=' + changed.room);
  ok('备注已写入数据库', /浏览器端到端/.test(changed.note || ''), 'note=' + changed.note);
  ok('改动标记为老师本人来源', changed.source === 'teacher', 'source=' + changed.source);
  const aud = await db.collection('Office_Hour_Audit').countDocuments();
  ok('审计留有记录', aud > 0, 'audit=' + aud);

  // 自助新增/删除跑完一遍后必须回到原状，不能留下野数据
  const total = await db.collection('Office_Hours').countDocuments();
  ok('自助新增+删除后记录数回到 72', total === 72, 'total=' + total);
  ok('周五那条临时记录已真的消失',
     (await db.collection('Office_Hours').countDocuments({ day: '周五' })) === 0);
  ok('删自己加的行不会误留删除碑',
     (await db.collection('Office_Hour_Deletions').countDocuments()) === 0);
} catch (err) {
  failed++;
  console.error('\n[e2e] 出错:', err.message);
} finally {
  await cleanup();
  console.log(`\n🧹 临时库 ${E2E_DB} 已删除`);
  console.log(`\n${failed ? '❌' : '✅'} E2E: ${passed} 通过, ${failed} 失败`);
}
process.exit(failed ? 1 : 0);
