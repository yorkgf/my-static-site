import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { collections } from '../db.js';
import { signStudentToken, requireRole } from '../auth.js';
import {
  validateGroupCreate,
  validateGroupUpdate,
  cryptoRandomId,
} from '../validation.js';
import { buildGroupView } from '../views.js';

export const groupsRouter = Router();

const BCRYPT_ROUNDS = 10;

async function findGroupByName(name) {
  return collections.groups.findOne({ nameKey: name.trim().toLowerCase() });
}

// POST /api/groups — 创建小组
groupsRouter.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateGroupCreate(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const passwordHash = await bcrypt.hash(value.password, BCRYPT_ROUNDS);
    const now = new Date();
    const group = {
      name: value.name,
      nameKey: value.name.toLowerCase(),
      passwordHash,
      members: value.members.map((name) => ({ id: cryptoRandomId(), name })),
      projectIdea: value.projectIdea,
      canvasLink: value.canvasLink,
      locked: false,
      createdAt: now,
    };

    const result = await collections.groups.insertOne(group);
    group._id = result.insertedId;

    const token = signStudentToken(group._id.toString());
    return res.status(201).json({ token, group: await buildGroupView(group) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: '这个组名已经被使用了，请换一个' });
    }
    return next(err);
  }
});

// POST /api/groups/login — 小组登录
groupsRouter.post('/login', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!name || !password) {
      return res.status(400).json({ error: '请输入组名和组密码' });
    }
    const group = await findGroupByName(name);
    if (!group) return res.status(401).json({ error: '组名或密码不正确' });

    const ok = await bcrypt.compare(password, group.passwordHash);
    if (!ok) return res.status(401).json({ error: '组名或密码不正确' });

    const token = signStudentToken(group._id.toString());
    return res.json({ token, group: await buildGroupView(group) });
  } catch (err) {
    return next(err);
  }
});

// GET /api/groups/me — 查看本组信息（含项目与个人分数）
groupsRouter.get('/me', requireRole('student'), async (req, res, next) => {
  try {
    const group = await collections.groups.findOne({ _id: new ObjectId(req.auth.gid) });
    if (!group) return res.status(404).json({ error: '小组不存在' });
    return res.json({ group: await buildGroupView(group) });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/groups/me — 修改本组信息（锁定后禁止）
groupsRouter.patch('/me', requireRole('student'), async (req, res, next) => {
  try {
    const group = await collections.groups.findOne({ _id: new ObjectId(req.auth.gid) });
    if (!group) return res.status(404).json({ error: '小组不存在' });
    if (group.locked) {
      return res.status(403).json({ error: '小组信息已被老师锁定，如需修改请联系老师' });
    }

    const { errors, update } = validateGroupUpdate(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const set = { updatedAt: new Date() };
    if (update.projectIdea !== undefined) set.projectIdea = update.projectIdea;
    if (update.canvasLink !== undefined) set.canvasLink = update.canvasLink;
    if (update.members) set.members = update.members;
    if (update.newPassword) {
      set.passwordHash = await bcrypt.hash(update.newPassword, BCRYPT_ROUNDS);
    }

    await collections.groups.updateOne({ _id: group._id }, { $set: set });
    const updated = await collections.groups.findOne({ _id: group._id });
    return res.json({ group: await buildGroupView(updated) });
  } catch (err) {
    return next(err);
  }
});
