#!/usr/bin/env python3
"""
一次性核对：Office Hour 表里的 20 位中文姓名，能否在 MongoDB 的教师表里对上。
这一步决定「老师登录改自己的 office hour」能不能做、要不要人工建映射表。

只读，不写库。

用法（需要 FADsys 的 MONGO_URI，二选一）：
  # A. 直接给连接串
  MONGO_URI='mongodb://...' python3 OfficeHour/check_teacher_identity.py --db GHA --coll Teachers

  # B. 复用 FADsys 后端已有的 .env / 依赖（它会去找 mongodb 驱动）
  cd /home/feng/projects/FADsys/backend && node ../../my-static-site/my-static-site/OfficeHour/check_teacher_identity.js \
      --db GHA --name-field Name --email-field email
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OH_NAMES = [
    "李楚翘", "宋雯雯", "简汐洳", "张诗文", "赵睿佳", "郭林", "高峰", "晏海花",
    "刘展佑", "邵春晖", "李梅诺", "朱专", "凌峰杰", "刘丹", "卢琦", "刘禹函",
    "陈逸飞", "石鑫玥", "赵丁霓", "石琪",
]

JS = r"""
// 只读核对：教师表字段 + 姓名匹配情况
const path = require('path');
const fs = require('fs');

function loadMongo() {
  const tries = ['mongodb'];
  // 允许从 FADsys backend 的 node_modules 里取驱动
  const extra = (process.argv.find(a => a.startsWith('--nm=')) || '').split('=')[1];
  if (extra) tries.push(path.join(extra, 'mongodb'));
  for (const t of tries) { try { return require(t); } catch (e) {} }
  try { return require(path.join(process.env.FAD || '/home/feng/projects/FADsys/backend', 'node_modules', 'mongodb')); }
  catch (e) { console.error('找不到 mongodb 驱动。请加 --nm=/path/to/node_modules 或在 FADsys/backend 下运行。'); process.exit(2); }
}

function loadEnv() {
  // 尽量读 FADsys 的 .env（存在才读，不打印值）
  const base = process.env.FAD || '/home/feng/projects/FADsys/backend';
  for (const f of [path.join(base, '.env'), '.env']) {
    if (fs.existsSync(f)) {
      for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
        const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

(async () => {
  loadEnv();
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('缺少 MONGO_URI 环境变量'); process.exit(2); }
  const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
  const dbName = arg('db') || 'GHA';
  const collName = arg('coll') || 'Teachers';
  const nameField = arg('name-field') || 'Name';
  const emailField = arg('email-field') || 'email';

  const { MongoClient } = loadMongo();
  const c = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await c.connect();
  const coll = c.db(dbName).collection(collName);
  const total = await coll.estimatedDocumentCount();
  console.log(`连接成功：${dbName}.${collName}  共 ${total} 条`);

  const sample = await coll.find({}).limit(1).next();
  console.log('字段:', sample ? Object.keys(sample).join(', ') : '(空集合)');
  if (!sample) process.exit(1);

  const hasName = await coll.countDocuments({ [nameField]: { $exists: true } });
  const hasEmail = await coll.countDocuments({ [emailField]: { $exists: true } });
  console.log(`有 ${nameField} 的: ${hasName}   有 ${emailField} 的: ${hasEmail}`);
  console.log('样例 3 条:');
  for (const d of await coll.find({}).limit(3).toArray())
    console.log('   ', JSON.stringify({ [nameField]: d[nameField], [emailField]: d[emailField], Group: d.Group }));

  const names = process.env.OH_NAMES.split(',');
  console.log('\n=== Office Hour 姓名 → 教师表匹配 ===');
  let ok = 0, miss = [], dup = [];
  for (const n of names) {
    const hits = await coll.find({ [nameField]: n }, { projection: { [nameField]: 1, [emailField]: 1 } }).toArray();
    if (hits.length === 1) { ok++; console.log(`  ✓ ${n}  →  ${hits[0][emailField]}`); }
    else if (hits.length === 0) { miss.push(n); console.log(`  ✗ ${n}  教师表里按 ${nameField} 查不到`); }
    else { dup.push([n, hits.length]); console.log(`  ⚠ ${n}  命中 ${hits.length} 条，姓名不唯一！`); }
  }
  console.log(`\n可唯一对上: ${ok}/${names.length}    查不到: ${miss.length}    重名: ${dup.length}`);
  if (miss.length) console.log('查不到:', miss.join(', '));
  if (dup.length) console.log('重名:', dup.map(d => d.join('×')).join(', '));
  console.log('\n结论建议:', ok === names.length && !dup.length
    ? '姓名可唯一定位 → 但归属主键仍应用 email，姓名只做显示'
    : '姓名不足以定位 → 必须建一张 姓名→email 的人工映射表再做 seed');
  await c.close();
})().catch(e => { console.error('出错:', e.message); process.exit(1); });
"""

js_path = Path("/tmp/_check_teacher_identity.js")
js_path.write_text(JS, encoding="utf-8")
js_path.chmod(0o644)

env = dict(**{})
names = ",".join(OH_NAMES)
cmd = ["node", str(js_path)] + sys.argv[1:]
print(f"# 将在教师表里核对 {len(OH_NAMES)} 个姓名\n")
r = subprocess.run(cmd, env={**__import__("os").environ, "OH_NAMES": names})
sys.exit(r.returncode)
