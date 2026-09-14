// packages/shared/src/mocks/handlers/processing.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, delay } from './index';

const mockTasks = Array.from({ length: 10 }, (_, i) => ({
  id: `task${String(i + 1).padStart(3, '0')}`,
  class_id: 'c1',
  subject: faker.helpers.arrayElement(['数学', '语文', '英语']),
  topic: faker.helpers.arrayElement(['导数的几何意义', '二次函数', '三角函数', '阅读理解']),
  current_stage: faker.helpers.arrayElement(['init', 'analysis', 'outline', 'content', 'refine', 'complete']),
  status: faker.helpers.arrayElement(['draft', 'generated', 'pending_review', 'approved']),
  teacher_ideas: {
    teaching_approach: '数形结合',
    key_points: ['导数几何意义', '极限思想'],
    special_design: 'GeoGebra动态演示',
  },
  class_analysis: { mastery_rate: 68, weak_points: ['极限概念'], layers: { A: 12, B: 20, C: 13 } },
  outline: { sections: [{ id: 's1', title: '导入', level: 1 }, { id: 's2', title: '概念探究', level: 1 }] },
  content: [{ id: 'c1', title: '导入', content: '展示气温变化曲线', ai_generated: true, teacher_modified: false }],
  refined_content: [{ id: 'r1', title: '精修导入', content: '展示气温变化曲线，引导学生观察', ai_generated: true, teacher_modified: false }],
  generated_lesson_plan: faker.lorem.paragraphs(3),
  ai_tags: ['AI生成'],
  created_by: 'u1',
  created_at: faker.date.recent({ days: 7 }).toISOString(),
  updated_at: faker.date.recent({ days: 2 }).toISOString(),
  version: 1,
}));

// SSE 流式步骤
const sseSteps = [
  { type: 'start', stage: 'analysis', timestamp: new Date().toISOString() },
  { type: 'chunk', data: { type: 'text', content: '# 学情分析报告\n\n', position: 0 } },
  { type: 'chunk', data: { type: 'text', content: '班级掌握度：68%\n', position: 20 } },
  { type: 'chunk', data: { type: 'text', content: '薄弱点：极限概念\n', position: 40 } },
  { type: 'data', data: { type: 'structured', content: { mastery_rate: 68, weak_points: ['极限概念'] } } },
  { type: 'progress', progress: 50 },
  { type: 'chunk', data: { type: 'text', content: '分层：A层12人，B层20人，C层13人\n', position: 60 } },
  { type: 'complete', stage: 'analysis', status: 'done', next_action: 'confirm' },
];

