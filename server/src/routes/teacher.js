import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../db.js';
import {
  signTeacherToken,
  requireRole,
  isTeacherPassword,
} from '../auth.js';
import {
  validateAssignment,
  validateTask,
  validateGroupIds,
  validateScores,
} from '../validation.js';
import { buildAllGroupsView, buildGroupView, buildTasksView } from '../views.js';

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

// GET /api/teacher/tasks — 任务模板列表（含已分配的小组）
teacherRouter.get('/tasks', async (_req, res, next) => {
  try {
    return res.json({ tasks: await buildTasksView() });
  } catch (err) {
    return next(err);
  }
});

// POST /api/teacher/tasks — 创建任务模板（内容 + 截止日期，可同时选择分配小组）
teacherRouter.post('/tasks', async (req, res, next) => {
  try {
    const { errors, value } = validateTask(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const now = new Date();
    const task = {
      title: value.title,
      description: value.description,
      dueDate: value.dueDate,
      createdAt: now,
    };
    const result = await collections.tasks.insertOne(task);
    task._id = result.insertedId;

    // 若同时携带 groupIds，则创建后直接分配给这些小组
    let assigned = [];
    if (Array.isArray(req.body?.groupIds) && req.body.groupIds.length) {
      const { errors: idErrors, groupIds } = validateGroupIds(req.body);
      if (idErrors.length) return res.status(400).json({ error: idErrors.join('；') });
      const groups = await collections.groups
        .find({ _id: { $in: groupIds } })
        .toArray();
      if (groups.length !== groupIds.length) {
        return res.status(400).json({ error: '存在不存在的的小组' });
      }
      const docs = groups.map((g) => ({
        taskId: task._id,
        groupId: g._id,
        title: value.title,
        description: value.description,
        dueDate: value.dueDate,
        createdAt: now,
      }));
      if (docs.length) await collections.assignments.insertMany(docs);
      assigned = groups.map((g) => ({ groupId: g._id.toString(), groupName: g.name }));
    }

    return res.status(201).json({
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        assignedGroups: assigned,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/teacher/tasks/:id/assign — 把任务分配给一个或多个小组
// 重复分配同一小组会自动去重（跳过已分配过的小组）
teacherRouter.post('/tasks/:id/assign', async (req, res, next) => {
  try {
    const taskId = parseObjectId(req.params.id);
    if (!taskId) return res.status(400).json({ error: '任务 ID 不正确' });

    const task = await collections.tasks.findOne({ _id: taskId });
    if (!task) return res.status(404).json({ error: '任务不存在' });

    const { errors, groupIds } = validateGroupIds(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const groups = await collections.groups
      .find({ _id: { $in: groupIds } })
      .toArray();
    if (groups.length !== groupIds.length) {
      return res.status(400).json({ error: '存在不存在的的小组' });
    }

    // 跳过已分配过的小组，避免重复
    const existing = await collections.assignments
      .find({ taskId, groupId: { $in: groupIds } })
      .toArray();
    const existingSet = new Set(existing.map((a) => a.groupId.toString()));

    const now = new Date();
    const docs = groups
      .filter((g) => !existingSet.has(g._id.toString()))
      .map((g) => ({
        taskId,
        groupId: g._id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        createdAt: now,
      }));
    if (docs.length) await collections.assignments.insertMany(docs);

    const tasks = await buildTasksView();
    const updated = tasks.find((t) => t.id === taskId.toString());
    return res.json({
      task: updated || null,
      skipped: existingSet.size,
      assignedCount: docs.length,
    });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/teacher/tasks/:id — 删除任务模板及其所有分配记录（不删除分数）
teacherRouter.delete('/tasks/:id', async (req, res, next) => {
  try {
    const taskId = parseObjectId(req.params.id);
    if (!taskId) return res.status(400).json({ error: '任务 ID 不正确' });

    const task = await collections.tasks.findOne({ _id: taskId });
    if (!task) return res.status(404).json({ error: '任务不存在' });

    const assignmentDocs = await collections.assignments
      .find({ taskId })
      .toArray();
    const assignmentIds = assignmentDocs.map((a) => a._id);
    if (assignmentIds.length) {
      await collections.scores.deleteMany({ assignmentId: { $in: assignmentIds } });
    }
    await collections.assignments.deleteMany({ taskId });
    await collections.tasks.deleteOne({ _id: taskId });

    return res.json({ ok: true });
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
