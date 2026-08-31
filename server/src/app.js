import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { requireOriginSecret } from './auth.js';
import { connectDb } from './db.js';
import { groupsRouter } from './routes/groups.js';
import { teacherRouter } from './routes/teacher.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // 放在 nginx/EdgeOne 反代之后
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  // CORS：允许所有来源（与 FADsys 相同；学生页面部署在 EdgeOne Pages）
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  // 全局限流：每个 IP 每分钟最多 120 次请求
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: '请求过于频繁，请稍后再试' },
    })
  );

  // 登录/创建接口更严格的限流，防止密码爆破
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '尝试次数过多，请 15 分钟后再试' },
  });

  // 根路径：SCF 健康检查/直连时返回服务信息
  app.get('/', (_req, res) =>
    res.json({ service: 'apbusiness-groups-api', status: 'ok' })
  );
  // 健康检查不依赖数据库，用于区分"函数是否正常"和"数据库网络是否通"
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api', requireOriginSecret);

  // 业务接口：确保数据库已连接（与 FADsys 相同的懒连接模式）
  app.use('/api', async (req, res, next) => {
    try {
      await connectDb();
      return next();
    } catch (err) {
      console.error('[db] 连接失败:', err.message);
      return res.status(503).json({ error: '数据库暂时无法连接，请稍后重试' });
    }
  });
  app.post('/api/groups', authLimiter);
  app.post('/api/groups/login', authLimiter);
  app.post('/api/teacher/login', authLimiter);

  app.use('/api/groups', groupsRouter);
  app.use('/api/teacher', teacherRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: '接口不存在' }));

  // 统一错误处理
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: '请求数据格式不正确' });
    }
    console.error('[error]', err);
    return res.status(500).json({ error: '服务器内部错误，请稍后再试' });
  });

  return app;
}
