import { collections } from './db.js';

function groupPublic(group) {
  return {
    id: group._id.toString(),
    name: group.name,
    members: group.members,
    projectIdea: group.projectIdea || '',
    canvasLink: group.canvasLink || '',
    locked: !!group.locked,
    createdAt: group.createdAt,
  };
}

/** 组装小组详情：小组信息 + 项目任务 + 每个成员的分数 */
export async function buildGroupView(group) {
  const assignments = await collections.assignments
    .find({ groupId: group._id })
    .sort({ dueDate: 1, createdAt: 1 })
    .toArray();

  const assignmentIds = assignments.map((a) => a._id);
  const scores = assignmentIds.length
    ? await collections.scores.find({ assignmentId: { $in: assignmentIds } }).toArray()
    : [];

  const scoreByAssignment = new Map();
  for (const s of scores) {
    const list = scoreByAssignment.get(s.assignmentId.toString()) || [];
    list.push({
      memberId: s.memberId,
      memberName: s.memberName,
      score: s.score,
      comment: s.comment || '',
      updatedAt: s.updatedAt,
    });
    scoreByAssignment.set(s.assignmentId.toString(), list);
  }

  return {
    ...groupPublic(group),
    assignments: assignments.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate,
      createdAt: a.createdAt,
      scores: scoreByAssignment.get(a._id.toString()) || [],
    })),
  };
}

export async function buildAllGroupsView() {
  const groups = await collections.groups.find({}).sort({ createdAt: 1 }).toArray();
  return Promise.all(groups.map(buildGroupView));
}

/**
 * 任务模板视图：每个任务 + 已分配到的小组列表。
 * 通过 assignments 集合中 taskId 字段反查已分配的小组。
 */
export async function buildTasksView() {
  const [tasks, assignments, groups] = await Promise.all([
    collections.tasks.find({}).sort({ createdAt: -1 }).toArray(),
    collections.assignments.find({ taskId: { $exists: true } }).toArray(),
    collections.groups.find({}).toArray(),
  ]);

  const groupNameById = new Map(groups.map((g) => [g._id.toString(), g.name]));
  const assignedByTask = new Map();
  for (const a of assignments) {
    const key = a.taskId.toString();
    const list = assignedByTask.get(key) || [];
    list.push({
      groupId: a.groupId.toString(),
      groupName: groupNameById.get(a.groupId.toString()) || '（已删除小组）',
    });
    assignedByTask.set(key, list);
  }

  return tasks.map((t) => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description || '',
    dueDate: t.dueDate,
    createdAt: t.createdAt,
    assignedGroups: assignedByTask.get(t._id.toString()) || [],
  }));
}

/**
 * 公开视图：所有学生可见的小组榜。
 * 只含组名、成员姓名、项目标题与截止日期；
 * 不含分数/评语、Canvas 链接、选题、密码等任何私密信息。
 */
export async function buildPublicGroupsView() {
  const groups = await collections.groups.find({}).sort({ createdAt: 1 }).toArray();
  const assignments = await collections.assignments
    .find({})
    .sort({ dueDate: 1, createdAt: 1 })
    .toArray();

  const assignmentsByGroup = new Map();
  for (const a of assignments) {
    const list = assignmentsByGroup.get(a.groupId.toString()) || [];
    list.push({ title: a.title, dueDate: a.dueDate });
    assignmentsByGroup.set(a.groupId.toString(), list);
  }

  return groups.map((g) => ({
    id: g._id.toString(),
    name: g.name,
    members: g.members.map((m) => m.name),
    assignments: assignmentsByGroup.get(g._id.toString()) || [],
  }));
}
