#!/usr/bin/env node
/**
 * 把 OfficeHour/data.json 导入 MongoDB（GHA.Office_Hours）。
 *
 *   node scripts/seed.mjs                 # 预演（默认，不写库）
 *   node scripts/seed.mjs --apply         # 真正写入
 *   node scripts/seed.mjs --apply --force # 连老师写过的备注一起覆盖
 *   node scripts/seed.mjs --apply --prune # 同时删除 Excel 里已不存在的记录
 *   node scripts/seed.mjs --apply --restore-deleted  # 把老师删过的格子恢复回来重新导入
 *
 * 老师自助删掉的 Excel 行会在 Office_Hour_Deletions 里留碑，
 * 默认不复活 —— 否则“我明明删了，跑一次导入又出现了”。
 *
 * 教师归属：按 Teachers.Name 反查 email；查不到就**中止**，绝不静默错绑。
 * 加 --allow-missing 才允许跳过未匹配项（会把名单打印出来供补录）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(HERE, '../../data.json');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const APPLY = has('--apply');
const FORCE = has('--force');
const PRUNE = has('--prune');
const RESTORE_DELETED = has('--restore-deleted');
const ALLOW_MISSING = has('--allow-missing');

function loadEnv() {
  const f = path.resolve(HERE, '../.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

loadEnv();
const URI = process.env.MONGO_URI;
const DB = process.env.DB_NAME || 'GHA';
const COLL = process.env.OFFICEHOURS_COLLECTION || 'Office_Hours';
const TEACHERS = process.env.TEACHERS_COLLECTION || 'Teachers';
const AUDIT = process.env.AUDIT_COLLECTION || 'Office_Hour_Audit';
const DELETIONS = process.env.DELETIONS_COLLECTION || 'Office_Hour_Deletions';
const CLASS_REG = process.env.CLASS_REGISTRY_COLLECTION || 'Office_Hour_Classes';

if (!URI) {
  console.error('❌ 缺少 MONGO_URI（写进 OfficeHour/api/.env 或用环境变量传入）');
  process.exit(2);
}
if (!fs.existsSync(DATA)) {
  console.error(`❌ 找不到 ${DATA}，请先运行 python3 OfficeHour/build_data.py`);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const TERM = (data.term || '').split(' / ')[0] || '26-27';
const timeByPeriod = Object.fromEntries(data.periods.map((p) => [p.p, p.time]));

console.log(`源文件  : ${path.relative(process.cwd(), DATA)}`);
console.log(`生成于  : ${data.generatedAt}   学期: ${TERM}   记录数: ${data.slots.length}`);
console.log(`目标    : ${DB}.${COLL}`);
console.log(`模式    : ${APPLY ? '写入' : '预演（加 --apply 才真正写库）'}${FORCE ? ' + 覆盖老师备注' : ''}${PRUNE ? ' + 清理过期' : ''}${RESTORE_DELETED ? ' + 恢复被删格子' : ''}\n`);

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
await client.connect();
const db = client.db(DB);
const coll = db.collection(COLL);

/* ── 1. 姓名 → email ───────────────────────────────────────── */
const names = [...new Set(data.slots.map((s) => s.teacherName))];
const docs = await db.collection(TEACHERS).find({ Name: { $in: names } }, { projection: { email: 1, Name: 1, Group: 1 } }).toArray();
const byName = new Map();
for (const d of docs) {
  if (!byName.has(d.Name)) byName.set(d.Name, []);
  byName.get(d.Name).push(d);
}

const nameToEmail = new Map();
const unresolved = [];
const ambiguous = [];
for (const n of names) {
  const hits = byName.get(n) || [];
  if (hits.length === 0) unresolved.push(n);
  else if (hits.length > 1) ambiguous.push([n, hits.map((h) => h.email)]);
  else nameToEmail.set(n, hits[0].email);
}

