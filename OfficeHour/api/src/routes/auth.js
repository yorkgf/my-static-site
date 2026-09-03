import { Router } from 'express';
import { collections } from '../db.js';
import { signToken, checkPassword, upgradePassword, requireAuth, publicUser } from '../auth.js';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * 用 GHA.Teachers 的 email + Password 校验，与 FADsys 同一张表、同一套哈希，
 * 所以老师不需要再注册一次账号。
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const emailInput = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!emailInput || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }
    if (password.length > 200) return res.status(400).json({ error: '密码过长' });

    // 先按原样查（与 FADsys 一致、走索引），查不到再忽略大小写兜底
    let teacher = await collections.teachers.findOne({ email: emailInput });
    if (!teacher && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      teacher = await collections.teachers.findOne({
        email: { $regex: `^${emailInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      });
    }

    // 账号不存在与密码错误返回同一句话，避免把教师邮箱枚举出来
    if (!teacher) return res.status(401).json({ error: '邮箱或密码不正确' });

    const { ok, needsMigration } = await checkPassword(teacher, password);
    if (!ok) return res.status(401).json({ error: '邮箱或密码不正确' });

    // 明文历史密码：登录成功即升级成 bcrypt（沿用 FADsys 的迁移策略）
    let upgraded = false;
    if (needsMigration) {
      try {
        await upgradePassword(teacher, password);
        upgraded = true;
      } catch (err) {
        console.error('[auth] 密码升级失败（不影响本次登录）:', err.message);
      }
    }

    const user = publicUser(teacher);
    return res.json({
      token: signToken(user),
      user,
      requiresPasswordChange: Boolean(teacher.forcePasswordChange) || upgraded,
    });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/auth/me — 前端用来判断令牌是否还有效 */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
