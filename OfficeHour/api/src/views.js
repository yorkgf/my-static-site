import { collections } from './db.js';

/**
 * 输出裁剪：数据库文档 → 对外 JSON。
 * 学生端默认**不返回教师邮箱**（避免被爬去群发），
 * 只有老师看自己 / 管理员看全部时才带上。
 */
export function toPublic(doc, { withEmail = false } = {}) {
  const out = {
    id: String(doc._id),
    day: doc.day,
    period: doc.period,
    cls: doc.cls,
    teacherName: doc.teacherName,
    room: doc.room,
    time: doc.time || '',
    note: doc.note || '',
    source: doc.source || 'excel',
    // 前端靠它区分“排班表给我的”和“我自己加的”：前者删了会记碑，要提醒老师
    fromExcel: doc.fromExcel !== undefined ? !!doc.fromExcel : doc.source === 'excel',
    updatedAt: doc.updatedAt || null,
    updatedByName: doc.updatedByName || '',
  };
  if (withEmail) out.teacherEmail = doc.teacherEmail;
  return out;
}

/** 每次写操作留痕，便于「谁把教室改错了」这类问题回溯 */
export async function writeAudit(entry) {
  try {
    await collections.audit.insertOne({
      at: new Date(),
      action: entry.action,
      email: entry.email || null,
      name: entry.name || null,
      slotId: entry.slotId || null,
      before: entry.before || null,
      after: entry.after || null,
    });
  } catch (err) {
    // 审计写失败不应该让业务请求失败，但要能在日志里看到
    console.error('[audit] 写入失败:', err.message);
  }
}
