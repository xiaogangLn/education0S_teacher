// packages/shared/src/mocks/handlers/students.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, paginate, delay } from './index';

const mockStudents = Array.from({ length: 45 }, (_, i) => ({
  id: `s${String(i + 1).padStart(3, '0')}`,
  user_id: `u${String(i + 1).padStart(3, '0')}`,
  student_no: String(i + 1).padStart(3, '0'),
  name: faker.person.fullName(),
  gender: faker.helpers.arrayElement(['male', 'female']),
  school_id: 's1',
  school_name: 'XX中学',
  grade_id: 'g1',
  grade_name: '九年级',
  class_id: faker.helpers.arrayElement(['c1', 'c2', 'c3', 'c4']),
  class_name: faker.helpers.arrayElement(['九年级1班', '九年级2班', '九年级3班', '九年级4班']),
  enrollment_year: faker.helpers.arrayElement(['2023', '2024']),
  parent_name: faker.person.fullName(),
  parent_phone: faker.phone.number(),
  parent_email: faker.internet.email(),
  status: faker.helpers.arrayElement(['active', 'active', 'active', 'transferred', 'graduated']),
  mastery_rate: faker.number.int({ min: 30, max: 98 }),
  rank: faker.number.int({ min: 1, max: 45 }),
  total_students: 45,
  created_at: faker.date.recent({ days: 30 }).toISOString(),
}));

const mockTransferHistory = (studentId: string) => [
  { id: `t${Date.now()}`, from_class: '八年级3班', to_class: '九年级2班', transfer_date: '2026-03-01', reason: '成绩提升', operated_by: '张老师' },
  { id: `t${Date.now() + 1}`, from_class: '九年级2班', to_class: '九年级1班', transfer_date: '2026-08-15', reason: '班级调整', operated_by: '李老师' },
];

export const studentsHandlers = [
  // GET /api/v1/students
  http.get('/api/v1/students', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const keyword = url.searchParams.get('keyword') || '';
    const classId = url.searchParams.get('class_id') || '';
    const status = url.searchParams.get('status') || '';

    let filtered = [...mockStudents];
    if (keyword) filtered = filtered.filter(s => s.name.includes(keyword) || s.student_no.includes(keyword));
    if (classId) filtered = filtered.filter(s => s.class_id === classId);
    if (status) filtered = filtered.filter(s => s.status === status);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/students/{id}
  http.get('/api/v1/students/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const student = mockStudents.find(s => s.id === id);
    if (!student) return HttpResponse.json(error(1004, '学生不存在'), { status: 404 });

    return HttpResponse.json(success({
      ...student,
      strengths: ['数学', '物理'],
      weaknesses: ['英语', '化学'],
      transfer_history: mockTransferHistory(id),
      abilities: [
        { name: '计算力', value: 78, label: '计算力' },
        { name: '逻辑推理', value: 62, label: '逻辑推理' },
        { name: '空间想象', value: 85, label: '空间想象' },
        { name: '应用能力', value: 70, label: '应用能力' },
      ],
      portraits: {
        academic: { overall_mastery: 78, trend: 'up' },
        abilities: { memory: 72, comprehension: 58, application: 45 },
        behaviors: { homework_rate: 85, participation: 4.2 },
        psychology: { motivation: 3.8, anxiety: 'medium' },
        growth: { improvement_rate: 12 },
      },
    }));
  }),

  // POST /api/v1/students/{id}/transfer
  http.post('/api/v1/students/:id/transfer', async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const body = await request.json() as any;
    const student = mockStudents.find(s => s.id === id);
    if (!student) return HttpResponse.json(error(1004, '学生不存在'), { status: 404 });

    const fromClass = student.class_name;
    student.class_id = body.target_class_id;
    student.class_name = body.target_class_id === 'c1' ? '九年级1班' : '九年级2班';

    return HttpResponse.json(success({
      student_id: id,
      from_class: fromClass,
      to_class: student.class_name,
      transfer_date: body.transfer_date || new Date().toISOString().split('T')[0],
      status: 'executed',
      record_id: `transfer_${Date.now()}`,
    }, '换班成功'));
  }),

  // GET /api/v1/students/{id}/transfers
  http.get('/api/v1/students/:id/transfers', async () => {
    await delay(200);
    return HttpResponse.json(success({ items: mockTransferHistory('s1') }));
  }),

  // GET /api/v1/students/class/{class_id}
  http.get('/api/v1/students/class/:classId', async ({ params }) => {
    await delay(200);
    const { classId } = params;
    const items = mockStudents.filter(s => s.class_id === classId);
    return HttpResponse.json(success({ items, total: items.length }));
  }),

  // POST /api/v1/students/import
  http.post('/api/v1/students/import', async () => {
    await delay(1000);
    return HttpResponse.json(success({
      task_id: `task_${Date.now()}`,
      total: 45,
      success: 42,
      failed: 3,
      errors: [{ row: 5, field: 'student_no', reason: '学号重复' }],
    }, '导入完成'));
  }),

  // GET /api/v1/students/export
  http.get('/api/v1/students/export', async () => {
    await delay(500);
    return new HttpResponse('id,name,class,status,created_at\n1,张三,九年级1班,active,2026-09-01', {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),
];