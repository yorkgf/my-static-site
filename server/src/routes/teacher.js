import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../db.js';
import {
  signTeacherToken,
  requireRole,
  isTeacherPassword,
} from '../auth.js';
import { validateAssignment, validateScores } from '../validation.js';
import { buildAllGroupsView, buildGroupView } from '../views.js';

export const teacherRouter = Router();

function parseObjectId(value) {
  if (typeof value === 'string' && ObjectId.isValid(value)) return new ObjectId(value);
  return null;
}

// POST /api/teacher/login — 老师密码登录
teacherRouter.post('/login', (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!isTeacherPassword(password)) {
    return res.status(401).json({ error: '老师密码不正确' });
  }
  return res.json({ token: signTeacherToken() });
});

// 以下所有路由都需要老师令牌
teacherRouter.use(requireRole('teacher'));

// GET /api/teacher/groups — 查看所有小组（含任务与分数）
teacherRouter.get('/groups', async (_req, res, next) => {
  try {
    return res.json({ groups: await buildAllGroupsView() });
  } catch (err) {
    return next(err);
  }
});

// POST /api/teacher/groups/:id/assignments — 给小组分配项目
teacherRouter.post('/groups/:id/assignments', async (req, res, next) => {
  try {
    const groupId = parseObjectId(req.params.id);
    if (!groupId) return res.status(400).json({ error: '小组 ID 不正确' });

    const group = await collections.groups.findOne({ _id: groupId });
    if (!group) return res.status(404).json({ error: '小组不存在' });

    const { errors, value } = validateAssignment(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const assignment = {
      groupId,
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
      createdAt: new Date(),
    };
    const result = await collections.assignments.insertOne(assignment);
    assignment._id = result.insertedId;

    return res.status(201).json({
      group: await buildGroupView(group),
      assignmentId: result.insertedId.toString(),
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/teacher/assignments/:id/scores — 按项目给每个成员打分
teacherRouter.post('/assignments/:id/scores', async (req, res, next) => {
  try {
    const assignmentId = parseObjectId(req.params.id);
    if (!assignmentId) return res.status(400).json({ error: '项目 ID 不正确' });

    const assignment = await collections.assignments.findOne({ _id: assignmentId });
    if (!assignment) return res.status(404).json({ error: '项目任务不存在' });

    const group = await collections.groups.findOne({ _id: assignment.groupId });
    if (!group) return res.status(404).json({ error: '小组不存在' });

    const { errors, scores } = validateScores(req.body, group.members);
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const now = new Date();
    for (const s of scores) {
      const member = group.members.find((m) => m.id === s.memberId);
      await collections.scores.updateOne(
        { assignmentId, memberId: s.memberId },
        {
          $set: {
            assignmentId,
            groupId: group._id,
            memberId: s.memberId,
            memberName: member ? member.name : s.memberId,
            score: s.score,
            comment: s.comment,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    }

    const updatedGroup = await collections.groups.findOne({ _id: group._id });
    return res.json({ group: await buildGroupView(updatedGroup) });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/teacher/groups/:id — 锁定/解锁小组信息修改
teacherRouter.patch('/groups/:id', async (req, res, next) => {
  try {
    const groupId = parseObjectId(req.params.id);
    if (!groupId) return res.status(400).json({ error: '小组 ID 不正确' });

    const locked = req.body?.locked === true;
    const result = await collections.groups.updateOne(
      { _id: groupId },
      { $set: { locked, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: '小组不存在' });

    const group = await collections.groups.findOne({ _id: groupId });
    return res.json({ group: await buildGroupView(group) });
  } catch (err) {
    return next(err);
  }
});
