# 教师 Office Hour 云函数

老师用 **FAD 系统的同一套账号**登录，改自己的值班教室/备注；学生端 `officehour.html` 实时读取。

- 技术栈：Node.js + Express + MongoDB（ESM，无构建步骤）
- 部署：腾讯云 **SCF Web 函数** + zip 上传，与 FADsys / `server/` 完全同一套方式
- 前端：静态页 `officehour.html`（学生）、`officehour-admin.html`（老师），部署在 EdgeOne Pages

```
学生/老师浏览器
   ├── 静态页面  → EdgeOne Pages
   │     · officehour.html        有内嵌学期初快照，后端挂了也不会白屏
   │     · officehour-admin.html  老师自助端，不挂公开链接
   └── API       → 本函数（函数 URL，公网 HTTPS）
                        │  MONGO_URI=mongodb://<轻量服务器公网IP>:27017
                        ▼
                 轻量服务器 MongoDB —— GHA 库
                   · Teachers        ← 复用，登录凭据与 FAD 同一张表
                   · Office_Hours    ← 本功能新增
                   · Office_Hour_Audit ← 改动留痕
                   · Office_Hour_Deletions ← 老师删掉的排班表行（防导入复活）
                   · Office_Hour_Classes   ← 班级注册表
```

## 数据流：改课表要怎么走

```bash
# 1) 编辑 OfficeHour/总课表.xlsx
python3 OfficeHour/build_data.py      # 更新页面内嵌快照 + 导出 OfficeHour/data.json

# 2) 预演入库（默认不写库）
node OfficeHour/api/scripts/seed.mjs

# 3) 确认后真正写入
node OfficeHour/api/scripts/seed.mjs --apply
#    --force  连老师写过的备注一起覆盖
#    --prune  同时删除 Excel 里已不存在的记录
```

归属解析规则：按 `Teachers.Name` 反查 `email`。**查不到或重名就中止**，
不会静默把值班绑到别人账号（确认过当前 20 位教师可 100% 唯一定位）。

### 权限与“谁是权威”

老师对自己名下的记录是**完全自助**的：新增、删除、换时间、换班级、改教室、写备注都可以。
唯一锁死的是**归属**：`teacherEmail` 永远取自 JWT，谁也改不了“这条是谁的值班”。

| 动作 | 老师本人 | 管理员 (S/A) |
|---|---|---|
| 改自己记录的 教室 / 备注 / 星期 / 节次 / 班级 | ✓ | ✓（任意人的记录） |
| 新增自己的值班 | ✓（上限 `OH_TEACHER_MAX_SLOTS`） | ✓ |
| 删除自己的值班 | ✓ | ✓ |
| 改归属（把值班挂到别人名下） | ✗ | ✓ |
| 整表导入 / 看审计 | ✗ | ✓ |
| 选一个从没见过的新班级 | ✗（防手滑造幽灵班） | ✓ |

**教室不做任何冲突校验。** 同一时段多位老师填同一间屋子很常见（地点常常就是老师办公室），
同时答疑互不影响，所以只校验“必填 + 长度”，不比对别人填了什么。

重导入时的优先级：`seed.mjs` 会覆盖星期/节次/班级/教室，但
**保留老师自己写的备注**（除非 `--force`），并且**不会复活老师删掉的格子**（除非 `--restore-deleted`）。
老师自己新增的行不在 Excel 里，`--prune` 也不会动它们。

## 接口

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| `GET` | `/api/health` | — | 不碰数据库，用于区分函数挂了/数据库不通 |
| `GET` | `/api/officehours` | 公开 | 学生端读；**不返回教师邮箱**（管理员带 token 访问时才返回，便于改归属） |
| `GET` | `/api/officehours/mine` | 教师 | 只看自己的记录 |
| `GET` | `/api/officehours/mine/options` | 教师 | 自助表单的可选班级/星期/节次 + 已用条数 |
| `POST` | `/api/officehours/mine` | 教师 | 给自己新增一条（归属强制为本人） |
| `PATCH` | `/api/officehours/mine/:id` | 教师 | 改自己的 星期/节次/班级/教室/备注 |
| `DELETE` | `/api/officehours/mine/:id` | 教师 | 删自己的一条 |
| `POST`/`PUT`/`DELETE` | `/api/officehours[/:id]` | 管理员 | 完整增删改 |
| `POST` | `/api/officehours/import` | 管理员 | 整表导入（页面里粘贴 data.json 也可） |
| `GET` | `/api/officehours/admin/audit` | 管理员 | 最近改动 |
| `POST` | `/api/auth/login` | — | 邮箱+密码，换 JWT |
| `GET` | `/api/auth/me` | 教师 | 校验令牌是否仍有效 |

## 安全设计（都有测试覆盖）

