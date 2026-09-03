import { collections } from './db.js';
import { config } from './config.js';
import { windowOf, overlaps, parseRange, toHHMM } from './timewindow.js';

/**
 * 放开「老师完全自助增删改」之后，真正会出事的两件事都在这里拦：
 *   1) 撞车 —— 同一个班同一节被两个人占，或同一个老师同一节被排进两个班
 *   2) 复活 —— 老师删掉了 Excel 来源的排班，下次 seed 又把它导回来，
 *      等于老师的删除被静默撤销（以前只有管理员能改表，不存在这个问题）
 */

/** 节次 → 时间窗口，从现有节次型记录里聚出来（课表里没有第二张时间表） */
export async function periodTable(term) {
  const docs = await collections.officeHours
    .find({ term, period: { $ne: null } }, { projection: { period: 1, time: 1 } })
    .toArray();
  const table = new Map();
  for (const d of docs) {
    const w = parseRange(d.time);
    const p = Number(d.period);
    if (w && Number.isFinite(p) && !table.has(p)) table.set(p, w);
  }
  return table;
}

/** 给人看的时段描述：“周一第10节 18:30–19:20” / “周一 16:30–17:30（自定时间）” */
export function describeSlot(d, table) {
  const w = windowOf(d, table);
  if (!w) return `${d.day}第${d.period}节 ${d.cls}`;
  const range = `${toHHMM(w.start)}–${toHHMM(w.end)}`;
  return w.kind === 'period' && w.period !== null
    ? `${d.day}第${w.period}节 ${range}`
    : `${d.day} ${range}（自定时间）`;
}

/**
 * 写入前查冲突，按**时间区间重叠**而不是节次编号。
 * 返回 null = 没问题；字符串 = 给用户看的中文原因。
 * @param when  候选时间（{period} 或 {start,end}）；也允许传整条记录
 * @param table 可选预先拿好的节次表（批量导入时只查一次）
 */
export async function findSlotConflict({ term, day, cls, teacherEmail, when, excludeId = null, subjectName = '', table = null }) {
  const periods = table || await periodTable(term);
  const cand = windowOf(when || {}, periods);
  const docs = await collections.officeHours.find({ term, day }).toArray();
  const who = subjectName || '你';
  const mine = (d) => d.teacherEmail === teacherEmail;
  const sameCls = (d) => cls && d.cls === cls;

  // 时间解析不出来（老数据缺 time 之类）：退回旧的“同一节次”判定，
  // 宁可保守也不能把人锁死
  if (!cand) {
    const p = when && when.period;
    for (const d of docs) {
      if (excludeId && String(d._id) === String(excludeId)) continue;
      if (p != null && d.period === p && sameCls(d) && !mine(d)) {
        return `「${describeSlot(d, periods)}」已由 ${d.teacherName || '其他老师'} 值班，换班请先与对方确认`;
      }
    }
    return null;
  }

  // 优先报“这个班该时段已有别人”：去找那个人协调，比“你自己撞了”更可操作
  for (const d of docs) {
    if (excludeId && String(d._id) === String(excludeId)) continue;
    if (!sameCls(d) || mine(d)) continue;
    if (overlaps(cand, windowOf(d, periods))) {
      return `「${describeSlot(d, periods)}」已由 ${d.teacherName || '其他老师'} 值班，换班请先与对方确认`;
    }
  }
  for (const d of docs) {
    if (excludeId && String(d._id) === String(excludeId)) continue;
    if (!mine(d)) continue;
    if (!overlaps(cand, windowOf(d, periods))) continue;   // 不重叠就合法：16:30 和 18:30 可以各占一小时
    if (sameCls(d)) return `${who}已经有一条「${describeSlot(d, periods)}」的值班，不用重复添加`;
    if (!cls || !d.cls) {
      return `这条与${who}已有的「${describeSlot(d, periods)}」时间重叠，换一个时段或把班级填上`;
    }
    return `${who}同一时段已经在「${describeSlot(d, periods)}」值班，不能同时占两个班`;
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
