import { randomUUID } from 'node:crypto';
import { GROUP_RULES as R } from './config.js';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** 校验并归一化小组成员名单，返回 { members, errors } */
export function validateMembers(rawMembers) {
  const errors = [];
  if (!Array.isArray(rawMembers)) {
    return { members: null, errors: ['成员名单格式不正确'] };
  }
  const names = rawMembers
    .map((m) => (typeof m === 'string' ? m.trim() : text(m && m.name)))
    .filter(Boolean);

  if (names.length < R.minMembers) errors.push('小组至少需要 1 名成员');
  if (names.length > R.maxMembers) errors.push(`小组最多 ${R.maxMembers} 名成员`);

  const seen = new Set();
  for (const name of names) {
    if (name.length > R.memberNameMax) {
      errors.push(`成员姓名不能超过 ${R.memberNameMax} 个字符：${name.slice(0, 10)}…`);
    }
    const key = name.toLowerCase();
    if (seen.has(key)) errors.push(`成员姓名重复：${name}`);
    seen.add(key);
  }
  return { members: errors.length ? null : names, errors };
}

/** 创建小组入校校校校验 */
export function validateGroupCreate(body) {
  const errors = [];
  const name = text(body.name);
  const password = text(body.password);
  const projectIdea = text(body.projectIdea);
  const canvasLink = text(body.canvasLink);

  if (name.length < R.nameMin || name.length > R.nameMax) {
    errors.push(`组名长度需在 ${R.nameMin}–${R.nameMax} 个字符之间`);
  }
  if (password.length < R.passwordMin || password.length > R.passwordMax) {
    errors.push(`组密码长度需在 ${R.passwordMin}–${R.passwordMax} 个字符之间`);
  }
  if (projectIdea.length > R.ideaMax) {
    errors.push(`项目选题描述不能超过 ${R.ideaMax} 字`);
  }
  if (canvasLink) {
    if (canvasLink.length > R.linkMax) errors.push('Canvas 链接过长');
    else if (!isValidHttpUrl(canvasLink)) errors.push('Canvas 链接必须是有效的 http(s) 网址');
  }

  const { members, errors: memberErrors } = validateMembers(body.members);
  errors.push(...memberErrors);

  return {
    errors,
    value: {
      name,
      password,
      members: members || [],
      projectIdea,
      canvasLink,
    },
  };
}

/** 学生修改小组信息（所有字段可选） */
export function validateGroupUpdate(body) {
  const errors = [];
  const update = {};

  if (body.projectIdea !== undefined) {
    const projectIdea = text(body.projectIdea);
    if (projectIdea.length > R.ideaMax) errors.push(`项目选题描述不能超过 ${R.ideaMax} 字`);
    else update.projectIdea = projectIdea;
  }

  if (body.canvasLink !== undefined) {
    const canvasLink = text(body.canvasLink);
    if (canvasLink && !isValidHttpUrl(canvasLink)) {
      errors.push('Canvas 链接必须是有效的 http(s) 网址');
    } else if (canvasLink.length > R.linkMax) {
      errors.push('Canvas 链接过长');
    } else {
      update.canvasLink = canvasLink;
    }
  }

  if (body.members !== undefined) {
    const { members, errors: memberErrors } = validateMembers(body.members);
    errors.push(...memberErrors);
    if (members) {
      // 保留客户端传回的已有成员 id（id 由服务端此前签发）
      update.members = members.map((memberName, i) => {
        const raw = Array.isArray(body.members) ? body.members[i] : null;
        const id = text(raw && raw.id);
        return { id: /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : cryptoRandomId(), name: memberName };
      });
    }
  }

  if (body.newPassword !== undefined) {
    const newPassword = text(body.newPassword);
    if (newPassword.length < R.passwordMin || newPassword.length > R.passwordMax) {
      errors.push(`新密码长度需在 ${R.passwordMin}–${R.passwordMax} 个字符之间`);
    } else {
      update.newPassword = newPassword;
    }
  }

  if (!errors.length && Object.keys(update).length === 0) {
    errors.push('没有需要更新的内容');
  }
  return { errors, update };
}

/** 老师分配项目入参校验 */
export function validateAssignment(body) {
  const errors = [];
  const title = text(body.title);
  const description = text(body.description);
  const dueDateRaw = text(body.dueDate);

  if (!title || title.length > R.titleMax) errors.push(`项目标题必填且不超过 ${R.titleMax} 字`);
  if (description.length > R.descriptionMax) {
    errors.push(`项目要求不能超过 ${R.descriptionMax} 字`);
  }

  let dueDate = null;
  if (dueDateRaw) {
    const parsed = new Date(dueDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      errors.push('截止日期格式不正确');
    } else {
      dueDate = parsed;
    }
  }

  return { errors, value: { title, description, dueDate } };
}

/** 老师打分入参校验：scores = [{ memberId, score, comment }] */
export function validateScores(body, groupMembers) {
  const errors = [];
  if (!body || !Array.isArray(body.scores)) {
    return { errors: ['打分数据格式不正确'], scores: null };
  }
  const validIds = new Set(groupMembers.map((m) => m.id));
  const scores = [];

  for (const item of body.scores) {
    if (!item || !validIds.has(item.memberId)) {
      errors.push('存在不属于本小组的成员');
      continue;
    }
    const score = Number(item.score);
    if (item.score === '' || item.score === null || item.score === undefined) {
      // 留空表示该成员本次不打分
      continue;
    }
    if (!Number.isFinite(score) || score < R.scoreMin || score > R.scoreMax) {
      errors.push(`分数必须是 ${R.scoreMin}–${R.scoreMax} 之间的数字`);
      continue;
    }
    const comment = text(item.comment);
    if (comment.length > R.commentMax) {
      errors.push(`评语不能超过 ${R.commentMax} 字`);
      continue;
    }
    scores.push({
      memberId: item.memberId,
      score: Math.round(score * 10) / 10,
      comment,
    });
  }
  return { errors, scores };
}

export function cryptoRandomId() {
  return randomUUID();
}
