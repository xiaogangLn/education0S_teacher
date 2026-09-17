// packages/shared/src/mocks/handlers/users.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, paginate, delay } from './index';

interface User {
  id: string;
  username: string;
  real_name: string;
  phone: string;
  email: string;
  role: string;
  school_id: string;
  grade_id: string;
  class_id: string;
  avatar_url: string;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  updated_at?: string;
}

class UserManager {
  private users: User[] = [];
  private readonly STORAGE_KEY = 'mock_users_data';

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
        console.log(`[UserManager] Loaded ${this.users.length} users from localStorage`);
      } else {
        this.initializeDefaultUsers();
      }
    } catch (e) {
      console.error('[UserManager] Failed to load users from localStorage:', e);
      this.initializeDefaultUsers();
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
      console.log(`[UserManager] Saved ${this.users.length} users to localStorage`);
    } catch (e) {
      console.error('[UserManager] Failed to save users to localStorage:', e);
    }
  }

  private initializeDefaultUsers() {
    this.users = Array.from({ length: 25 }, (_, i) => ({
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
    this.saveUsers();
  }

  getAll(): User[] {
    return [...this.users];
  }

  getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(userData: Partial<User>): User {
    const newUser: User = {
      id: `u${String(this.users.length + 1).padStart(3, '0')}`,
      username: userData.username || faker.internet.username(),
      real_name: userData.real_name || faker.person.fullName(),
      phone: userData.phone || faker.phone.number(),
      email: userData.email || faker.internet.email(),
      role: userData.role || 'teacher',
      school_id: userData.school_id || 's1',
      grade_id: userData.grade_id || 'g1',
      class_id: userData.class_id || 'c1',
      avatar_url: userData.avatar_url || '',
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  update(id: string, userData: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.users[index] = {
      ...this.users[index],
      ...userData,
      updated_at: new Date().toISOString(),
    };

    this.saveUsers();
    return this.users[index];
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    this.saveUsers();
    return true;
  }

  activate(id: string): User | null {
    return this.update(id, { is_active: true });
  }

  deactivate(id: string): User | null {
    return this.update(id, { is_active: false });
  }

  // 支持任意ID格式的用户创建（用于真实后端模拟）
  findOrCreateUser(id: string): User {
    let user = this.getById(id);
    if (!user) {
      user = {
        id,
        username: faker.internet.username(),
        real_name: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        role: 'teacher',
        school_id: 's1',
        grade_id: 'g1',
        class_id: 'c1',
        avatar_url: '',
        is_active: false, // 默认为未激活状态
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      this.users.push(user);
      this.saveUsers();
      console.log(`[UserManager] Created new user with ID: ${id}`);
    }
    return user;
  }
}

const userManager = new UserManager();

export const usersHandlers = [
  // GET /api/v1/users
  http.get('/api/v1/users', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const keyword = url.searchParams.get('keyword') || '';
    const role = url.searchParams.get('role') || '';

    let filtered = userManager.getAll();
    if (keyword) filtered = filtered.filter(u => u.real_name.includes(keyword) || u.username.includes(keyword));
    if (role) filtered = filtered.filter(u => u.role === role);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/users/{id}
  http.get('/api/v1/users/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const user = userManager.getById(id);
    if (!user) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    return HttpResponse.json(success({ user }));
  }),

  // POST /api/v1/users
  http.post('/api/v1/users', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const newUser = userManager.create(body);
    return HttpResponse.json(success({ user: newUser }, '创建成功'));
  }),

  // PUT /api/v1/users/{id}
  http.put('/api/v1/users/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const updatedUser = userManager.update(id, body);

    if (!updatedUser) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    return HttpResponse.json(success({ success: true }, '更新成功'));
  }),

  // DELETE /api/v1/users/{id}
  http.delete('/api/v1/users/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const success = userManager.delete(id);

    if (!success) return HttpResponse.json(error(1004, '用户不存在'), { status: 404 });
    return HttpResponse.json(success({ success: true }, '删除成功'));
  }),

  // POST /api/v1/users/{id}/deactivate
  http.post('/api/v1/users/:id/deactivate', async ({ params, request }) => {
    await delay(200);
    const { id } = params;

    // 检查Authorization头，验证admin权限
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(error(401, '未授权访问'), { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      // 简单的JWT解析（仅用于开发）
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRoles = Array.isArray(payload.roles) ? payload.roles : [payload.role];

      // 检查是否有admin权限
      if (!userRoles.includes('admin')) {
        return HttpResponse.json(error(403, '权限不足，需要管理员权限'), { status: 403 });
      }
    } catch (e) {
      return HttpResponse.json(error(401, '无效的授权令牌'), { status: 401 });
    }

    // 真正地停用用户（如果用户不存在，则创建并停用）
    const user = userManager.findOrCreateUser(id);
    const deactivatedUser = userManager.deactivate(id);

    if (!deactivatedUser) {
      return HttpResponse.json(error(500, '停用用户失败'), { status: 500 });
    }

    console.log(`[MSW] User ${id} deactivated by admin. Current status: ${deactivatedUser.is_active}`);
    return HttpResponse.json(success({ success: true, user: deactivatedUser }, '已停用'));
  }),

  // POST /api/v1/users/{id}/activate
  http.post('/api/v1/users/:id/activate', async ({ params, request }) => {
    await delay(200);
    const { id } = params;

    // 检查Authorization头，验证admin权限
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(error(401, '未授权访问'), { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      // 简单的JWT解析（仅用于开发）
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRoles = Array.isArray(payload.roles) ? payload.roles : [payload.role];

      // 检查是否有admin权限
      if (!userRoles.includes('admin')) {
        return HttpResponse.json(error(403, '权限不足，需要管理员权限'), { status: 403 });
      }
    } catch (e) {
      return HttpResponse.json(error(401, '无效的授权令牌'), { status: 401 });
    }

    // 真正地激活用户（如果用户不存在，则创建并激活）
    const user = userManager.findOrCreateUser(id);
    const activatedUser = userManager.activate(id);

    if (!activatedUser) {
      return HttpResponse.json(error(500, '激活用户失败'), { status: 500 });
    }

    console.log(`[MSW] User ${id} activated by admin. Current status: ${activatedUser.is_active}`);
    return HttpResponse.json(success({ success: true, user: activatedUser }, '已启用'));
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