1. **归属一律取自 JWT**：写接口不读 body 里的 email，`updateOne({_id, teacherEmail: req.user.email})` 双保险，改别人的记录返回 404（不泄露该 ID 是否存在）
2. **字段白名单**：`teacherEmail` / `term` / `source` / `fromExcel` / 时间戳一律 400 拒绝，不是静默忽略
3. **完全自助后的两道防撞车护栏**（只针对“排班占位”，不针对教室）：
   - 唯一索引 `{teacherEmail, term, day, period}` —— 一位老师同一时段只能在一个班
   - 写入前 `findSlotConflict()` —— 该班该节已有别人时报 409 并说出是谁
     （两类冲突先报“已有别人”，因为“去找那个人协调”比“你自己撞了”更可操作）
4. **删除不会静默复活**：删掉“排班表来的”行记一块碑（`Office_Hour_Deletions`），
   `seed.mjs` 与管理端导入默认跳过。判断用不可变的 `fromExcel` 而不是 `source` ——
   `source` 是“最后谁改的”，老师改个教室就变成 teacher 了，靠它判断会漏记碑
5. **班级不会消失**：班级清单用持久注册表 `Office_Hour_Classes`，连“被腾空的老班级”也归档。
   只从现有行 `distinct` 会出事：某班最后一条被改走后老师再也换不回去（实际踩过）
6. **导入整批预检**：先扫一遍冲突再落笔，避免“导入了一半”的中间状态；批内重复也在这里抱
7. **不泄露凭据**：登录响应与读接口均不含 `Password`；公开读不含教师邮箱
8. **防邮箱枚举**：账号不存在与密码错误返回同一句话
9. **明文密码**：兼容 FADsys 的历史明文密码，但用 SHA-256 + `timingSafeEqual` 定长比较（FADsys 用的是 `===`），登录成功后自动升级为 bcrypt
10. **每请求回查教师表**（与 FADsys `authMiddleware` 一致）：账号删除/改组立即生效
11. 登录 15 分钟 20 次限流；写接口单独限流；自助新增有 `OH_TEACHER_MAX_SLOTS` 上限；
    读接口放宽（学生轮询 + 教室 NAT 共用 IP）
12. 所有写操作进 `Office_Hour_Audit`（含修改前后值、被删记录内容）

## 与 FADsys 的关系

- **同一个 MongoDB、同一个 `GHA` 库、同一张 `Teachers` 表** —— 老师无需注册第二个账号
- **`JWT_SECRET` 配成与 FADsys 相同** → 老师在 FAD 登录过的 token 这里直接可用（免二次登录）。
  token payload 结构 `{email, name}` 与 FADsys 一致，已用测试验证互认
- 管理员判定用 `userGroups.js` 的 `ADMIN_GROUPS = [S, A]`（含校领导），
  比 FADsys `adminMiddleware` 只认 `S` 更宽——这是有意为之，否则校领导进不去管理端

## 部署

### 1. 防火墙
轻量服务器 27017 的放行规则与 FADsys 一致即可：本函数与 FADsys 在**同一账号、同一地域（ap-shanghai）**，
SCF 出口 IP 段相同，一般无需新增规则。部署后跑一次真实登录即可确认连通。

### 2. 打包上传
```bash
bash OfficeHour/api/scripts/pack-scf.sh
# → OfficeHour/api/officehour-scf.zip，SCF 控制台上传
#   启动方式选「Web 函数」，监听 9000（scf_bootstrap 已配好）
```

### 3. 环境变量
必需：`MONGO_URI`、`DB_NAME=GHA`、`JWT_SECRET`
可选：`OH_TERM`、`ADMIN_GROUPS`、`OH_TEACHER_MAX_SLOTS`、`OH_CLASSES`、`JWT_SECRET_OLD`、
`TEACHER_DB_NAME`、各 `*_COLLECTION`、`*_RATE_MAX`（完整清单见 `.env.example`）

### 4. 前端指向后端
拿到函数 URL 后，任选一种：
- **推荐**：改 `officehour.html` / `officehour-admin.html` 里的 `let OH_API_BASE = ''` /
  `let API_BASE = ''` 为函数 URL，然后重新部署静态站
- 或让访问者在控制台执行 `localStorage.setItem('ohApiBase','https://…')`（适合灰度验证，不用发版）

### 5. 首次导入 + 自检
```bash
node OfficeHour/api/scripts/seed.mjs --apply          # Excel → 数据库
node OfficeHour/api/scripts/smoke-test.mjs            # 全量 API 用例（登录/权限/防撞车/删除碑/导入），跑在一次性临时库上
node OfficeHour/tests/e2e.mjs                         # 真实浏览器端到端，同样用临时库
bash OfficeHour/tests/live-check.sh https://<函数URL> # 部署后：确认学生页真在读后端
node OfficeHour/api/scripts/verify-prod.mjs           # 只读核验生产库结构（索引/回填/教师表未动）
```
`live-check.sh` 专门盯“函数部署了但静默返回 0 条”这种坑（最常见原因就是 `OH_TERM` 配错学期）。

## 本地开发
```bash
cd OfficeHour/api
cp .env.example .env      # 填 MONGO_URI / JWT_SECRET
node src/index.js         # 默认 9000
node scripts/seed.mjs     # 预演导入
```
`.env` 与 `node_modules/` 均已被 `.gitignore` 忽略——数据库没有账号密码，**连接串等同于凭据，务必不要提交**。