export const processingHandlers = [
  // POST /api/v1/processing/tasks
  http.post('/api/v1/processing/tasks', async ({ request }) => {
    await delay(400);
    const body = await request.json() as any;
    const newTask = {
      id: `task${String(mockTasks.length + 1).padStart(3, '0')}`,
      ...body,
      current_stage: 'init',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    mockTasks.unshift(newTask);
    return HttpResponse.json(success({
      task_id: newTask.id,
      status: newTask.status,
      current_stage: newTask.current_stage,
      created_at: newTask.created_at,
    }, '任务创建成功'));
  }),

  // GET /api/v1/processing/tasks/{id}
  http.get('/api/v1/processing/tasks/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    return HttpResponse.json(success({ task }));
  }),

  // GET /api/v1/processing/tasks
  http.get('/api/v1/processing/tasks', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const subject = url.searchParams.get('subject') || '';

    let filtered = [...mockTasks];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (subject) filtered = filtered.filter(t => t.subject === subject);

    return HttpResponse.json(success({ items: filtered, total: filtered.length }));
  }),

  // GET /api/v1/processing/tasks/{id}/analysis
  http.get('/api/v1/processing/tasks/:id/analysis', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    return HttpResponse.json(success(task.class_analysis));
  }),

  // POST /api/v1/processing/tasks/{id}/analysis/confirm
  http.post('/api/v1/processing/tasks/:id/analysis/confirm', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.current_stage = 'outline';
    return HttpResponse.json(success({ stage: 'analysis', status: 'confirmed', next_stage: 'outline' }));
  }),

  // POST /api/v1/processing/tasks/{id}/outline/generate
  http.post('/api/v1/processing/tasks/:id/outline/generate', async ({ params }) => {
    await delay(600);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.current_stage = 'outline';
    task.outline = {
      sections: [
        { id: 's1', title: '情境导入', level: 1 },
        { id: 's2', title: '平均变化率→瞬时变化率', level: 1 },
        { id: 's3', title: '导数的几何意义', level: 1 },
        { id: 's4', title: '切线方程求法', level: 1 },
      ],
    };
    return HttpResponse.json(success(task.outline));
  }),

  // POST /api/v1/processing/tasks/{id}/content/generate
  http.post('/api/v1/processing/tasks/:id/content/generate', async ({ params }) => {
    await delay(800);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.current_stage = 'content';
    task.content = [
      { id: 'c1', title: '情境导入', content: '展示气温变化曲线，引导学生观察', ai_generated: true, teacher_modified: false },
      { id: 'c2', title: '概念探究', content: '计算 f(x)=x² 在 x=1 附近的平均变化率', ai_generated: true, teacher_modified: false },
    ];
    return HttpResponse.json(success(task.content));
  }),

  // POST /api/v1/processing/tasks/{id}/refine
  http.post('/api/v1/processing/tasks/:id/refine', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.current_stage = 'complete';
    task.refined_content = task.content.map(c => ({ ...c, content: `${c.content}（精修版）` }));
    return HttpResponse.json(success(task.refined_content));
  }),

  // POST /api/v1/processing/tasks/{id}/complete
  http.post('/api/v1/processing/tasks/:id/complete', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.current_stage = 'complete';
    task.status = 'generated';
    return HttpResponse.json(success({ task_id: id, status: 'generated', completed_at: new Date().toISOString() }));
  }),

  // POST /api/v1/processing/tasks/{id}/submit
  http.post('/api/v1/processing/tasks/:id/submit', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.status = 'pending_review';
    return HttpResponse.json(success({ task_id: id, status: 'pending_review', submitted_at: new Date().toISOString() }));
  }),

  // POST /api/v1/processing/tasks/{id}/draft
  http.post('/api/v1/processing/tasks/:id/draft', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    if (!task) return HttpResponse.json(error(1004, '任务不存在'), { status: 404 });
    task.status = 'draft';
    return HttpResponse.json(success({ task_id: id, status: 'draft', draft_saved_at: new Date().toISOString() }));
  }),

  // GET /api/v1/processing/tasks/{id}/stream/{stage}
  http.get('/api/v1/processing/tasks/:id/stream/:stage', async ({ params }) => {
    const { id, stage } = params;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`event: start\ndata: ${JSON.stringify({ type: 'start', stage, timestamp: new Date().toISOString() })}\n\n`));

        for (const step of sseSteps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          controller.enqueue(encoder.encode(`event: ${step.type}\ndata: ${JSON.stringify(step)}\n\n`));
        }
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  }),

  // GET /api/v1/processing/tasks/{id}/versions
  http.get('/api/v1/processing/tasks/:id/versions', async () => {
    await delay(200);
    return HttpResponse.json(success({
      items: [
        { version: 3, content: '最终版本', saved_at: new Date().toISOString(), saved_by: '张老师' },
        { version: 2, content: '修改版本', saved_at: new Date(Date.now() - 86400000).toISOString(), saved_by: '张老师' },
        { version: 1, content: '初始版本', saved_at: new Date(Date.now() - 172800000).toISOString(), saved_by: '张老师' },
      ],
    }));
  }),

  // POST /api/v1/processing/tasks/{id}/versions/{version}/restore
  http.post('/api/v1/processing/tasks/:id/versions/:version/restore', async ({ params }) => {
    await delay(300);
    const { id, version } = params;
    return HttpResponse.json(success({ task_id: id, version: parseInt(version as string), restored_at: new Date().toISOString() }));
  }),
];