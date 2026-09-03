import { config } from './config.js';

/**
 * 一条值班有两种时间形态：
 *   · 节次型 period=10        → 时间从课表反查（Excel/seed 走的都是这条，老数据零迁移）
 *   · 自定型 start/end 16:30/17:30 → 老师自己填的答疑时段
 * 冲突判定统一按“同一天的时间区间是否重叠”，不再按“节次编号是否相等”——
 * 否则 16:30–17:30 会被误当成和 18:30–19:20 同一节而互相挡死。
 */

const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;

export const isHHMM = (v) => typeof v === 'string' && HHMM.test(v.trim());

/** '16:30' → 990；不合法返回 null */
export function toMinutes(v) {
  if (!isHHMM(v)) return null;
  const [h, m] = v.trim().split(':').map(Number);
  return h * 60 + m;
}

export const toHHMM = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};

/** '18:30–19:20' / '18:30-19:20' → {start, end}；解析不出来返回 null（老数据可能没写时间） */
export function parseRange(text) {
  if (typeof text !== 'string') return null;
  const parts = text.split(/[–—-]/).map((s) => s.trim());
  if (parts.length !== 2 || !isHHMM(parts[0]) || !isHHMM(parts[1])) return null;
  const start = toMinutes(parts[0]);
  const end = toMinutes(parts[1]);
  if (start === null || end === null || end <= start) return null;
  return { start, end };
}

export const fmtRange = (a, b) => `${a}–${b}`;   // 与课表用同一个破折号，展示上不分叉

/**
 * 把一条记录（或一份提交数据）算成时间窗口。
 * 拿不到窗口时返回 null —— 调用方要按“无法判断重叠”处理，宁可放行也别把人锁死。
 */
export function windowOf(doc, periodTable) {
  const custom = parseRange(doc.start && doc.end ? fmtRange(doc.start, doc.end) : (doc.time || ''));
  if (doc.start && doc.end && isHHMM(doc.start) && isHHMM(doc.end)) {
    const start = toMinutes(doc.start);
    const end = toMinutes(doc.end);
    if (end > start) return { kind: 'custom', start, end, period: null };
  }
  if (doc.period !== null && doc.period !== undefined && Number.isFinite(Number(doc.period))) {
    const p = Number(doc.period);
    const fromTable = periodTable && periodTable.get(p);
    const win = fromTable || custom;
    if (!win) return null;
    return { kind: 'period', start: win.start, end: win.end, period: p };
  }
  return custom ? { kind: 'custom', start: custom.start, end: custom.end, period: null } : null;
}

export const overlaps = (a, b) => a && b && a.start < b.end && b.start < a.end;

/**
 * 把提交值与现有记录合成最终的“时间四件套”，并保证两种形态互斥。
 * 关键点：节次型改成自定型时要真的把 period 置 null，反过来要清掉 start/end；
 * 不然记录会同时带着两套时间，下次反查不知道信哪个。
 */
export function mergeWhen(value, existing, periodTable = null) {
  const v = value || {};
  const e = existing || {};
  const gotCustom = v.start !== undefined || v.end !== undefined;
  const gotPeriod = v.period !== undefined;

  if (gotCustom) {
    const start = v.start !== undefined ? v.start : e.start;
    const end = v.end !== undefined ? v.end : e.end;
    return { period: null, start: start || null, end: end || null, anchored: false,
      time: start && end ? fmtRange(start, end) : (e.time || '') };
  }
  if (gotPeriod) {
    const p = Number(v.period);
    const w = periodTable && periodTable.get(p);
    return { period: p, start: null, end: null, anchored: true,
      time: w ? `${toHHMM(w.start)}–${toHHMM(w.end)}` : (v.time || e.time || '') };
  }
  const keepPeriod = e.period !== undefined && e.period !== null ? Number(e.period) : null;
  return {
    period: keepPeriod,
    start: e.start || null,
    end: e.end || null,
    // anchored 是个冷数据字段，专为索引服务：MongoDB 的唯一索引会把 null 当成一个值，
    // 所以上面两个“自定时间”记录（period 都是 null）会撞唯一约束。
    // 用 anchored=true 做 partialFilterExpression 就能只约束节次型记录。
    anchored: keepPeriod !== null,
    time: e.time || (keepPeriod !== null && periodTable && periodTable.get(keepPeriod)
      ? `${toHHMM(periodTable.get(keepPeriod).start)}–${toHHMM(periodTable.get(keepPeriod).end)}` : ''),
  };
}

/** 校验老师提交的时间，返回 {errors, start, end, period}；两种形态二选一 */
export function validateWhen(value, errors, { requireOne = true } = {}) {
  const hasPeriod = value.period !== undefined && value.period !== null && value.period !== '';
  const hasStart = value.start !== undefined;
  const hasEnd = value.end !== undefined;

  if (hasPeriod && (hasStart || hasEnd)) {
    errors.push('节次和自定义时间二选一，不要同时提交');
    return value;
  }
  if (!hasPeriod && !hasStart && !hasEnd && requireOne) {
    errors.push('要么选节次，要么填开始和结束时间');
    return value;
  }
  if (hasStart !== hasEnd) { errors.push('开始时间和结束时间要一起填'); return value; }
  if (!hasStart) return value;

  for (const [k, name] of [['start', '开始时间'], ['end', '结束时间']]) {
    if (!isHHMM(value[k])) {
      errors.push(`${name}格式应为 HH:MM（例如 16:30）`);
      return value;
    }
  }
  const s = toMinutes(value.start);
  const e = toMinutes(value.end);
  if (e <= s) { errors.push('结束时间必须晚于开始时间'); return value; }

  const lo = toMinutes(config.timeRange.earliest);
  const hi = toMinutes(config.timeRange.latest);
  if (lo !== null && s < lo) errors.push(`开始不能早于 ${config.timeRange.earliest}`);
  if (hi !== null && e > hi) errors.push(`结束不能晚于 ${config.timeRange.latest}`);
  if (e - s > config.timeRange.maxMinutes) {
    errors.push(`单次答疑最长 ${Math.round(config.timeRange.maxMinutes / 60 * 10) / 10} 小时`);
  }
  value.period = null;      // 自定型不占节次编号
  value.time = fmtRange(value.start.trim(), value.end.trim());
  return value;
}
