# AP Business 小组系统 — 后端 API

为 AP Business 课程的项目小组提供：学生创建/加入小组（1–3 人）、提交 Business Canvas 链接、
老师创建任务模板并批量分配给多个小组、设定截止日期、按项目给**每位成员分别打分**、学生查看本人成绩。

- 技术栈：Node.js + Express + MongoDB（纯 API，无构建步骤）
- 前端页面：`APBusiness/groups.html`（学生端）、`APBusiness/groups-admin.html`（老师端，不挂公开链接）
- **部署方式与 FADsys 完全相同**：腾讯云 SCF **Web 函数** + zip 上传，MongoDB 连接走服务器公网 IP，
  安全边界由轻量服务器防火墙 IP 白名单保证（MongoDB 不设账号密码）
- 静态页部署在 EdgeOne Pages

## 架构

```
学生/老师浏览器
   ├── 静态页面  → EdgeOne Pages
   └── API 请求  → SCF Web 函数（函数 URL，公网 HTTPS）
                        │  MONGO_URI=mongodb://<轻量服务器公网IP>:27017
                        ▼
                 轻量服务器 MongoDB（公网网卡 :27017）
                 · 防火墙：27017 只放行云函数出口 IP（与 FADsys 相同配置）
                 · 其余所有来源拒绝
```

安全模型：
- MongoDB 不设访问密码，靠防火墙 IP 白名单（与 FADsys 一致）
- 学生令牌（JWT）只能读写自己小组；打分/分配项目接口要求老师令牌（`TEACHER_PASSWORD`），学生伪造请求会被服务端拒绝
- 组密码 bcrypt 哈希存储；老师密码存在 SCF 环境变量里，常量时间比较
- CORS 允许所有来源（与 FADsys 一致），无需配置域名白名单
- 登录/建组接口有速率限制（serverless 下为单实例内存计数，课堂规模够用）

---

## 部署步骤

### 第 1 步：轻量服务器防火墙（与 FADsys 相同）

1. MongoDB 监听公网网卡（`/etc/mongod.conf` 中 `bindIp` 包含公网 IP 或 `0.0.0.0`），
   不需要开启 authorization（与 FADsys 一致）。
2. 轻量服务器控制台 → 防火墙：27017 端口**只放行云函数的出口 IP 来源**
   （即 FADsys 函数使用的同一批 SCF 出口 IP / 白名单规则），其余来源拒绝。
   > 如果本函数和 FADsys 函数在**同一地域**，出口 IP 段相同，直接复用 FADsys 的放通规则即可。

### 第 2 步：打包

```bash
cd server
bash scripts/pack-scf.sh      # 生成 apbusiness-scf.zip（约 2-3 MB）
```

### 第 3 步：创建 SCF 函数

SCF 控制台 → 新建函数：

- 函数类型：**Web 函数**
- 运行环境：Nodejs18.15（或 Nodejs20）
- 部署方式：本地上传 zip，选 `apbusiness-scf.zip`
- 启动文件：根目录 `scf_bootstrap`（已包含，监听 9000 端口，平台自动识别）
- 执行超时：**30 秒**；内存：**256MB**（与 FADsys 相同）

### 第 4 步：配置环境变量

函数配置 → 环境变量：

| Key | Value | 必需 |
|---|---|---|
| `MONGO_URI` | `mongodb://<轻量服务器公网IP>:27017` | ✅ |
| `DB_NAME` | `apbusiness` | 可选（默认 apbusiness） |
| `JWT_SECRET` | `openssl rand -hex 32` 的输出 | ✅ |
| `TEACHER_PASSWORD` | 老师登录密码（只有你知道） | ✅ |
| `NODE_ENV` | `production` | 推荐 |

### 第 5 步：开启公网访问

函数管理 → 触发管理 / 函数 URL → 创建**公网访问 URL**（自带 HTTPS，无需 API 网关）。验证：

```bash
curl https://<函数URL前缀>.tencentcloudapi.com/api/health
# 应返回 {"ok":true}
```

### 第 6 步：配置前端并部署

1. 编辑 `APBusiness/js/groups-common.js` 顶部的 `API_BASE`，填函数 URL（不带末尾斜杠）。
2. `./deploy.sh` 部署 EdgeOne Pages。
3. 老师管理台：`APBusiness/groups-admin.html`（已设 noindex），收藏即可，不挂公开链接。

### 更新代码后

```bash
cd server
bash scripts/pack-scf.sh
# SCF 控制台 → 函数代码 → 上传 zip（环境变量不受影响）
```

---

## 本地开发 / 测试

```bash
npm install
npm run smoke    # 用内存 MongoDB 跑 19 项接口冒烟测试，不需要本机装 MongoDB
```

本地起服务（需要本地 MongoDB）：

```bash
cp .env.example .env   # MONGO_URI=mongodb://127.0.0.1:27017
npm start
```

浏览器控制台临时把页面指向本地 API：

```js
localStorage.setItem('apbApiBase', 'http://127.0.0.1:9000')
```

## API 一览

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/groups` | 公开 | 小组榜：所有组的组名、成员、项目标题与截止日期（不含分数） |
| POST | `/api/groups` | 公开（限流） | 创建小组 |
| POST | `/api/groups/login` | 公开（限流） | 小组登录 |
| GET | `/api/groups/me` | 学生令牌 | 本组信息 + 项目 + 个人成绩 |
| PATCH | `/api/groups/me` | 学生令牌 | 修改 Canvas/选题/成员/密码（锁定后禁止） |
| POST | `/api/teacher/login` | 公开（限流） | 老师密码登录 |
| GET | `/api/teacher/groups` | 老师令牌 | 所有小组详情 |
| POST | `/api/teacher/groups/:id/assignments` | 老师令牌 | 分配项目（标题/要求/截止日期） |
| POST | `/api/teacher/assignments/:id/scores` | 老师令牌 | 按项目给每位成员打分 + 评语 |
| PATCH | `/api/teacher/groups/:id` | 老师令牌 | 锁定/解锁小组信息 |
| GET | `/api/teacher/tasks` | 老师令牌 | 任务模板列表（含已分配小组） |
| POST | `/api/teacher/tasks` | 老师令牌 | 创建任务模板（内容+截止日期，可同时分配小组） |
| POST | `/api/teacher/tasks/:id/assign` | 老师令牌 | 把任务分配给一个或多个小组（自动去重跳过已分配） |
| DELETE | `/api/teacher/tasks/:id` | 老师令牌 | 删除任务模板及其分配记录（保留分数） |