console.log(`教师表命中: ${nameToEmail.size}/${names.length}`);
if (ambiguous.length) {
  console.log('⚠️  姓名重复，无法自动判定归属：');
  ambiguous.forEach(([n, es]) => console.log(`   ${n} → ${es.join(' | ')}`));
}
if (unresolved.length) {
  console.log(`❌ 教师表里查不到这些姓名: ${unresolved.join('、')}`);
  if (!ALLOW_MISSING) {
    console.log('   未匹配就中止，避免把值班错绑到别人账号。可在教师表补 Name，或加 --allow-missing 跳过。');
    await client.close();
    process.exit(1);
  }
  console.log('   --allow-missing 已指定：这些记录将被跳过');
}
if (ambiguous.length && !ALLOW_MISSING) {
  await client.close();
  process.exit(1);
}
console.log('');

/* ── 2. 逐条 upsert ────────────────────────────────────────── */
const now = new Date();
let created = 0, updated = 0, unchanged = 0, preserved = 0, skipped = 0, keptDeleted = 0;
const keys = [];

// 老师自助删掉的格子会留一块碑：默认不复活，否则“我明明删了，跑一次导入又出现了”
const delColl = db.collection(DELETIONS);
const tombKey = (s) => `${s.day}|${s.period}|${s.cls}`;
const tombstones = new Map();
if (RESTORE_DELETED && APPLY) {
  const r = await delColl.deleteMany({ term: TERM, $or: data.slots.map((s) => ({ day: s.day, period: s.period, cls: s.cls })) });
  if (r.deletedCount) console.log(`🪦 已拔除 ${r.deletedCount} 块删除碑，这些格子本次会重新导入`);
} else {
  for (const d of await delColl.find({ term: TERM }).toArray()) tombstones.set(`${d.day}|${d.period}|${d.cls}`, d);
  if (tombstones.size) console.log(`🪦 有 ${tombstones.size} 个格子被老师删过，本次不复活（要恢复加 --restore-deleted）`);
}

for (const s of data.slots) {
  const email = nameToEmail.get(s.teacherName);
  if (!email) { skipped += 1; continue; }

  const key = { term: TERM, day: s.day, period: s.period, cls: s.cls };
  keys.push(key);
  const existing = await coll.findOne(key);

  if (!existing && tombstones.has(tombKey(s))) { keptDeleted += 1; continue; }
  if (existing && tombstones.has(tombKey(s)) && APPLY) {
    await delColl.deleteOne({ term: TERM, day: s.day, period: s.period, cls: s.cls });
  }

  const set = {
    ...key,
    teacherEmail: email,
    teacherName: s.teacherName,
    room: s.room,
    time: timeByPeriod[s.period] || '',
    source: 'excel',
    anchored: true,     // 节次型记录（参与唯一索引）；老师自定时间的记录为 false
    fromExcel: true,     // 不可变标记：老师改了教室也不会把它变成“不是表里的”
    updatedAt: now,
    updatedBy: 'seed-script',
    updatedByName: '排班表导入',
  };

  if (existing) {
    const same =
      existing.teacherEmail === email &&
      existing.room === set.room &&
      // fromExcel / anchored 也要参比较，否则存量数据补不上这些字段时会一直被当成“无变化”跳过
      existing.fromExcel === true &&
      existing.anchored === true &&
      (existing.time || '') === set.time;
    // 老师自己写过的 note 默认保留
    if (existing.source === 'teacher' && existing.note && !FORCE) {
      set.note = existing.note;
      preserved += 1;
    } else {
      set.note = existing.note || '';
    }
    if (same && (existing.note || '') === (set.note || '')) {
      unchanged += 1;
      continue;
    }
    if (APPLY) await coll.updateOne({ _id: existing._id }, { $set: set });
    updated += 1;
  } else {
    set.note = '';
    if (APPLY) await coll.insertOne({ ...set, createdAt: now });
    created += 1;
  }
}

