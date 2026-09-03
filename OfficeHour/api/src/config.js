import 'dotenv/config';

/**
 * 缺失必需环境变量时直接退出（与 FADsys / server 一致，避免带病启动）。
 * 例外：NODE_ENV=test 下允许缺省，方便冒烟测试注入。
 */
function requireEnv(name) {
  const value = (process.env[name] || '').trim();
  if (value) return value;
  console.error(`[config] 缺少必需的环境变量: ${name}（请在 SCF 控制台或 .env 中配置）`);
  process.exit(1);
}

const dbName = (process.env.DB_NAME || 'GHA').trim();

export const config = {
  port: Number(process.env.PORT) || 9000,

  // 与 FADsys 同一个 MongoDB 实例、同一个 GHA 库：教师账号直接复用
  mongoUri: requireEnv('MONGO_URI'),
  dbName,
  // 教师表所在的库，默认与业务库相同；若将来拆库只改这个变量
  teacherDbName: (process.env.TEACHER_DB_NAME || dbName).trim(),

  collections: {
    teachers: (process.env.TEACHERS_COLLECTION || 'Teachers').trim(),
    officeHours: (process.env.OFFICEHOURS_COLLECTION || 'Office_Hours').trim(),
    audit: (process.env.AUDIT_COLLECTION || 'Office_Hour_Audit').trim(),
    // 老师删掉的“Excel 来源”行在这里留底（陆碑），否则下次 seed 会把它们复活
    deletions: (process.env.DELETIONS_COLLECTION || 'Office_Hour_Deletions').trim(),
    // 班级注册表：见过的班级一律留着。不能从现有行现推，否则某个班最后一条被改走
    // 之后这个名字就永久选不到了（实际踩过）
    classes: (process.env.CLASS_REGISTRY_COLLECTION || 'Office_Hour_Classes').trim(),
  },

  // JWT_SECRET 只要与 FADsys 配成同一个值，老师在 FAD 登录过的 token 这里直接可用（免二次登录）
  jwtSecret: requireEnv('JWT_SECRET'),
  // 轮换密钥期兼容旧 token，与 FADsys 的做法保持一致
  jwtSecretOld: (process.env.JWT_SECRET_OLD || '').trim(),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d').trim(),

  // 学期标识：Excel 里的 (26-27)。
  // 必须用 OH_TERM —— 裸 TERM 是终端类型环境变量，会被 shell 污染成 "xterm-256color"（已实际踩过）
  term: (process.env.OH_TERM || '26-27').trim(),

  // 管理员组：取自 FADsys backend/src/utils/userGroups.js 的 ADMIN_GROUPS
  //   S = 系统管理员, A = 管理员A（校领导）
  // 注意 FADsys 的 adminMiddleware 只认 S，与它自己的 isAdmin() 不一致；这里按权威枚举取 S+A
  adminGroups: (process.env.ADMIN_GROUPS || 'S,A')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean),

  // 老师自助可改的字段。完全自助 = 连“哪天/哪节/哪个班”也能改（换班），
  // 但归属人永远取自 JWT，所以改不了“这是谁的值班”。
  teacherEditableFields: ['day', 'period', 'cls', 'room', 'note'],
  // 任何情况下都不允许客户端提交的字段（改归属/伪造来源/绕时间戳）
  teacherForbiddenFields: [
    'teacherEmail', 'email', 'term', 'source', 'id', '_id',
    'createdAt', 'updatedAt', 'updatedBy', 'updatedByName', 'time', 'fromExcel',
  ],
  // 单人自助新增上限，防误操作一口气建几十条（可由 OH_TEACHER_MAX_SLOTS 调整）
  teacherMaxSlots: Number(process.env.OH_TEACHER_MAX_SLOTS || 12),

  // 额外可选班级（逗号分隔），给“本学期还没排但允许老师选”的班用
  extraClasses: (process.env.OH_CLASSES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // 无排班日的展示
  days: ['周一', '周二', '周三', '周四', '周五'],

  limits: {
    roomMax: 40,
    noteMax: 200,
    clsMax: 20,
    teacherNameMax: 30,
    loginPerWindow: Number(process.env.LOGIN_RATE_MAX || 20),
    loginWindowMs: 15 * 60 * 1000,
    writePerWindow: Number(process.env.WRITE_RATE_MAX || 120),
    writeWindowMs: 15 * 60 * 1000,
  },

  isProduction: process.env.NODE_ENV === 'production',
};
