import { createApp } from './app.js';
import { connectDb } from './db.js';
import { config } from './config.js';

const app = createApp();

// 先启动 HTTP 服务（Web 函数要求尽快监听 9000 端口），数据库懒连接
const server = app.listen(config.port, () => {
  console.log(`[apbusiness-api] listening on port ${config.port}`);
  if (!config.originSecret && config.isProduction) {
    console.warn('[提示] 未设置 ORIGIN_SECRET（SCF 形态下正常，忽略即可）');
  }
});

// 后台尝试连接数据库；失败不阻止启动，请求到来时会自动重试
connectDb().catch((err) => {
  console.error('[db] 启动时连接失败，将在请求时重试:', err.message);
});

const shutdown = async (signal) => {
  console.log(`[${signal}] 正在关闭…`);
  server.close();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
