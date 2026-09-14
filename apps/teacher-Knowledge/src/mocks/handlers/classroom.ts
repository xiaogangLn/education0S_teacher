// packages/shared/src/mocks/handlers/classroom.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, delay } from './index';

export const classroomHandlers = [
  http.post('/api/v1/classroom/evaluations', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    return HttpResponse.json(success({
      id: `eval_${Date.now()}`,
      ...body,
      teacher: '张老师',
      created_at: new Date().toISOString(),
    }, '评价创建成功'));
  }),

  http.get('/api/v1/classroom/evaluations/student/:studentId', async () => {
    await delay(200);
    return HttpResponse.json(success({
      items: Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        rating: faker.number.int({ min: 3, max: 5 }),
        comment: faker.lorem.sentence(),
        teacher: faker.person.fullName(),
        created_at: faker.date.recent().toISOString(),
      })),
    }));
  }),
];