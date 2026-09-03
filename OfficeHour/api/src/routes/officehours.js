import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireAdmin, attachOptionalUser } from '../auth.js';
import { validateTeacherSlot, validateSlot, validateImportList } from '../validation.js';
import { toPublic, writeAudit } from '../views.js';
import { findSlotConflict, recordDeletion, clearDeletion, deletedKeySet, slotKey, wasSeeded, knownClasses, rememberClasses } from '../conflicts.js';

export const officeHoursRouter = Router();

const DAY_ORDER = Object.fromEntries(config.days.map((d, i) => [d, i]));

function oid(value) {
  return typeof value === 'string' && ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function termOf(req) {
  const t = typeof req.query?.term === 'string' ? req.query.term.trim() : '';
  return /^[0-9A-Za-z\-–/ ]{1,16}$/.test(t) && t ? t : config.term;
}

function sortKey(a, b) {
  return (
    (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99) ||
    a.period - b.period ||
    String(a.cls).localeCompare(String(b.cls))
  );
}

async function findTeacherByEmail(email) {
  return collections.teachers.findOne({ email }, { projection: { email: 1, Name: 1 } });
}

/** 从记录里聚出「第N节 + 时间」，让前端不用自己硬编码时间 */
function periodsFrom(docs) {
  const map = new Map();
  docs.forEach((d) => { if (d.time && !map.has(d.period)) map.set(d.period, d.time); });
  return [...map.keys()]
    .sort((a, b) => a - b)
    .map((p) => ({ p, label: `第${p}节`, time: map.get(p) }));
}

/* ── 公开读：学生端 ─────────────────────────────────────────── */
// GET /api/officehours —— 公开可读；管理员登录时会额外带上教师邮箱便于改归属
officeHoursRouter.get('/', attachOptionalUser, async (req, res, next) => {
  try {
    const term = termOf(req);
    const withEmail = !!req.user?.isAdmin;
    const docs = await collections.officeHours.find({ term }).sort({ day: 1, period: 1, cls: 1 }).toArray();
    const slots = docs.sort(sortKey).map((d) => toPublic(d, { withEmail }));
    res.json({
      term,
      count: slots.length,
      periods: periodsFrom(docs),
      updatedAt: docs.reduce((m, d) => (d.updatedAt && (!m || d.updatedAt > m) ? d.updatedAt : m), null),
      slots,
    });
  } catch (err) {
    next(err);
  }
});

/* ── 老师自助：只看/只改自己的 ──────────────────────────────── */
// GET /api/officehours/mine
officeHoursRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const docs = await collections.officeHours
      .find({ term: config.term, teacherEmail: req.user.email })
      .sort({ day: 1, period: 1, cls: 1 })
      .toArray();
    res.json({
      user: req.user,
      term: config.term,
      editableFields: config.teacherEditableFields,
      // 节次表取全学期而不是只从自己这几条里聚：只有一节值班的老师
      // 也需要完整的“第N节 + 时间”才能渲染新增表单的下拉
      periods: await termPeriods(config.term),
      slots: docs.sort(sortKey).map((d) => toPublic(d, { withEmail: true })),
    });
  } catch (err) {
    next(err);
  }
});

/** 本学期的「第N节 + 时间」表，新增/换班时要拿它反填 time，不让前端自己写死 */
async function termPeriods(term) {
  const docs = await collections.officeHours
    .find({ term }, { projection: { period: 1, time: 1 } })
    .toArray();
  return periodsFrom(docs);
}

