// packages/shared/src/mocks/handlers/review.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, paginate, delay } from './index';

const mockPendingReviews = Array.from({ length: 8 }, (_, i) => ({
  id: `rv${String(i + 1).padStart(3, '0')}`,
  title: faker.helpers.arrayElement([
    '导数的几何意义教案',
    '二次函数单元教案',
    '英语阅读理解专项计划',
    '三角函数单元教学计划',
  ]),
  type: faker.helpers.arrayElement(['lesson_plan', 'courseware', 'exam']),
  submitter: faker.person.fullName(),
  class_name: faker.helpers.arrayElement(['高二(3)班', '高二(1)班', '高二(2)班']),
  subject: faker.helpers.arrayElement(['数学', '语文', '英语']),
  submitted_at: faker.date.recent({ days: 3 }).toISOString(),
  status: 'pending',
  preview_content: faker.lorem.paragraph(),
}));

const mockReviewHistory = Array.from({ length: 15 }, (_, i) => ({
  id: `rh${String(i + 1).padStart(3, '0')}`,
  title: faker.helpers.arrayElement(['函数图像课件', '一元二次方程教案', '英语阅读理解训练']),
  type: faker.helpers.arrayElement(['lesson_plan', 'courseware', 'exam']),
  submitter: faker.person.fullName(),
  approver: faker.person.fullName(),
  status: faker.helpers.arrayElement(['approved', 'rejected']),
  submitted_at: faker.date.recent({ days: 10 }).toISOString(),
  reviewed_at: faker.date.recent({ days: 7 }).toISOString(),
  comment: faker.lorem.sentence(),
}));

const mockComments = Array.from({ length: 5 }, () => ({
  id: faker.string.uuid(),
  author: faker.person.fullName(),
  content: faker.lorem.sentence(),
  created_at: faker.date.recent().toISOString(),
}));

export const reviewHandlers = [
  // GET /api/v1/review/pending
  http.get('/api/v1/review/pending', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const type = url.searchParams.get('type') || '';

    let filtered = [...mockPendingReviews];
    if (type) filtered = filtered.filter(r => r.type === type);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/review/list
  http.get('/api/v1/review/list', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const status = url.searchParams.get('status') || '';

    let filtered = [...mockReviewHistory];
    if (status) filtered = filtered.filter(r => r.status === status);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/review/{id}
  http.get('/api/v1/review/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const review = [...mockPendingReviews, ...mockReviewHistory].find(r => r.id === id);
    if (!review) return HttpResponse.json(success(null, '审核记录不存在'));

    return HttpResponse.json(success({
      ...review,
      content: faker.lorem.paragraphs(3),
      comments: mockComments,
      version_history: [
        { version: 1, content: '初始版本', saved_at: faker.date.recent({ days: 5 }).toISOString() },
        { version: 2, content: '修改版本', saved_at: faker.date.recent({ days: 3 }).toISOString() },
      ],
    }));
  }),

  // POST /api/v1/review/{id}/approve
  http.post('/api/v1/review/:id/approve', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const index = mockPendingReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      const item = mockPendingReviews.splice(index, 1)[0];
      mockReviewHistory.unshift({
        ...item,
        status: 'approved',
        approver: '王主任',
        reviewed_at: new Date().toISOString(),
        comment: body.comment || '审批通过',
      });
    }
    return HttpResponse.json(success({ id, status: 'approved', reviewed_at: new Date().toISOString() }, '审批通过'));
  }),

  // POST /api/v1/review/{id}/reject
  http.post('/api/v1/review/:id/reject', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const index = mockPendingReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      const item = mockPendingReviews.splice(index, 1)[0];
      mockReviewHistory.unshift({
        ...item,
        status: 'rejected',
        approver: '王主任',
        reviewed_at: new Date().toISOString(),
        comment: body.reason || body.comment || '审批驳回',
      });
    }
    return HttpResponse.json(success({ id, status: 'rejected', reviewed_at: new Date().toISOString() }, '已驳回'));
  }),

  // GET /api/v1/review/stats
  http.get('/api/v1/review/stats', async () => {
    await delay(200);
    return HttpResponse.json(success({
      stats: {
        pending: mockPendingReviews.length,
        approved: mockReviewHistory.filter(r => r.status === 'approved').length,
        rejected: mockReviewHistory.filter(r => r.status === 'rejected').length,
        total: mockPendingReviews.length + mockReviewHistory.length,
        pass_rate: Math.round((mockReviewHistory.filter(r => r.status === 'approved').length / (mockReviewHistory.length || 1)) * 100),
        avg_duration: 4.2,
      },
    }));
  }),
];