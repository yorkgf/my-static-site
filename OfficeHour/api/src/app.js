import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { connectDb } from './db.js';
import { authRouter } from './routes/auth.js';
import { officeHoursRouter } from './routes/officehours.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // 位于 SCF / EdgeOne 之后
  app.use(helmet());
  app.use(express.json({ limit: '200kb' }));

  // 与 FADsys / server 保持一致：放行所有来源（学生页面在 EdgeOne Pages）
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  // 学生端会频繁刷新课表，读接口限流放宽；写接口和登录严格
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: Number(process.env.READ_RATE_MAX || 600),
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: '请求过于频繁，请稍后再试' },
    })
  );

  const loginLimiter = rateLimit({
    windowMs: config.limits.loginWindowMs,
    max: config.limits.loginPerWindow,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '尝试次数过多，请 15 分钟后再试' },
  });

  const writeLimiter = rateLimit({
    windowMs: config.limits.writeWindowMs,
    max: config.limits.writePerWindow,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '保存过于频繁，请稍后再试' },
  });

  app.get('/', (_req, res) =>
    res.json({ service: 'officehour-api', status: 'ok', term: config.term })
  );
  // 健康检查不碰数据库，用于区分「函数没起来」和「数据库网络不通」
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // 业务接口前先确保数据库已连（懒连接）
  app.use('/api', async (req, res, next) => {
    try {
      await connectDb();
      return next();
    } catch (err) {
      console.error('[db] 连接失败:', err.message);
      return res.status(503).json({ error: '数据库暂时无法连接，请稍后重试' });
    }
  });

  app.post('/api/auth/login', loginLimiter);
  app.use('/api/auth', authRouter);

  // 写接口严格限流；学生轮询用的 GET 不受此限制
  app.use(
    '/api/officehours',
    (req, res, next) => (req.method === 'GET' ? next() : writeLimiter(req, res, next))
  );
  app.use('/api/officehours', officeHoursRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: '接口不存在' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: '请求数据格式不正确' });
    }
    // 唯一索引是并发下的最后兵底：绝不能把它撞出来的 11000 变成裸 500
    if (err && err.code === 11000) {
      const msg = String(err.errmsg || '');
      return res.status(409).json({
        error: msg.includes('uniq_teacher')
          ? '这位老师在同一时段已经有别的值班，不能同时占两个班'
          : '该班级在这一节已经有值班记录了',
      });
    }
    console.error('[error]', err);
    return res.status(500).json({ error: '服务器内部错误，请稍后再试' });
  });

  return app;
}
