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
  let g2Token;
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

  await check('公开小组榜：含组名/成员/项目/截止日期，但不含分数等私密信息', async () => {
    const { status, json } = await call('GET', '/api/groups');
    assert.equal(status, 200);
    assert.equal(json.groups.length, 1);
    const pub = json.groups[0];
    assert.equal(pub.name, '火星咖啡');
    assert.deepEqual(pub.members, ['张三', '李四']);
    assert.equal(pub.assignments.length, 1);
    assert.equal(pub.assignments[0].title, 'Business Canvas 初稿');
    assert.ok(pub.assignments[0].dueDate);
    // 私密字段不得出现
    const raw = JSON.stringify(pub);
    assert.ok(!raw.includes('score'), '不应包含分数');
    assert.ok(!raw.includes('comment'), '不应包含评语');
    assert.ok(!raw.includes('password'), '不应包含密码');
    assert.ok(!raw.includes('canvasLink'), '不应包含 Canvas 链接');
    assert.ok(!raw.includes('projectIdea'), '不应包含选题');
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

  // ── 任务模板 ──
  let taskId;
  await check('任务：无标题被拒绝', async () => {
    const { status } = await call('POST', '/api/teacher/tasks', {
      title: '   ',
      description: '',
      dueDate: '',
    }, teacherToken);
    assert.equal(status, 400);
  });

  await check('任务：创建任务模板（不分配小组）', async () => {
    const { status, json } = await call('POST', '/api/teacher/tasks', {
      title: '最终报告',
      description: '提交完整的商业计划书',
      dueDate: '2026-10-15T23:59:00',
    }, teacherToken);
    assert.equal(status, 201);
    taskId = json.task.id;
    assert.equal(json.task.title, '最终报告');
    assert.equal(json.task.assignedGroups.length, 0);
  });

  await check('任务：创建并同时分配到小组', async () => {
    const { status, json } = await call('POST', '/api/teacher/tasks', {
      title: '演示日演讲',
      description: '5 分钟路演',
      dueDate: '2026-11-01T23:59:00',
      groupIds: [groupId],
    }, teacherToken);
    assert.equal(status, 201);
    assert.equal(json.task.assignedGroups.length, 1);
    assert.equal(json.task.assignedGroups[0].groupName, '火星咖啡');
  });

  await check('任务：任务列表含分配信息', async () => {
    const { status, json } = await call('GET', '/api/teacher/tasks', null, teacherToken);
    assert.equal(status, 200);
    assert.ok(json.tasks.length >= 2);
    const demo = json.tasks.find((t) => t.title === '演示日演讲');
    assert.equal(demo.assignedGroups.length, 1);
  });

  await check('任务：分配任务给小组（重复 ID 去重）', async () => {
    // 再建一个小组用于验证多组分配
    const g2 = await call('POST', '/api/groups', {
      name: '深海科技',
      password: 'pass1234',
      members: ['王五'],
    });
    assert.equal(g2.status, 201);
    const g2Id = g2.json.group.id;

    const { status, json } = await call(
      'POST',
      `/api/teacher/tasks/${taskId}/assign`,
      { groupIds: [g2Id, g2Id, groupId] }, // 重复 g2Id 去重，两个小组都是新分配
      teacherToken
    );
    assert.equal(status, 200);
    assert.equal(json.assignedCount, 2);
  });

  await check('任务：重复分配同一小组自动跳过', async () => {
    const { status, json } = await call(
      'POST',
      `/api/teacher/tasks/${taskId}/assign`,
      { groupIds: [groupId] },
      teacherToken
    );
    assert.equal(status, 200);
    assert.equal(json.assignedCount, 0);
    assert.equal(json.skipped, 1);
  });

  await check('任务：学生能看到来自任务模板的分配', async () => {
    const { status, json } = await call('GET', '/api/groups/me', null, studentToken);
    assert.equal(status, 200);
    assert.ok(json.group.assignments.some((a) => a.title === '演示日演讲'));
  });

  await check('任务：删除任务模板', async () => {
    const { status } = await call('DELETE', `/api/teacher/tasks/${taskId}`, null, teacherToken);
    assert.equal(status, 200);
    const list = await call('GET', '/api/teacher/tasks', null, teacherToken);
    assert.ok(!list.json.tasks.some((t) => t.id === taskId));
  });

  await check('任务：学生不能访问任务接口', async () => {
    const { status } = await call('GET', '/api/teacher/tasks', null, studentToken);
    assert.equal(status, 403);
  });

  // ── 点赞 ──
  await check('点赞：未登录不能点赞', async () => {
    const { status } = await call('POST', '/api/likes', { toGroupId: groupId });
    assert.equal(status, 401);
  });

  await check('点赞：不能给自己的小组点赞', async () => {
    const { status } = await call('POST', '/api/likes', { toGroupId: groupId }, studentToken);
    assert.equal(status, 400);
  });

  await check('点赞：登录的小组给另一个小组点赞', async () => {
    const g2 = await call('POST', '/api/groups/login', {
      name: '深海科技',
      password: 'pass1234',
    });
    assert.equal(g2.status, 200);
    g2Token = g2.json.token;
    const { status, json } = await call('POST', '/api/likes', { toGroupId: groupId }, g2Token);
    assert.equal(status, 201);
    assert.equal(json.likes, 1);
  });

  await check('点赞：同一小组对同一项目只能点一次', async () => {
    const { status } = await call('POST', '/api/likes', { toGroupId: groupId }, g2Token);
    assert.equal(status, 409);
  });

  await check('点赞：公开榜含点赞数并可按点赞数排序', async () => {
    const { status, json } = await call('GET', '/api/groups');
    assert.equal(status, 200);
    const target = json.groups.find((g) => g.id === groupId);
    assert.equal(target.likes, 1);
    assert.equal(target.likedBy.length, 1);
    assert.equal(target.likedBy[0].groupName, '深海科技');
    // 被点赞的小组应排在前面（火星咖啡 > 深海科技）
    assert.ok(json.groups[0].likes >= json.groups[1].likes);
    assert.equal(json.groups[0].id, groupId);
  });

  await check('点赞：公开榜不泄露点赞者之外的私密信息', async () => {
    const { json } = await call('GET', '/api/groups');
    const raw = JSON.stringify(json.groups[0]);
    assert.ok(!raw.includes('score'), '不应包含分数');
    assert.ok(!raw.includes('comment'), '不应包含评语');
    assert.ok(!raw.includes('password'), '不应包含密码');
  });

  await check('点赞：取消点赞后计数归零', async () => {
    const { status } = await call('DELETE', '/api/likes/' + groupId, null, g2Token);
    assert.equal(status, 200);
    const { json } = await call('GET', '/api/groups');
    assert.equal(json.groups.find((g) => g.id === groupId).likes, 0);
  });

  await check('点赞：取消未点过赞的小组返回 404', async () => {
    const { status } = await call('DELETE', '/api/likes/' + groupId, null, g2Token);
    assert.equal(status, 404);
  });

  await check('点赞：老师令牌不能点赞（需要学生令牌）', async () => {
    const { status } = await call('POST', '/api/likes', { toGroupId: groupId }, teacherToken);
    assert.equal(status, 403);
  });

  // ── 词云 ──
  let wcCode;
  await check('词云：学生不能创建词云（需老师权限）', async () => {
    const { status } = await call('POST', '/api/wordcloud/sessions', { title: 'test' }, studentToken);
    assert.equal(status, 403);
  });

  await check('词云：老师创建词云', async () => {
    const { status, json } = await call('POST', '/api/wordcloud/sessions', {
      title: '用一个词形容创业',
      prompt: '想到什么就提交什么',
    }, teacherToken);
    assert.equal(status, 201);
    assert.match(json.session.code, /^[A-Z0-9]{6}$/);
    wcCode = json.session.code;
  });

  await check('词云：错误邀请码返回 404', async () => {
    const { status } = await call('GET', '/api/wordcloud/sessions/ZZZZZZ');
    assert.equal(status, 404);
  });

  await check('词云：学生提交词语，重复词计数累加', async () => {
    const url = `/api/wordcloud/sessions/${wcCode}/words`;
    let r = await call('POST', url, { word: ' 创新 ' });
    assert.equal(r.status, 201);
    r = await call('POST', url, { word: '创新' });
    assert.equal(r.status, 201);
    r = await call('POST', url, { word: '冒险' });
    assert.equal(r.status, 201);
    r = await call('POST', url, { word: '   ' });
    assert.equal(r.status, 400);
  });

  await check('词云：公开查询返回按次数排序的词', async () => {
    const { status, json } = await call('GET', `/api/wordcloud/sessions/${wcCode}`);
    assert.equal(status, 200);
    assert.equal(json.session.title, '用一个词形容创业');
    assert.equal(json.total, 3);
    assert.equal(json.words[0].word, '创新');
    assert.equal(json.words[0].count, 2);
  });

  await check('词云：老师清空词语', async () => {
    const { status } = await call('POST', `/api/wordcloud/sessions/${wcCode}/reset`, {}, teacherToken);
    assert.equal(status, 200);
    const r = await call('GET', `/api/wordcloud/sessions/${wcCode}`);
    assert.equal(r.json.total, 0);
  });

  await check('词云：老师删除词云', async () => {
    const del = await call('DELETE', `/api/wordcloud/sessions/${wcCode}`, null, teacherToken);
    assert.equal(del.status, 200);
    const get = await call('GET', `/api/wordcloud/sessions/${wcCode}`);
    assert.equal(get.status, 404);
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
