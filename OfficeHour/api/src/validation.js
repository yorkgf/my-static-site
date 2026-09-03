import { config } from './config.js';

const DAY_SET = new Set(config.days);

function str(v, max, name, errors, { required = true } = {}) {
  if (v === undefined || v === null || v === '') {
    if (required) errors.push(`${name}不能为空`);
    return '';
  }
  if (typeof v !== 'string') {
    errors.push(`${name}格式不正确`);
    return '';
  }
  const s = v.trim();
  if (s.length > max) {
    errors.push(`${name}不能超过 ${max} 个字符`);
    return s.slice(0, max);
  }
  return s;
}

function int(v, name, errors, { min = 1, max = 30 } = {}) {
  const n = typeof v === 'number' ? v : Number.parseInt(v, 10);
  if (!Number.isInteger(n) || n < min || n > max) {
    errors.push(`${name}必须是 ${min}–${max} 之间的整数`);
    return null;
  }
  return n;
}

/**
 * 老师自助写入的共用校验。
 * 完全自助意味着“哪天/哪节/哪个班”也能改（换班），但下面三条不放开：
 *   · 归属人 teacherEmail 永远取自 JWT，不接受提交 —— 否则能抢别人的值班
 *   · term / source / 时间戳等服务端字段不接受
 *   · 班级必须从现有班级里选（老师手滑打“G10-1 ”会多出一个幽灵班；
 *     新班级该由管理员建，所以管理员路由不传 classes 白名单）
 * @param partial patch=true 时只校验提交了的字段；false（新增）时 day/period/cls/room 必填
 */
export function validateTeacherSlot(body, { partial = false, classes = null } = {}) {
  const errors = [];
  const b = body || {};
  const allowed = new Set(config.teacherEditableFields);
  const forbidden = new Set(config.teacherForbiddenFields);

  const rejected = Object.keys(b).filter((k) => !allowed.has(k));
  if (rejected.length) {
    const why = rejected.every((k) => forbidden.has(k)) ? '不允许提交' : '不认识或不允许提交';
    errors.push(`${why}的字段：${rejected.join('、')}`);
  }
  const has = (k) => b[k] !== undefined;
  const value = {};

  if (!partial || has('day')) {
    const d = str(b.day, 8, '星期', errors);
    if (d && !DAY_SET.has(d)) errors.push(`星期只能是 ${config.days.join('/')} 之一`);
    value.day = d;
  }
  if (!partial || has('period')) {
    const p = int(b.period, '节次', errors);
    if (p !== null) value.period = p;
  }
  if (!partial || has('cls')) {
    const c = str(b.cls, config.limits.clsMax, '班级', errors);
    if (c && Array.isArray(classes) && classes.length && !classes.includes(c)) {
      errors.push(`班级必须从这些里选：${classes.join('、')}`);
    }
    value.cls = c;
  }
  if (!partial || has('room')) value.room = str(b.room, config.limits.roomMax, '教室', errors);
  if (has('note')) value.note = str(b.note, config.limits.noteMax, '备注', errors, { required: false });

  if (partial && !Object.keys(value).length) errors.push('没有任何要修改的内容');
  for (const k of Object.keys(value)) if (value[k] === null || value[k] === undefined) delete value[k];

  return { errors, value };
}

/** 向后兼容旧名：老师改自己的记录 */
export const validateTeacherEdit = (body, opts = {}) => validateTeacherSlot(body, { partial: true, ...opts });

/** 管理员写入：一条完整的值班记录 */
export function validateSlot(body, { partial = false } = {}) {
  const errors = [];
  const b = body || {};
  const has = (k) => b[k] !== undefined;
  const value = {};

  if (!partial || has('day')) {
    const d = str(b.day, 8, '星期', errors);
    if (d && !DAY_SET.has(d)) errors.push(`星期只能是 ${config.days.join('/')} 之一`);
    value.day = d;
  }
  if (!partial || has('period')) value.period = int(b.period, '节次', errors);
  if (!partial || has('cls')) value.cls = str(b.cls, config.limits.clsMax, '班级', errors);
  if (!partial || has('teacherEmail')) {
    const e = str(b.teacherEmail, 120, '教师邮箱', errors);
    // 只做形状校验，真实存在性由路由层查 Teachers 表
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) errors.push('教师邮箱格式不正确');
    value.teacherEmail = e;
  }
  if (!partial || has('teacherName')) value.teacherName = str(b.teacherName, config.limits.teacherNameMax, '教师姓名', errors, { required: false });
  if (!partial || has('room')) value.room = str(b.room, config.limits.roomMax, '教室', errors);
  if (has('note')) value.note = str(b.note, config.limits.noteMax, '备注', errors, { required: false });
  if (has('time')) value.time = str(b.time, 24, '时间', errors, { required: false });
  if (has('term')) value.term = str(b.term, 16, '学期', errors);

  // 丢掉 null（partial 更新时 int 校验失败已记错）
  for (const k of Object.keys(value)) if (value[k] === null) delete value[k];

  return { errors, value };
}

/** 导入接口的数组校验，逐条带行号报错 */
export function validateImportList(body) {
  const list = Array.isArray(body?.slots) ? body.slots : null;
  if (!list) return { errors: ['slots 必须是数组'], items: [] };
  if (!list.length) return { errors: ['slots 不能为空'], items: [] };
  if (list.length > 500) return { errors: ['一次最多导入 500 条'], items: [] };

  const items = [];
  const errors = [];
  list.forEach((raw, i) => {
    const { errors: e, value } = validateSlot(raw);
    if (e.length) errors.push(`第 ${i + 1} 条：${e.join('；')}`);
    else items.push({ ...value, term: value.term || config.term });
  });
  return { errors, items };
}
