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
