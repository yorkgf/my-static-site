import 'dotenv/config';

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[config] 缺少必需的环境变量: ${name}（请在 SCF 控制台或 .env 中配置）`);
    process.exit(1);
  }
  return value.trim();
}

export const config = {
  port: Number(process.env.PORT) || 9000,
  // 与 FADsys 相同：MongoDB 连接串，安全边界由轻量服务器防火墙 IP 白名单保证
  mongoUri: requireEnv('MONGO_URI'),
  dbName: (process.env.DB_NAME || 'apbusiness').trim(),
  jwtSecret: requireEnv('JWT_SECRET'),
  teacherPassword: requireEnv('TEACHER_PASSWORD'),
  // 仅 nginx 反代形态使用；SCF Web 函数形态留空即可
  originSecret: (process.env.ORIGIN_SECRET || '').trim(),
  isProduction: process.env.NODE_ENV === 'production',
};

export const GROUP_RULES = {
  minMembers: 1,
  maxMembers: 3,
  nameMin: 2,
  nameMax: 40,
  passwordMin: 4,
  passwordMax: 64,
  memberNameMax: 30,
  ideaMax: 500,
  linkMax: 300,
  titleMax: 100,
  descriptionMax: 2000,
  commentMax: 500,
  scoreMin: 0,
  scoreMax: 100,
  tokenTtl: '7d',
  teacherTokenTtl: '12h',
};