/* ── 3. 过期记录 ───────────────────────────────────────────── */
let orphans = 0;
if (keys.length) {
  const q = { $or: keys.map((k) => ({ ...k })) };
  // 只收 Excel 来源的孤儿：老师自己加的、管理员手工加的不在 Excel 里，
  // 但它们是合法数据，--prune 把它们扫掉就是静默删人的值班。
  const offScheduleQ = { term: TERM, $nor: [q] };
  const seededOrphanQ = { ...offScheduleQ, fromExcel: true };
  const offSchedule = await coll.countDocuments(offScheduleQ);
  orphans = await coll.countDocuments(seededOrphanQ);
  if (offSchedule > orphans) {
    console.log(`ℹ️  ${offSchedule - orphans} 条是老师/管理员自己加的（不在 Excel 里），--prune 不会动它们`);
  }
  if (orphans) {
    if (PRUNE && APPLY) {
      await coll.deleteMany(seededOrphanQ);
      console.log(`🧹 已删除 ${orphans} 条 Excel 中已不存在的排班`);
    } else {
      console.log(`ℹ️  有 ${orphans} 条 Excel 来源的记录不在本次表格中（加 --prune 删除）`);
    }
  }
}

if (APPLY) {
  // 与 src/db.js 保持同一套定义：两条唯一约束只管“节次型”记录（anchored=true），
  // 自定时间型不参与——MongoDB 唯一索引把 null 当成一个值，不然两条自定记录会误撞。
  // 旧库里的同名索引没有 partialFilterExpression，选项不同会报错 → 先删后建完成迁移。
  const ensure = async (coll, keys, opts, label) => {
    try { await coll.createIndex(keys, opts); }
    catch (err) {
      if (err.code === 85 || err.codeName === 'IndexOptionsConflict' || err.codeName === 'IndexKeySpecsConflict') {
        try { await coll.dropIndex(opts.name); await coll.createIndex(keys, opts); console.log(`🔄 索引 ${opts.name} 已按新规则重建`); }
        catch (e2) { console.log(`⚠️  ${label} 重建失败：${e2.message}`); }
      } else { console.log(`⚠️  ${label} 创建失败（${err.code}）：${err.message}`); }
    }
  };
  const A = { anchored: true };
  await ensure(coll, { term: 1, day: 1, period: 1, cls: 1 },
    { unique: true, name: 'uniq_term_day_period_cls', partialFilterExpression: A }, '班级唯一索引');
  await ensure(coll, { teacherEmail: 1, term: 1, day: 1, period: 1 },
    { unique: true, name: 'uniq_teacher_term_day_period', partialFilterExpression: A }, '教师时段唯一索引');
  await coll.createIndex({ teacherEmail: 1, term: 1 }, { name: 'teacher_term' }).catch(() => {});
  await coll.createIndex({ term: 1, day: 1 }, { name: 'term_day' }).catch(() => {});
  await delColl.createIndex({ term: 1, day: 1, period: 1, cls: 1 }, { unique: true, name: 'uniq_deleted_slot' });
  // 班级归档到注册表：某个班的最后一条值班被老师改走后，名字仍要能选到
  await db.collection(CLASS_REG).bulkWrite([...new Set(data.slots.map((s) => s.cls))].filter(Boolean).map((cls) => ({
    updateOne: {
      filter: { cls },
      update: { $set: { cls, term: TERM, seenAt: now }, $setOnInsert: { firstSeenAt: now } },
      upsert: true,
    },
  })));
  await db.collection(AUDIT).insertOne({
    at: now, action: 'seed', email: 'seed-script', name: '排班表导入',
    after: { term: TERM, created, updated, unchanged, preserved, skipped, keptDeleted, source: data.source },
  });
}

console.log(`\n${APPLY ? '✅ 导入完成' : '🔍 预演结果（未写库）'}`);
console.log(`   新增 ${created} · 更新 ${updated} · 无变化 ${unchanged} · 保留老师备注 ${preserved} · 跳过 ${skipped}`
  + (keptDeleted ? ` · 尊重老师删除不导入 ${keptDeleted}` : ''));
if (!APPLY) console.log('\n   确认无误后执行：node scripts/seed.mjs --apply');

await client.close();
