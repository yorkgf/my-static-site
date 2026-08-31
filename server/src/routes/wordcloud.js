import { Router } from 'express';
import { randomInt } from 'node:crypto';
import { collections } from '../db.js';
import { requireRole } from '../auth.js';

export const wordcloudRouter = Router();

// 邀请码字符集：去掉易混淆的 I / L / O / 0 / 1
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TITLE_MAX = 60;
const PROMPT_MAX = 200;
const WORD_MAX = 20;

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

async function uniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const exists = await collections.wcSessions.findOne({ code });
    if (!exists) return code;
  }
  throw new Error('邀请码生成冲突，请重试');
}

/** 清洗学生提交的词：去掉控制字符、合并空白、限长 */
function cleanWord(raw) {
  return String(raw ?? '')
    .split('')
    .filter((ch) => ch >= ' ' && ch !== '')
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, WORD_MAX);
}

async function sessionWords(code) {
  const docs = await collections.wcWords
    .find({ code })
    .sort({ count: -1, updatedAt: 1 })
    .toArray();
  return docs.map((d) => ({ word: d.word, count: d.count }));
}

// POST /api/wordcloud/sessions — 老师创建词云
wordcloudRouter.post('/sessions', requireRole('teacher'), async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? '').replace(/\s+/g, ' ').trim();
    const prompt = String(req.body?.prompt ?? '').replace(/\s+/g, ' ').trim();
    if (!title || title.length > TITLE_MAX) {
      return res.status(400).json({ error: `标题必填且不超过 ${TITLE_MAX} 字` });
    }
    if (prompt.length > PROMPT_MAX) {
      return res.status(400).json({ error: `问题描述不能超过 ${PROMPT_MAX} 字` });
    }

    const code = await uniqueCode();
    const session = {
      code,
      title,
      prompt,
      createdAt: new Date(),
    };
    await collections.wcSessions.insertOne(session);
    return res.status(201).json({ session });
  } catch (err) {
    return next(err);
  }
});

// GET /api/wordcloud/sessions — 老师查看所有词云
wordcloudRouter.get('/sessions', requireRole('teacher'), async (_req, res, next) => {
  try {
    const sessions = await collections.wcSessions.find({}).sort({ createdAt: -1 }).toArray();
    const words = await collections.wcWords.find({}).toArray();
    const statsByCode = new Map();
    for (const w of words) {
      const stat = statsByCode.get(w.code) || { total: 0, unique: 0 };
      stat.total += w.count;
      stat.unique += 1;
      statsByCode.set(w.code, stat);
    }
    return res.json({
      sessions: sessions.map((s) => ({
        code: s.code,
        title: s.title,
        prompt: s.prompt || '',
        createdAt: s.createdAt,
        totalWords: statsByCode.get(s.code)?.total || 0,
        uniqueWords: statsByCode.get(s.code)?.unique || 0,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/wordcloud/sessions/:code — 老师删除整个词云
wordcloudRouter.delete('/sessions/:code', requireRole('teacher'), async (req, res, next) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const result = await collections.wcSessions.deleteOne({ code });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '词云不存在' });
    }
    await collections.wcWords.deleteMany({ code });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// POST /api/wordcloud/sessions/:code/reset — 老师清空词语（保留词云）
wordcloudRouter.post('/sessions/:code/reset', requireRole('teacher'), async (req, res, next) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const session = await collections.wcSessions.findOne({ code });
    if (!session) return res.status(404).json({ error: '词云不存在' });
    await collections.wcWords.deleteMany({ code });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// GET /api/wordcloud/sessions/:code — 公开：词云内容（学生端轮询）
wordcloudRouter.get('/sessions/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const session = await collections.wcSessions.findOne({ code });
    if (!session) return res.status(404).json({ error: '词云不存在或邀请码有误' });
    const words = await sessionWords(code);
    const total = words.reduce((sum, w) => sum + w.count, 0);
    return res.json({
      session: { code: session.code, title: session.title, prompt: session.prompt || '' },
      words,
      total,
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/wordcloud/sessions/:code/words — 公开：学生提交词
wordcloudRouter.post('/sessions/:code/words', async (req, res, next) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const session = await collections.wcSessions.findOne({ code });
    if (!session) return res.status(404).json({ error: '词云不存在或邀请码有误' });

    const word = cleanWord(req.body?.word);
    if (!word) return res.status(400).json({ error: '请输入一个词' });
    if (word.length > WORD_MAX) {
      return res.status(400).json({ error: `一个词不能超过 ${WORD_MAX} 个字符` });
    }

    const key = word.toLowerCase();
    await collections.wcWords.updateOne(
      { code, key },
      {
        $set: { code, key, word, updatedAt: new Date() },
        $inc: { count: 1 },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
