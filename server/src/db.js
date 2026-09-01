import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;
let connecting;

/**
 * 连接 MongoDB（与 FADsys 相同模式：懒连接 + 全局复用）。
 * 首次调用建立连接，之后直接复用；连接失败时下次请求会重试。
 */
export async function connectDb() {
  if (client) return client;
  if (connecting) return connecting;

  connecting = (async () => {
    const c = new MongoClient(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    await c.connect();
    client = c;
    await ensureIndexes();
    console.log('[db] MongoDB connected:', config.dbName);
    return c;
  })();

  try {
    return await connecting;
  } catch (err) {
    connecting = null; // 允许下次请求重试
    throw err;
  }
}

export function db() {
  if (!client) throw new Error('数据库尚未连接');
  return client.db(config.dbName);
}

export const collections = {
  get groups() {
    return db().collection('groups');
  },
  get assignments() {
    return db().collection('assignments');
  },
  get scores() {
    return db().collection('scores');
  },
  get tasks() {
    return db().collection('tasks');
  },
  get likes() {
    return db().collection('likes');
  },
  get wcSessions() {
    return db().collection('wc_sessions');
  },
  get wcWords() {
    return db().collection('wc_words');
  },
};

async function ensureIndexes() {
  await collections.groups.createIndex({ nameKey: 1 }, { unique: true });
  await collections.assignments.createIndex({ groupId: 1, createdAt: -1 });
  await collections.assignments.createIndex({ taskId: 1 });
  // 每组对同一小组项目只能点赞一次
  await collections.likes.createIndex(
    { fromGroupId: 1, toGroupId: 1 },
    { unique: true }
  );
  await collections.likes.createIndex({ toGroupId: 1 });
  await collections.scores.createIndex(
    { assignmentId: 1, memberId: 1 },
    { unique: true }
  );
  await collections.scores.createIndex({ groupId: 1 });
  await collections.wcSessions.createIndex({ code: 1 }, { unique: true });
  await collections.wcWords.createIndex({ code: 1, key: 1 }, { unique: true });
}

export async function closeDb() {
  if (client) await client.close();
}
