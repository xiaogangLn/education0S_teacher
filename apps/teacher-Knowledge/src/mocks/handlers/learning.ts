// packages/shared/src/mocks/handlers/learning.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, paginate, delay } from './index';

const mockLearningRecords = Array.from({ length: 30 }, (_, i) => ({
  id: `lr${String(i + 1).padStart(3, '0')}`,
  student_id: `s${faker.number.int({ min: 1, max: 20 })}`,
  student_name: faker.person.fullName(),
  lesson_plan_id: `lp${faker.number.int({ min: 1, max: 10 })}`,
  lesson_plan_title: faker.helpers.arrayElement(['导数的几何意义', '二次函数单元', '三角函数']),
  assignment_title: faker.helpers.arrayElement(['课后练习', '单元测试', '专项训练']),
  status: faker.helpers.arrayElement(['pending', 'submitted', 'graded']),
  submitted_at: faker.date.recent({ days: 5 }).toISOString(),
  graded_at: faker.date.recent({ days: 3 }).toISOString(),
  score: faker.number.int({ min: 40, max: 95 }),
  total_score: 100,
  mastery_rate: faker.number.int({ min: 30, max: 90 }),
  created_at: faker.date.recent({ days: 10 }).toISOString(),
}));

export const learningHandlers = [
  // GET /api/v1/learning/records
  http.get('/api/v1/learning/records', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const status = url.searchParams.get('status') || '';
    const studentId = url.searchParams.get('student_id') || '';

    let filtered = [...mockLearningRecords];
    if (status) filtered = filtered.filter(r => r.status === status);
    if (studentId) filtered = filtered.filter(r => r.student_id === studentId);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/learning/records/{id}
  http.get('/api/v1/learning/records/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const record = mockLearningRecords.find(r => r.id === id);
    if (!record) return HttpResponse.json(error(1004, '记录不存在'), { status: 404 });

    return HttpResponse.json(success({
      ...record,
      common_questions: [
        { id: 'q1', content: '求 y=x² 在 x=1 处的导数', type: 'answer', score: 10 },
        { id: 'q2', content: '求曲线 y=2x+1 在(0,1)处切线', type: 'answer', score: 10 },
      ],
      personalized_questions: [
        { id: 'p1', content: '已知 f\'(x)=2x，且 f(0)=1，求 f(x)', type: 'answer', score: 15 },
      ],
      answers: { q1: '2', q2: 'y=2x+1', p1: 'f(x)=x²+1' },
      images: ['https://picsum.photos/200/150'],
      class_evaluation: { rating: 4.5, comment: '课堂表现积极', teacher: '张老师', created_at: new Date().toISOString() },
      ai_result: {
        score: 72,
        total_score: 100,
        level: '良好',
        basic_score: 48,
        basic_total: 60,
        basic_accuracy: 80,
        advanced_score: 24,
        advanced_total: 40,
        advanced_accuracy: 60,
        errors: [{ question: '第3题', reason: '极限概念理解不清晰' }],
      },
      teacher_feedback: '基础知识掌握较好，拓展应用需加强',
      teacher_score: 75,
    }));
  }),

  // POST /api/v1/learning/records/batch
  http.post('/api/v1/learning/records/batch', async ({ request }) => {
    await delay(800);
    const body = await request.json() as any;
    const studentIds = Object.keys(body.personalized_map || {});
    const recordIds = studentIds.map(() => `lr${String(mockLearningRecords.length + 1).padStart(3, '0')}`);

    return HttpResponse.json(success({
      total: studentIds.length,
      success: studentIds.length,
      record_ids: recordIds,
      created_at: new Date().toISOString(),
    }, '批量生成成功'));
  }),

  // PUT /api/v1/learning/records/{id}/submit
  http.put('/api/v1/learning/records/:id/submit', async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const body = await request.json() as any;
    const record = mockLearningRecords.find(r => r.id === id);
    if (!record) return HttpResponse.json(error(1004, '记录不存在'), { status: 404 });
    record.status = 'submitted';
    record.submitted_at = new Date().toISOString();

    return HttpResponse.json(success({
      record_id: id,
      status: 'submitted',
      submitted_at: record.submitted_at,
      ai_analysis_started: true,
    }, '作业提交成功'));
  }),

  // PUT /api/v1/learning/records/{id}/grade
  http.put('/api/v1/learning/records/:id/grade', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const body = await request.json() as any;
    const record = mockLearningRecords.find(r => r.id === id);
    if (!record) return HttpResponse.json(error(1004, '记录不存在'), { status: 404 });

    const totalScore = Object.values(body.scores || {}).reduce((a: any, b: any) => a + (b || 0), 0);
    record.status = 'graded';
    record.score = totalScore as number;
    record.teacher_score = body.teacher_score || totalScore;
    record.teacher_feedback = body.feedback;
    record.graded_at = new Date().toISOString();

    return HttpResponse.json(success({
      record_id: id,
      status: 'graded',
      total_score: totalScore,
      total_possible: 100,
      mastery_rate: totalScore,
      knowledge_analysis: { mastered: ['导数的基本概念'], developing: ['极限思想'], not_mastered: ['综合应用'] },
      graded_at: record.graded_at,
    }, '批改完成'));
  }),

  // GET /api/v1/learning/records/student/{student_id}
  http.get('/api/v1/learning/records/student/:studentId', async ({ params }) => {
    await delay(200);
    const { studentId } = params;
    const items = mockLearningRecords.filter(r => r.student_id === studentId);
    const stats = {
      total: items.length,
      graded: items.filter(r => r.status === 'graded').length,
      pending: items.filter(r => r.status === 'pending').length,
      submitted: items.filter(r => r.status === 'submitted').length,
    };
    return HttpResponse.json(success({ items: items.slice(0, 10), stats }));
  }),

  // GET /api/v1/learning/records/class/{class_id}
  http.get('/api/v1/learning/records/class/:classId', async () => {
    await delay(200);
    const items = mockLearningRecords.slice(0, 15);
    const stats = {
      total: items.length,
      graded: items.filter(r => r.status === 'graded').length,
      pending: items.filter(r => r.status === 'pending').length,
      submitted: items.filter(r => r.status === 'submitted').length,
    };
    return HttpResponse.json(success({ items, stats }));
  }),
];