// GET /api/officehours/mine/options —— 自助表单的下拉数据
officeHoursRouter.get('/mine/options', requireAuth, async (req, res, next) => {
  try {
    const term = config.term;
    const [classes, periods, ownCount] = await Promise.all([
      knownClasses(term),
      termPeriods(term),
      collections.officeHours.countDocuments({ term, teacherEmail: req.user.email }),
    ]);
    res.json({
      term,
      classes: classes.sort(),
      days: config.days,
      periods,
      ownCount,
      maxSlots: config.teacherMaxSlots,
      // 班级只能选现有的；新开一个班属于排课，得管理员做
      canCreateClass: false,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/officehours/mine —— 老师给自己加一条值班；归属强制为本人
officeHoursRouter.post('/mine', requireAuth, async (req, res, next) => {
  try {
    const term = config.term;
    const classes = await knownClasses(term);
    const { errors, value } = validateTeacherSlot(req.body, { partial: false, classes });
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const mine = await collections.officeHours.countDocuments({ term, teacherEmail: req.user.email });
    if (mine >= config.teacherMaxSlots) {
      return res.status(409).json({
        error: `你已有 ${mine} 条值班，达到自助上限 ${config.teacherMaxSlots} 条；确实需要更多请联系管理员`,
      });
    }

    const clash = await findSlotConflict({ ...value, term, teacherEmail: req.user.email });
    if (clash) return res.status(409).json({ error: clash });

    const now = new Date();
    const doc = {
      term,
      day: value.day,
      period: value.period,
      cls: value.cls,
      teacherEmail: req.user.email,          // 永远取自 JWT，不看 body
      teacherName: req.user.name || '',      // 姓名以教师表为准
      room: value.room,
      note: value.note || '',
      time: (await termPeriods(term)).find((p) => p.p === value.period)?.time || '',
      source: 'teacher',
      fromExcel: false,          // 老师自己加的，不在排班表里 → 删了不用记碑
      createdAt: now,
      updatedAt: now,
      updatedBy: req.user.email,
      updatedByName: req.user.name,
    };
    try {
      const r = await collections.officeHours.insertOne(doc);
      // 占回这个格子 → 之前老师删留下的碑要撤掉，不然以后 Excel 永远导不进来
      await clearDeletion({ term, day: doc.day, period: doc.period, cls: doc.cls });
      await rememberClasses([doc.cls], term);
      await writeAudit({ action: 'teacher_create', email: req.user.email, name: req.user.name, slotId: String(r.insertedId), after: doc });
      return res.status(201).json({ slot: toPublic({ ...doc, _id: r.insertedId }, { withEmail: true }) });
    } catch (err) {
      // 并发下两个老师同时抢同一个格子：唯一索引是最后的兵底
      if (err && err.code === 11000) {
        const again = await findSlotConflict({ ...value, term, teacherEmail: req.user.email });
        return res.status(409).json({ error: again || '该时段刚刚被人占用了，请换一个班级或节次' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/officehours/mine/:id —— 归属一律取自 JWT，绝不读 body 里的 email
officeHoursRouter.patch('/mine/:id', requireAuth, async (req, res, next) => {
  try {
    const id = oid(req.params.id);
    if (!id) return res.status(400).json({ error: '记录 ID 不正确' });

    const existing = await collections.officeHours.findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: '记录不存在' });

    // 服务端强制归属校验：不是自己的记录就当不存在（不泄露给他人 ID 是否存在）
    if (existing.teacherEmail !== req.user.email) {
      return res.status(404).json({ error: '记录不存在' });
    }

    const classes = await knownClasses(existing.term);
    const { errors, value } = validateTeacherSlot(req.body, { partial: true, classes });
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    // 换班/改节次也要查冲突，用“改完之后的最终位置”判定
    const loc = {
      term: existing.term,
      day: value.day ?? existing.day,
      period: value.period ?? existing.period,
      cls: value.cls ?? existing.cls,
    };
    const clash = await findSlotConflict({ ...loc, teacherEmail: req.user.email, excludeId: id });
    if (clash) return res.status(409).json({ error: clash });

    const now = new Date();
    const set = { ...value, source: 'teacher', updatedAt: now, updatedBy: req.user.email, updatedByName: req.user.name };
    // 改了节次就得跟着换时间文字，否则卡片上会出现“第11节 18:30–19:20”
    if (value.period && value.period !== existing.period) {
      set.time = (await termPeriods(existing.term)).find((p) => p.p === value.period)?.time || existing.time || '';
    }

    let result;
    try {
      result = await collections.officeHours.updateOne(
        { _id: id, teacherEmail: req.user.email },   // 双保险：并发下也不越界
        { $set: set }
      );
    } catch (err) {
      if (err && err.code === 11000) {
        const again = await findSlotConflict({ ...loc, teacherEmail: req.user.email, excludeId: id });
        return res.status(409).json({ error: again || '该时段已被占用' });
      }
      throw err;
    }
    if (result.matchedCount === 0) return res.status(404).json({ error: '记录不存在' });

    if (loc.day !== existing.day || loc.period !== existing.period || loc.cls !== existing.cls) {
      await clearDeletion(loc);
    }
    if (value.cls) {
      // 连“被腾空的老班级”也要归档：否则某班最后一条被改走后，这个名字就再也选不到了
      await rememberClasses([existing.cls, value.cls], existing.term);
    }

    const doc = await collections.officeHours.findOne({ _id: id });
    const picked = (d) => ({ day: d.day, period: d.period, cls: d.cls, room: d.room, note: d.note || '' });
    await writeAudit({
      action: 'teacher_update',
      email: req.user.email,
      name: req.user.name,
      slotId: String(id),
      before: picked(existing),
      after: picked(doc),
    });
    return res.json({ slot: toPublic(doc, { withEmail: true }) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/officehours/mine/:id —— 老师删掉自己的一条值班
officeHoursRouter.delete('/mine/:id', requireAuth, async (req, res, next) => {
  try {
    const id = oid(req.params.id);
    if (!id) return res.status(400).json({ error: '记录 ID 不正确' });

    const existing = await collections.officeHours.findOne({ _id: id });
    if (!existing || existing.teacherEmail !== req.user.email) {
      return res.status(404).json({ error: '记录不存在' });
    }

    const r = await collections.officeHours.deleteOne({ _id: id, teacherEmail: req.user.email });
    if (r.deletedCount === 0) return res.status(404).json({ error: '记录不存在' });

    // 关键：排班表来源的行被删掉后要记碑，否则下次 seed 会把它静默复活
    if (wasSeeded(existing)) await recordDeletion(existing, req.user);

    await writeAudit({ action: 'teacher_delete', email: req.user.email, name: req.user.name, slotId: String(id), before: existing });
    return res.json({ ok: true, ledgered: wasSeeded(existing) });
  } catch (err) {
    next(err);
  }
});

/* ── 管理员：完整增删改 + 批量导入 ──────────────────────────── */
officeHoursRouter.use(requireAuth, requireAdmin);

// POST /api/officehours —— 新增一条
officeHoursRouter.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateSlot(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    const teacher = await findTeacherByEmail(value.teacherEmail);
    if (!teacher) return res.status(400).json({ error: `教师表中不存在邮箱 ${value.teacherEmail}` });
    // 姓名以教师表为准；表里没填才退而用提交值
    const displayName = teacher.Name || value.teacherName || '';
    if (!displayName) return res.status(400).json({ error: '教师表里没有该邮箱的姓名，请先补全 Name 字段' });

    const dupTerm = value.term || config.term;
    const dup = await collections.officeHours.findOne({
      term: dupTerm, day: value.day, period: value.period, cls: value.cls,
    });
    if (dup) {
      return res.status(409).json({ error: `「${value.day}第${value.period}节 ${value.cls}」已有记录（${dup.teacherName}），请直接编辑那条` });
    }
    // 管理员写表同样受“一位老师同一时段只能在一个班”约束，否则新唯一索引会抛 500
    const clash = await findSlotConflict({
      term: dupTerm, day: value.day, period: value.period, cls: value.cls,
      teacherEmail: teacher.email, subjectName: displayName || '该老师',
    });
    if (clash) return res.status(409).json({ error: clash });

    const now = new Date();
    const doc = {
      term: value.term || config.term,
      day: value.day,
      period: value.period,
      cls: value.cls,
      teacherEmail: teacher.email,
      teacherName: displayName,
      room: value.room,
      note: value.note || '',
      time: value.time || '',
      source: 'admin',
      fromExcel: false,
      createdAt: now,
      updatedAt: now,
      updatedBy: req.user.email,
      updatedByName: req.user.name,
    };
    const r = await collections.officeHours.insertOne(doc);
    await clearDeletion(doc);
    await rememberClasses([doc.cls], doc.term);
    await writeAudit({ action: 'admin_create', email: req.user.email, name: req.user.name, slotId: String(r.insertedId), after: doc });
    return res.status(201).json({ slot: toPublic({ ...doc, _id: r.insertedId }, { withEmail: true }) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/officehours/:id —— 管理员改任意字段
officeHoursRouter.put('/:id', async (req, res, next) => {
  try {
    const id = oid(req.params.id);
    if (!id) return res.status(400).json({ error: '记录 ID 不正确' });

    const existing = await collections.officeHours.findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: '记录不存在' });

    const { errors, value } = validateSlot(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ error: errors.join('；') });
    if (!Object.keys(value).length) return res.status(400).json({ error: '没有任何要修改的内容' });

    if (value.teacherEmail) {
      const teacher = await findTeacherByEmail(value.teacherEmail);
      if (!teacher) return res.status(400).json({ error: `教师表中不存在邮箱 ${value.teacherEmail}` });
      value.teacherEmail = teacher.email;
      if (!value.teacherName) value.teacherName = teacher.Name || '';
    }

    // 换班/改节次/换老师都可能撞车，拿“改完后的最终位置”查一次
    const loc = {
      term: value.term || existing.term,
      day: value.day ?? existing.day,
      period: value.period ?? existing.period,
      cls: value.cls ?? existing.cls,
    };
    const owner = value.teacherEmail || existing.teacherEmail;
    const clash = await findSlotConflict({
      ...loc, teacherEmail: owner, excludeId: id,
      subjectName: value.teacherName || existing.teacherName || '该老师',
    });
    if (clash) return res.status(409).json({ error: clash });

    const now = new Date();
    try {
      await collections.officeHours.updateOne(
        { _id: id },
        { $set: { ...value, source: 'admin', updatedAt: now, updatedBy: req.user.email, updatedByName: req.user.name } }
      );
    } catch (err) {
      if (err && err.code === 11000) {
        const again = await findSlotConflict({ ...loc, teacherEmail: owner, excludeId: id, subjectName: existing.teacherName || '该老师' });
        return res.status(409).json({ error: again || '该时段已被占用' });
      }
      throw err;
    }
    await clearDeletion(loc);
    if (value.cls) await rememberClasses([existing.cls, value.cls], loc.term);
    const doc = await collections.officeHours.findOne({ _id: id });
    await writeAudit({
      action: 'admin_update', email: req.user.email, name: req.user.name, slotId: String(id),
      before: existing, after: doc,
    });
    return res.json({ slot: toPublic(doc, { withEmail: true }) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/officehours/:id
officeHoursRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = oid(req.params.id);
    if (!id) return res.status(400).json({ error: '记录 ID 不正确' });
    const existing = await collections.officeHours.findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: '记录不存在' });

    await collections.officeHours.deleteOne({ _id: id });
    // 管理员删排班表来源的行同样记碑，不然下次导入又回来了
    if (wasSeeded(existing)) await recordDeletion(existing, req.user);
    await writeAudit({ action: 'admin_delete', email: req.user.email, name: req.user.name, slotId: String(id), before: existing });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/officehours/import —— 整表导入（seed 脚本与管理员页面都用它）
 * 按 {term,day,period,cls} upsert；老师写过的 note 默认保留，--force 才覆盖。
 */
officeHoursRouter.post('/import', async (req, res, next) => {
  try {
    const { errors, items } = validateImportList(req.body);
    if (errors.length) return res.status(400).json({ error: errors.slice(0, 10).join(' / '), errors });

    const force = req.body?.preserveTeacherNotes === false;
    const term = (typeof req.body?.term === 'string' && req.body.term.trim()) || config.term;

    // 导入前一次性核对所有教师邮箱，避免半半拉拉写入
    const emails = [...new Set(items.map((i) => i.teacherEmail))];
    const known = await collections.teachers.find({ email: { $in: emails } }, { projection: { email: 1, Name: 1 } }).toArray();
    const nameByEmail = new Map(known.map((t) => [t.email, t.Name || '']));
    const unknown = emails.filter((e) => !nameByEmail.has(e));
    if (unknown.length) {
      return res.status(400).json({ error: `教师表中不存在这些邮箱：${unknown.slice(0, 10).join('、')}`, unknown });
    }
    // 姓名从教师表反填，不信任导入文件里的写法
    const noName = [];
    items.forEach((i) => {
      i.teacherName = nameByEmail.get(i.teacherEmail) || i.teacherName || '';
      if (!i.teacherName) noName.push(i.teacherEmail);
    });
    if (noName.length) {
      return res.status(400).json({ error: `这些邮箱在教师表里没有 Name：${[...new Set(noName)].slice(0, 10).join('、')}` });
    }

    let created = 0, updated = 0, preserved = 0, skippedDeleted = 0;
    const now = new Date();

    // 老师删掉的格子（陆碑）默认不复活，否则“我明明删了怎么又出现”；
    // 管理员显式传 restoreDeleted: true 才把碑拔了重新导入。
    const restore = req.body?.restoreDeleted === true;
    let deleted = new Set();
    if (restore) {
      await collections.deletions.deleteMany({ term, $or: items.map((i) => ({ day: i.day, period: i.period, cls: i.cls })) });
    } else {
      deleted = await deletedKeySet(term, items);
    }

    // 整批预检再落笔：以前是一条条写，撞到唯一索引会抛出 409，
    // 但前面几十条已经写进去了——留下“导入了一半”的值班表最难查。
    const conflicts = [];
    const bySlot = new Map();       // 同一个班同一节被排两次
    const byTeacher = new Map();    // 同一个老师同一节被排迉两个班
    for (const item of items) {
      const t = item.term || term;
      const sk = `${t}|${item.day}|${item.period}|${item.cls}`;
      const tk = `${t}|${item.day}|${item.period}`;
      const dupSlot = bySlot.get(sk);
      if (dupSlot) {
        conflicts.push(`「${item.day}第${item.period}节 ${item.cls}」在清单里出现了两次（${dupSlot.teacherName} 和 ${item.teacherName}）`);
      }
      bySlot.set(sk, item);
      const prev = byTeacher.get(tk);
      if (prev && prev.teacherEmail === item.teacherEmail && prev.cls !== item.cls) {
        conflicts.push(`${item.teacherName} 同一时段被排迉了两个班：${prev.cls} 和 ${item.cls}`);
      }
      if (!prev) byTeacher.set(tk, item);

      const existingRow = await collections.officeHours.findOne({ term: t, day: item.day, period: item.period, cls: item.cls });
      const c = await findSlotConflict({
        term: t, day: item.day, period: item.period, cls: item.cls,
        teacherEmail: item.teacherEmail,
        excludeId: existingRow ? String(existingRow._id) : null,
        subjectName: item.teacherName || '该老师',
      });
      if (c) conflicts.push(c);
    }
    if (conflicts.length) {
      const only = [...new Set(conflicts)];
      return res.status(409).json({
        error: `导入会撞车，整批未写入（${only.length} 处）：${only.slice(0, 5).join(' / ')}`,
        conflicts: only,
      });
    }

    for (const item of items) {
      const key = { term: item.term || term, day: item.day, period: item.period, cls: item.cls };
      const existing = await collections.officeHours.findOne(key);
      if (!existing && deleted.has(slotKey(key))) { skippedDeleted += 1; continue; }      const set = {
        ...key,
        teacherEmail: item.teacherEmail,
        teacherName: item.teacherName,
        room: item.room,
        time: item.time || (existing && existing.time) || '',
        source: 'excel',
        fromExcel: true,        // 不可变标记：以后谁改了都不影响“这行来自排班表”
        updatedAt: now,
        updatedBy: req.user.email,
        updatedByName: req.user.name,
      };
      // 老师自己填的备注默认保留（Excel 里没有这一列）
      if (existing && !force && existing.source === 'teacher' && existing.note) {
        set.note = existing.note;
        preserved += 1;
      } else {
        set.note = item.note || '';
      }

      if (existing) {
        await collections.officeHours.updateOne({ _id: existing._id }, { $set: set });
        updated += 1;
      } else {
        await collections.officeHours.insertOne({ ...set, createdAt: now });
        created += 1;
      }
    }

    await rememberClasses(items.map((i) => i.cls), term);
    await writeAudit({ action: 'import', email: req.user.email, name: req.user.name, after: { term, created, updated, preserved, skippedDeleted, total: items.length } });
    return res.json({ ok: true, term, created, updated, preserved, skippedDeleted, total: items.length });
  } catch (err) {
    next(err);
  }
});

/** GET /api/officehours/admin/audit —— 最近改动记录 */
officeHoursRouter.get('/admin/audit', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query?.limit, 10) || 50, 1), 200);
    const rows = await collections.audit.find({}).sort({ at: -1 }).limit(limit).toArray();
    res.json({
      entries: rows.map((r) => ({
        at: r.at, action: r.action, name: r.name, email: r.email, slotId: r.slotId,
        before: r.before, after: r.after,
      })),
    });
  } catch (err) {
    next(err);
  }
});
