import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../db.js';
import { requireRole } from '../auth.js';

export const likesRouter = Router();

function parseObjectId(value) {
  if (typeof value === 'string' && ObjectId.isValid(value)) return new ObjectId(value);
  return null;
}

// POST /api/likes — 登录的小组给另一个小组的项目点赞（每个小组对同一项目只能点一次）
likesRouter.post('/', requireRole('student'), async (req, res, next) => {
  try {
    const toGroupId = parseObjectId(req.body?.toGroupId);
    if (!toGroupId) return res.status(400).json({ error: '目标小组 ID 不正确' });

    const fromGroupId = new ObjectId(req.auth.gid);
    if (fromGroupId.equals(toGroupId)) {
      return res.status(400).json({ error: '不能给自己的小组点赞' });
    }

    const target = await collections.groups.findOne({ _id: toGroupId });
    if (!target) return res.status(404).json({ error: '小组不存在' });

    try {
      await collections.likes.insertOne({
        fromGroupId,
        toGroupId,
        createdAt: new Date(),
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ error: '你已经给这个小组点过赞了' });
      }
      throw err;
    }

    const count = await collections.likes.countDocuments({ toGroupId });
    return res.status(201).json({ ok: true, likes: count });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/likes/:toGroupId — 取消给某小组的点赞
likesRouter.delete('/:toGroupId', requireRole('student'), async (req, res, next) => {
  try {
    const toGroupId = parseObjectId(req.params.toGroupId);
    if (!toGroupId) return res.status(400).json({ error: '目标小组 ID 不正确' });

    const result = await collections.likes.deleteOne({
      fromGroupId: new ObjectId(req.auth.gid),
      toGroupId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '你还没有给这个小组点过赞' });
    }
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
