// packages/shared/src/mocks/handlers/users.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, paginate, delay } from './index';

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: `u${String(i + 1).padStart(3, '0')}`,
  username: faker.internet.username(),
  real_name: faker.person.fullName(),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['teacher', 'student', 'admin', 'grade_admin']),
  school_id: 's1',
  grade_id: faker.helpers.arrayElement(['g1', 'g2', 'g3']),
  class_id: faker.helpers.arrayElement(['c1', 'c2', 'c3', 'c4']),
  avatar_url: '',
  is_active: true,
  last_login_at: faker.date.recent().toISOString(),
  created_at: faker.date.recent({ days: 30 }).toISOString(),
}));

export const usersHandlers = [
  // GET /api/v1/users
  http.get('/api/v1/users', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const keyword = url.searchParams.get('keyword') || '';
    const role = url.searchParams.get('role') || '';

    let filtered = [...mockUsers];
    if (keyword) filtered = filtered.filter(u => u.real_name.includes(keyword) || u.username.includes(keyword));
    if (role) filtered = filtered.filter(u => u.role === role);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/users/{id}
  http.get('/api/v1/users/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    if (!user) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    return HttpResponse.json(success({ user }));
  }),

  // POST /api/v1/users
  http.post('/api/v1/users', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const newUser = {
      id: `u${String(mockUsers.length + 1).padStart(3, '0')}`,
      ...body,
      class_id: Array.isArray(body.class_ids) && body.class_ids.length ? body.class_ids[0] : body.class_id,
      class_ids: Array.isArray(body.class_ids)
        ? body.class_ids.slice(0, 3)
        : (body.class_id ? [body.class_id] : []),
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return HttpResponse.json(success({ user: newUser }, '创建成功'));
  }),

  // PUT /api/v1/users/{id}
  http.put('/api/v1/users/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    const classIds = Array.isArray(body.class_ids)
      ? body.class_ids.slice(0, 3)
      : (body.class_id ? [body.class_id] : mockUsers[index].class_ids);
    mockUsers[index] = {
      ...mockUsers[index],
      ...body,
      class_ids: classIds,
      class_id: classIds?.[0] || body.class_id || mockUsers[index].class_id,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(success({ success: true }, '更新成功'));
  }),

  // DELETE /api/v1/users/{id}
  http.delete('/api/v1/users/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    mockUsers.splice(index, 1);
    return HttpResponse.json(success({ success: true }, '删除成功'));
  }),

  // POST /api/v1/users/{id}/deactivate
  http.post('/api/v1/users/:id/deactivate', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    if (!user) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    user.is_active = false;
    return HttpResponse.json(success({ success: true }, '已停用'));
  }),

  // POST /api/v1/users/{id}/activate
  http.post('/api/v1/users/:id/activate', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    if (!user) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    user.is_active = true;
    return HttpResponse.json(success({ success: true }, '已启用'));
  }),

  // POST /api/v1/users/import
  http.post('/api/v1/users/import', async () => {
    await delay(1000);
    return HttpResponse.json(success({
      task_id: `task_${Date.now()}`,
      total: 100,
      success: 95,
      failed: 5,
      errors: [{ row: 3, field: 'phone', reason: '手机号格式错误' }],
    }, '导入完成'));
  }),

  // GET /api/v1/users/import/template
  http.get('/api/v1/users/import/template', async () => {
    await delay(300);
    return new HttpResponse('id,username,phone,role', { headers: { 'Content-Type': 'text/csv' } });
  }),

  // GET /api/v1/users/export
  http.get('/api/v1/users/export', async () => {
    await delay(500);
    return new HttpResponse('id,username,phone,role\n1,teacher,138****1234,teacher', {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=users.csv' },
    });
  }),
];