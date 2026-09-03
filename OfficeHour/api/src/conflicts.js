import { collections } from './db.js';
import { config } from './config.js';

/**
 * 放开「老师完全自助增删改」之后，真正会出事的两件事都在这里拦：
 *   1) 撞车 —— 同一个班同一节被两个人占，或同一个老师同一节被排进两个班
 *   2) 复活 —— 老师删掉了 Excel 来源的排班，下次 seed 又把它导回来，
 *      等于老师的删除被静默撤销（以前只有管理员能改表，不存在这个问题）
 */

const where = (d) => `${d.day}第${d.period}节 ${d.cls}`;

/**
 * 写入前查冲突。返回 null = 没问题；返回字符串 = 给用户看的中文原因。
 * excludeId：改自己这条时，不能把自己当成冲突。
 * subjectName：老师改自己的值班时用“你”；管理员给别人排班时要换成那人姓氏，
 *              否则会出现“你已在 X 值班”这种对着管理员说的话。
 */
export async function findSlotConflict({ term, day, period, cls, teacherEmail, excludeId = null, subjectName = '' }) {
  const docs = await collections.officeHours
    .find({ term, day, period })
    .toArray();
  const who = subjectName || '你';

  // 两类冲突都要报，但“这个班已经有别人”更能指导行动（去找那个人协调），
  // 所以先扫完这一类，再报“你自己同一时段已经排了别的班”。
  for (const d of docs) {
    if (excludeId && String(d._id) === String(excludeId)) continue;
    if (d.cls === cls && d.teacherEmail !== teacherEmail) {
      return `「${where(d)}」已由 ${d.teacherName || '其他老师'} 值班，换班请先与对方确认`;
    }
  }
  for (const d of docs) {
    if (excludeId && String(d._id) === String(excludeId)) continue;
    if (d.teacherEmail !== teacherEmail) continue;
    if (d.cls === cls) return `${who}已经有一条「${where(d)}」的值班，不用重复添加`;
    return `${who}同一时段已经在「${where(d)}」值班，不能同时占两个班`;
  }
  return null;
}

/**
 * 老师能选的班级清单 = 班级注册表 ∪ 历史上出现过的 ∪ 被删碑记住的 ∪ 环境变量补充的。
 * 绝不能只取“本学期现有记录里的 distinct cls”：老师把某个班的最后一条改走后，
 * 那个班就从清单上消失了，他再也换不回去（实际踩过）。
 * 注：GHA.All_Classes 用的是中文班名（“十二年级1班”），与排班表的 G10-1 不同一套命名，
 *     不能拿来当这个清单。
 */
export async function knownClasses(term) {
  const [reg, anyTerm, deleted] = await Promise.all([
    collections.classes.distinct('cls', {}),
    collections.officeHours.distinct('cls', { term: term || { $exists: true } }),
    collections.deletions.distinct('cls', {}),
  ]);
  return [...new Set([...reg, ...anyTerm, ...deleted, ...config.extraClasses])].filter(Boolean).sort();
}

/** 见过的班级全部归档到注册表，这样它以居不会因“最后一条被改走”而消失 */
export async function rememberClasses(list, term = '') {
  const names = [...new Set((list || []).filter(Boolean))];
  if (!names.length) return;
  try {
    await collections.classes.bulkWrite(names.map((cls) => ({
      updateOne: { filter: { cls }, update: { $set: { cls, term, seenAt: new Date() }, $setOnInsert: { firstSeenAt: new Date() } }, upsert: true },
    })));
  } catch (err) {
    console.error('[classes] 班级归档失败（不阻断写入）:', err.message);
  }
}

/** 同一节课里该班已有谁在值班（管理员改归属前想看一眼时用） */
export async function classHolders({ term, day, period, cls }) {
  return collections.officeHours
    .find({ term, day, period, cls })
    .toArray();
}

/**
 * 老师删掉了一条“排班表来的”值班（wasSeeded）→ 记一块碑，让下次导入跳过这个格子。
 * 老师自己新增的行不在 Excel 里，删了不用记碑。
 */
export async function recordDeletion(doc, { email, name }) {
  const key = { term: doc.term, day: doc.day, period: doc.period, cls: doc.cls };
  await collections.deletions.updateOne(key, {
    $set: {
      ...key,
      teacherEmail: doc.teacherEmail,
      teacherName: doc.teacherName,
      room: doc.room || '',
      removedBy: email,
      removedByName: name,
      removedAt: new Date(),
    },
  }, { upsert: true });
}

/**
 * 这条记录是不是从排班表（Excel/导入）来的？用它决定删后要不要记碑。
 * 不能用 source —— source 是“最后一次谁改的”，老师改个教室就变成 teacher 了，
 * 但它本质上仍是 Excel 里的一行，下次导入照样会复活。
 * 所以下写入时都带一个不可变的 fromExcel；没这个字段的存量数据退回看 source。
 */
export const wasSeeded = (doc) => (doc && doc.fromExcel !== undefined ? !!doc.fromExcel : doc && doc.source === 'excel');

/** 老师又把这个格子占回来了 → 撤碑，以后 Excel 该覆盖就覆盖 */
export async function clearDeletion({ term, day, period, cls }) {
  const r = await collections.deletions.deleteOne({ term, day, period, cls });
  return r.deletedCount > 0;
}

/** 一批格子里哪些被老师删过（seed / 导入用一次查询取回，别 N+1） */
export async function deletedKeySet(term, slots) {
  const keys = slots.map((s) => ({ term, day: s.day, period: s.period, cls: s.cls }));
  if (!keys.length) return new Set();
  const docs = await collections.deletions.find({ $or: keys }).toArray();
  return new Set(docs.map((d) => slotKey(d)));
}

export const slotKey = (d) => `${d.term}|${d.day}|${d.period}|${d.cls}`;
