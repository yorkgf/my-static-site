import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { timingSafeEqual, createHash } from 'node:crypto';
import { collections } from './db.js';
import { config } from './config.js';

/**
 * 登录凭据完全复用 FADsys 的 GHA.Teachers（email + Password），
 * 并且沿用它的「明文密码首次登录成功后自动升级为 bcrypt」行为，
 * 所以老师用平时登 FAD 的那套账号密码就能进来。
 */

export function signToken(user) {
  return jwt.sign({ email: user.email, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** 先试当前密钥，再试旧密钥（密钥轮换期兼容），与 FADsys 的做法一致 */
export function verifyToken(token) {
  for (const secret of [config.jwtSecret, config.jwtSecretOld]) {
    if (!secret) continue;
    try {
      return jwt.verify(token, secret);
    } catch {
      /* 换下一个密钥 */
    }
  }
  return null;
}

function bearer(req) {
  const header = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m ? m[1].trim() : null;
}

/**
 * 校验密码。
 * @returns {Promise<{ok: boolean, needsMigration: boolean}>}
 */
export async function checkPassword(teacher, input) {
  const stored = typeof teacher.Password === 'string' ? teacher.Password : '';
  if (!stored || typeof input !== 'string' || !input) return { ok: false, needsMigration: false };

  if (stored.startsWith('$2')) {
    return { ok: await bcrypt.compare(input, stored), needsMigration: false };
  }

  // 历史明文密码：定长时间比较（FADsys 用的是 ===，这里避免计时侧信道）
  // 先各自过一遍哈希，长度不同也不会提前返回
  const a = createHash('sha256').update(stored).digest();
  const b = createHash('sha256').update(input).digest();
  const ok = timingSafeEqual(a, b);
  return { ok, needsMigration: ok };
}

/** 明文 → bcrypt 自动升级；失败不阻断登录，只记日志 */
export async function upgradePassword(teacher, plaintext) {
  const hashed = await bcrypt.hash(plaintext, 10);
  await collections.teachers.updateOne(
    { email: teacher.email },
    { $set: { Password: hashed } }
  );
  console.log(`[auth] 已把明文密码升级为 bcrypt: ${teacher.email}`);
}

/**
 * 鉴权中间件：验签后**回查教师表**（与 FADsys authMiddleware 一致），
 * 这样账号被删/改组立即生效，不依赖 token 里的旧角色。
 */
export async function requireAuth(req, res, next) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: '请先登录' });

  const decoded = verifyToken(token);
  if (!decoded || !decoded.email) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  let teacher;
  try {
    teacher = await collections.teachers.findOne(
      { email: decoded.email },
      { projection: { email: 1, Name: 1, Group: 1, forcePasswordChange: 1 } }
    );
  } catch (err) {
    console.error('[auth] 回查教师表失败:', err.message);
    return res.status(503).json({ error: '服务暂时不可用，请稍后重试' });
  }

  if (!teacher) return res.status(401).json({ error: '账号不存在或已停用，请联系管理员' });

  req.user = publicUser(teacher);
  return next();
}

/**
 * 可选登录：解析成功就把 req.user 填上，失败/未登录一律静默放行。
 * 用于公开读接口——管理员能看到教师邮箱，游客看不到。
 */
export async function attachOptionalUser(req, _res, next) {
  const token = bearer(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.email) {
      try {
        const teacher = await collections.teachers.findOne(
          { email: decoded.email },
          { projection: { email: 1, Name: 1, Group: 1 } }
        );
        if (teacher) req.user = publicUser(teacher);
      } catch { /* 忽略：按未登录处理 */ }
    }
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
  return next();
}

/** 教师文档 → 不含任何凭据字段的用户对象 */
export function publicUser(teacher) {
  const group = (teacher.Group || '').toUpperCase();
  return {
    email: teacher.email,
    name: teacher.Name || '',
    group,
    isAdmin: config.adminGroups.includes(group),
  };
}
