/**
 * 冒烟测试：用内存 MongoDB 跑通完整 API 流程。
 * 运行：npm install 后执行 npm run smoke
 */
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri('apbusiness_test');
process.env.DB_NAME = 'apbusiness_test';
process.env.JWT_SECRET = 'test-secret-' + 'x'.repeat(32);
process.env.TEACHER_PASSWORD = 'teacher-pass-123';
process.env.ORIGIN_SECRET = '';
process.env.NODE_ENV = 'test';

const { connectDb, closeDb } = await import('../src/db.js');
const { createApp } = await import('../src/app.js');

await connectDb();
const server = createApp().listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

let passed = 0;
async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}
async function check(name, fn) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

try {
  await check('健康检查', async () => {
    const { status, json } = await call('GET', '/api/health');
    assert.equal(status, 200);
    assert.equal(json.ok, true);
  });

  await check('创建小组：4 名成员被拒绝（上限 3 人）', async () => {
    const { status } = await call('POST', '/api/groups', {
      name: '超限小组',
      password: 'pass1234',
      members: ['甲', '乙', '丙', '丁'],
    });
    assert.equal(status, 400);
  });

  let studentToken;
  let groupId;
  let memberIds;
  await check('创建小组成功', async () => {
    const { status, json } = await call('POST', '/api/groups', {
      name: ' 火星咖啡 ',
      password: 'pass1234',
      members: ['张三', '李四'],
      projectIdea: '在火星开连锁咖啡店',
      canvasLink: '',
    });
    assert.equal(status, 201);
    assert.ok(json.token);
    assert.equal(json.group.name, '火星咖啡');
    assert.equal(json.group.members.length, 2);
    studentToken = json.token;
    groupId = json.group.id;
    memberIds = json.group.members.map((m) => m.id);
  });

  await check('组名重复被拒绝', async () => {
    const { status } = await call('POST', '/api/groups', {
      name: '火星咖啡',
      password: 'pass1234',
      members: ['王五'],
    });
    assert.equal(status, 409);
  });

  await check('错误密码登录被拒绝', async () => {
    const { status } = await call('POST', '/api/groups/login', {
      name: '火星咖啡',
      password: 'wrong',
    });
    assert.equal(status, 401);
  });

  await check('正确密码登录成功', async () => {
    const { status, json } = await call('POST', '/api/groups/login', {
      name: '火星咖啡',
      password: 'pass1234',
    });
    assert.equal(status, 200);
    assert.ok(json.token);
  });

  await check('未登录不能查看小组', async () => {
    const { status } = await call('GET', '/api/groups/me');
    assert.equal(status, 401);
  });

  await check('学生查看本组信息', async () => {
    const { status, json } = await call('GET', '/api/groups/me', null, studentToken);
    assert.equal(status, 200);
    assert.equal(json.group.assignments.length, 0);
  });

  await check('学生更新 Canvas 链接', async () => {
    const { status, json } = await call(
      'PATCH',
      '/api/groups/me',
      { canvasLink: 'https://boardmix.com/app/canvas/abc' },
      studentToken
    );
    assert.equal(status, 200);
    assert.equal(json.group.canvasLink, 'https://boardmix.com/app/canvas/abc');
  });

  await check('学生不能调用老师接口', async () => {
    const { status } = await call('GET', '/api/teacher/groups', null, studentToken);
    assert.equal(status, 403);
  });

  await check('老师密码错误被拒绝', async () => {
    const { status } = await call('POST', '/api/teacher/login', { password: 'nope' });
    assert.equal(status, 401);
  });

  let teacherToken;
  await check('老师登录成功', async () => {
    const { status, json } = await call('POST', '/api/teacher/login', {
      password: 'teacher-pass-123',
    });
    assert.equal(status, 200);
    teacherToken = json.token;
  });

  await check('老师查看所有小组', async () => {
    const { status, json } = await call('GET', '/api/teacher/groups', null, teacherToken);
    assert.equal(status, 200);
    assert.equal(json.groups.length, 1);
  });

  let assignmentId;
  await check('老师分配项目', async () => {
    const { status, json } = await call(
      'POST',
      `/api/teacher/groups/${groupId}/assignments`,
      {
        title: 'Business Canvas 初稿',
        description: '完成画布前四个模块',
        dueDate: '2026-09-30T23:59:00',
      },
      teacherToken
    );
    assert.equal(status, 201);
    assignmentId = json.assignmentId;
    assert.equal(json.group.assignments.length, 1);
  });

  await check('超范围分数被拒绝', async () => {
    const { status } = await call(
      'POST',
      `/api/teacher/assignments/${assignmentId}/scores`,
      { scores: [{ memberId: memberIds[0], score: 150, comment: '' }] },
      teacherToken
    );
    assert.equal(status, 400);
  });

  await check('给非本组成员打分被拒绝', async () => {
    const { status } = await call(
      'POST',
      `/api/teacher/assignments/${assignmentId}/scores`,
      { scores: [{ memberId: 'not-a-real-member', score: 90, comment: '' }] },
      teacherToken
    );
    assert.equal(status, 400);
  });

  await check('老师给每个成员打分', async () => {
    const { status, json } = await call(
      'POST',
      `/api/teacher/assignments/${assignmentId}/scores`,
      {
        scores: [
          { memberId: memberIds[0], score: 90, comment: '市场分析到位' },
          { memberId: memberIds[1], score: 85.5, comment: '财务部分再补充' },
        ],
      },
      teacherToken
    );
    assert.equal(status, 200);
    const assignment = json.group.assignments[0];
    assert.equal(assignment.scores.length, 2);
  });

  await check('学生能看到自己的分数和评语', async () => {
    const { status, json } = await call('GET', '/api/groups/me', null, studentToken);
    assert.equal(status, 200);
    const assignment = json.group.assignments[0];
    assert.equal(assignment.title, 'Business Canvas 初稿');
    assert.equal(assignment.scores.length, 2);
    const zhangsan = assignment.scores.find((s) => s.memberName === '张三');
    assert.equal(zhangsan.score, 90);
  });

  await check('老师锁定小组后学生不能修改', async () => {
    const lockRes = await call(
      'PATCH',
      `/api/teacher/groups/${groupId}`,
      { locked: true },
      teacherToken
    );
    assert.equal(lockRes.status, 200);
    assert.equal(lockRes.json.group.locked, true);

    const patchRes = await call(
      'PATCH',
      '/api/groups/me',
      { canvasLink: 'https://example.com/new' },
      studentToken
    );
    assert.equal(patchRes.status, 403);
  });

  console.log(`\n全部 ${passed} 项冒烟测试通过 ✅`);
} catch (err) {
  console.error('❌ 冒烟测试失败:', err);
  process.exitCode = 1;
} finally {
  server.close();
  await closeDb();
  await mongod.stop();
}
