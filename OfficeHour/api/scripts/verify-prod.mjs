#!/usr/bin/env node
/**
 * 一次性核验（只读）：确认「教师完全自助」所需的结构在生产库里都到位了。
 *   node OfficeHour/api/scripts/verify-prod.mjs
 * 不写任何数据；教师表条数应与改造前一致（46）。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

const HERE = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(HERE, '../.env') });

if (!process.env.MONGO_URI) {
  console.error('❌ 缺少 MONGO_URI');
  process.exit(2);
}

const DB = process.env.DB_NAME || 'GHA';
const COLL = process.env.OFFICEHOURS_COLLECTION || 'Office_Hours';
const client = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const db = client.db(DB);
  let bad = 0;
  const say = (name, ok, detail) => { console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? '  → ' + detail : ''}`); if (!ok) bad += 1; };

  const idx = await db.collection(COLL).indexes();
  const names = idx.map(i => i.name);
  const partialOk = (n) => {
    const i = idx.find(x => x.name === n);
    return !!i && i.unique === true && !!i.partialFilterExpression && i.partialFilterExpression.anchored === true;
  };
  say('班级唯一约束 uniq_term_day_period_cls', names.includes('uniq_term_day_period_cls'));
  say('教师时段唯一约束 uniq_teacher_term_day_period',
      idx.some(i => i.name === 'uniq_teacher_term_day_period' && i.unique === true),
      '自助新增防撞车的关键索引');
  // 两条唯一约束都必须是 partial（只管 anchored=true 的节次型），否则自定时间记录会被误撞
  say('两条唯一约束都是部分索引（不管自定时间行）',
      partialOk('uniq_term_day_period_cls') && partialOk('uniq_teacher_term_day_period'));
  say('重叠判定用的 term_day 索引存在', names.includes('term_day'));

  const total = await db.collection(COLL).countDocuments();
  const flagged = await db.collection(COLL).countDocuments({ fromExcel: true });
  const anchored = await db.collection(COLL).countDocuments({ anchored: true });
  say('排班记录都在', total > 0, `${total} 条`);
  say('fromExcel 已回填（删除防复活依赖它）', total > 0 && flagged === total, `${flagged}/${total}`);
  say('anchored 已回填（否则节次型记录不受唯一约束保护）', total > 0 && anchored === total, `${anchored}/${total}`);

  const classes = await db.collection('Office_Hour_Classes').countDocuments();
  say('班级注册表已建立', classes > 0, `${classes} 个班级`);

  const tomb = await db.collection('Office_Hour_Deletions').countDocuments();
  say('删除碑表可查询（当前无人删过）', tomb === 0, `${tomb} 条`);

  const teachers = await db.collection('Teachers').countDocuments();
  say('教师表未被改动', teachers === 46, `${teachers} 条`);

  const top = await db.collection(COLL).aggregate([
    { $group: { _id: '$teacherEmail', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 1 },
  ]).toArray();
  say('没有老师超过自助上限', (top[0]?.n ?? 0) <= 12, `单人最多 ${top[0]?.n ?? 0} 条 / 上限 12`);

  console.log(`\n${bad ? '❌' : '✅'} 生产库核验: ${bad === 0 ? '全部通过' : bad + ' 项未通过'}`);
  process.exitCode = bad ? 1 : 0;
} finally {
  await client.close();
}
