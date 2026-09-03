import { createApp } from './app.js';
import { connectDb, closeDb } from './db.js';
import { config } from './config.js';

const app = createApp();

// Web 函数要求尽快监听 9000；数据库连接失败不阻止启动，请求到来时自动重试
const server = app.listen(config.port, () => {
  console.log(`[officehour-api] listening on port ${config.port}`);
});

connectDb().catch((err) => {
  console.error('[db] 启动时连接失败，将在请求时重试:', err.message);
});

const shutdown = async (signal) => {
  console.log(`[${signal}] 正在关闭…`);
  server.close();
  try {
    await closeDb();
  } catch {
    /* ignore */
  }
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
