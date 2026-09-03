import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;
let connecting;

/**
 * 懒连接 + 全局复用（与 FADsys / server 相同）：
 * 首次调用建连，之后复用；失败时清空 connecting 以便下个请求重试。
 */
export async function connectDb() {
  if (client) return client;
  if (connecting) return connecting;

  connecting = (async () => {
    const c = new MongoClient(config.mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });
    await c.connect();
    client = c;
    await ensureIndexes();
    console.log(`[db] MongoDB connected: ${config.dbName}`);
    return c;
  })();

  try {
    return await connecting;
  } catch (err) {
    connecting = null;
    throw err;
  }
}

/**
 * 唯一约束：
 *  1) 一个班一个时段只能有一条值班 —— 不重复、不翻倍
 *  2) 一个老师一个时段只能在一个班 —— 完全自助新增后这是最关键的护栏，
 *     否则老师可以把自己排进同一节课的两个班
 * 建索引失败（存量数据已违反）不能把整个 API 带崩：记录 loudly 后继续，
 * 路由层的冲突检查仍然会跑，索引只是并发下最后的兵底。
 */
async function ensureIndexes() {
  // 注意：必须在连上库之后才取 collection（collections.* 是依赖 client 的 getter）
  const want = [
    [collections.officeHours, { term: 1, day: 1, period: 1, cls: 1 },
      { unique: true, name: 'uniq_term_day_period_cls' }, '同一班同一节出现了两条值班'],
    [collections.officeHours, { teacherEmail: 1, term: 1, day: 1, period: 1 },
      { unique: true, name: 'uniq_teacher_term_day_period' }, '有老师在相同时段被排进了两个班'],
    [collections.officeHours, { teacherEmail: 1, term: 1 }, { name: 'teacher_term' }, ''],
    [collections.deletions, { term: 1, day: 1, period: 1, cls: 1 },
      { unique: true, name: 'uniq_deleted_slot' }, ''],
    [collections.classes, { cls: 1 }, { unique: true, name: 'uniq_class' }, ''],
    [collections.audit, { at: -1 }, { name: 'recent' }, ''],
  ];
  for (const [coll, keys, opts, hint] of want) {
    try {
      await coll.createIndex(keys, opts);
    } catch (err) {
      console.error(`[db] ⚠️ 索引 ${opts.name || JSON.stringify(keys)} 创建失败（${err.code || err.name}）` +
        (err.code === 11000 && hint ? `：${hint}。请先清理存量重复数据，否则并发下可能写进重复记录` : `：${err.message}`));
    }
  }

  // 班级注册表为空时从现有数据补一次，免得上线后老师选不到本学期的班
  try {
    if ((await collections.classes.countDocuments()) === 0) {
      const seen = await collections.officeHours.distinct('cls', {});
      if (seen.length) {
        await collections.classes.bulkWrite(seen.filter(Boolean).map((cls) => ({
          updateOne: { filter: { cls }, update: { $set: { cls, seenAt: new Date() } }, upsert: true },
        })));
        console.log(`[db] 班级注册表初始化：${seen.length} 个班级`);
      }
    }
  } catch (err) {
    console.error('[db] ⚠️ 班级注册表初始化失败（不阻断启动）:', err.message);
  }
}

export function db() {
  if (!client) throw new Error('数据库尚未连接');
  return client.db(config.dbName);
}

/** 教师表可能在另一个库，单独取；同库时返回同一个 db */
export function teacherDb() {
  if (!client) throw new Error('数据库尚未连接');
  return config.teacherDbName === config.dbName ? client.db(config.dbName) : client.db(config.teacherDbName);
}

export async function closeDb() {
  if (!client) return;
  const c = client;
  client = null;
  connecting = null;
  await c.close();
}

export const collections = {
  get teachers() {
    return teacherDb().collection(config.collections.teachers);
  },
  get officeHours() {
    return db().collection(config.collections.officeHours);
  },
  get audit() {
    return db().collection(config.collections.audit);
  },
  get deletions() {
    return db().collection(config.collections.deletions);
  },
  get classes() {
    return db().collection(config.collections.classes);
  },
};
