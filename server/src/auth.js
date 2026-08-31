import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'node:crypto';
import { config, GROUP_RULES } from './config.js';

export function signStudentToken(groupId) {
  return jwt.sign({ role: 'student', gid: groupId }, config.jwtSecret, {
    expiresIn: GROUP_RULES.tokenTtl,
  });
}

export function signTeacherToken() {
  return jwt.sign({ role: 'teacher' }, config.jwtSecret, {
    expiresIn: GROUP_RULES.teacherTokenTtl,
  });
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/** 要求请求携带指定角色的 JWT */
export function requireRole(...roles) {
  return (req, res, next) => {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: '请先登录' });
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      if (!roles.includes(payload.role)) {
        return res.status(403).json({ error: '没有权限执行此操作' });
      }
      req.auth = payload;
      return next();
    } catch {
      return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
  };
}

/** 校验 EdgeOne 回源密钥头；未配置密钥时放行（本地开发） */
export function requireOriginSecret(req, res, next) {
  if (!config.originSecret) return next();
  const provided = req.headers['x-origin-secret'] || '';
  const expected = Buffer.from(config.originSecret);
  const got = Buffer.from(String(provided));
  if (
    got.length !== expected.length ||
    !timingSafeEqual(got, expected)
  ) {
    return res.status(403).json({ error: '非法来源' });
  }
  return next();
}

/** 常量时间比较老师密码 */
export function isTeacherPassword(password) {
  const expected = Buffer.from(config.teacherPassword);
  const got = Buffer.from(String(password || ''));
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}
