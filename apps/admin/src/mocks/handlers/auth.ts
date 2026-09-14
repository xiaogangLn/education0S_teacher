// packages/shared/src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';
import { success, error, delay } from './index';

const mockUsers = {
  teacher: {
    id: 'u1',
    username: 'teacher',
    real_name: '张老师',
    phone: '138****1234',
    email: 'zhang@school.com',
    role: 'teacher',
    school_id: 's1',
    grade_id: 'g1',
    class_id: 'c1',
    avatar_url: '',
    is_active: true,
  },
  admin: {
    id: 'u2',
    username: 'admin',
    real_name: '王主任',
    phone: '139****5678',
    email: 'wang@school.com',
    role: 'admin',
    school_id: 's1',
    grade_id: '',
    class_id: '',
    avatar_url: '',
    is_active: true,
  },
  student: {
    id: 'u3',
    username: 'student',
    real_name: '张三',
    phone: '137****9012',
    email: 'zhangsan@school.com',
    role: 'student',
    school_id: 's1',
    grade_id: 'g1',
    class_id: 'c1',
    avatar_url: '',
    is_active: true,
  },
};

let currentUser: any = null;
let accessToken: string | null = null;
let refreshToken: string | null = null;

const generateToken = (user: any, expiresIn: number = 604800) => {
  return btoa(JSON.stringify({ sub: user.id, username: user.username, role: user.role, exp: Date.now() / 1000 + expiresIn }));
};

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post('/api/v1/auth/login', async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    const { phone, password } = body;

    let user = null;
    if (phone === '138****1234' && password === '123456') user = mockUsers.teacher;
    else if (phone === '139****5678' && password === '123456') user = mockUsers.admin;
    else if (phone === '137****9012' && password === '123456') user = mockUsers.student;
    else {
      return HttpResponse.json(error(2001, '手机号或密码错误'), { status: 401 });
    }

    currentUser = user;
    accessToken = generateToken(user);
    refreshToken = generateToken(user, 2592000);

    return HttpResponse.json(success({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 604800,
      user,
    }, '登录成功'));
  }),

  // POST /api/v1/auth/refresh
  http.post('/api/v1/auth/refresh', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.refreshToken !== refreshToken) {
      return HttpResponse.json(error(1002, '无效的刷新令牌'), { status: 401 });
    }
    accessToken = generateToken(currentUser || mockUsers.teacher);
    return HttpResponse.json(success({ access_token: accessToken, expires_in: 604800 }, '刷新成功'));
  }),

  // POST /api/v1/auth/logout
  http.post('/api/v1/auth/logout', async () => {
    await delay(200);
    currentUser = null;
    accessToken = null;
    refreshToken = null;
    return HttpResponse.json(success({ success: true }, '登出成功'));
  }),

  // GET /api/v1/auth/me
  http.get('/api/v1/auth/me', async () => {
    await delay(200);
    if (!currentUser) {
      return HttpResponse.json(error(1002, '未认证'), { status: 401 });
    }
    return HttpResponse.json(success({ user: currentUser }));
  }),

  // PUT /api/v1/auth/password
  http.put('/api/v1/auth/password', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.old_password !== '123456') {
      return HttpResponse.json(error(2002, '原密码错误'));
    }
    return HttpResponse.json(success({ success: true }, '密码修改成功'));
  }),

  // POST /api/v1/auth/password/reset
  http.post('/api/v1/auth/password/reset', async () => {
    await delay(300);
    return HttpResponse.json(success({ success: true }, '密码重置成功'));
  }),

  // POST /api/v1/auth/code/send
  http.post('/api/v1/auth/code/send', async () => {
    await delay(300);
    return HttpResponse.json(success({ code: '123456', expires_in: 300 }, '验证码已发送'));
  }),

  // POST /api/v1/auth/code/verify
  http.post('/api/v1/auth/code/verify', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.code && body.code.length === 6) {
      return HttpResponse.json(success({ valid: true }, '验证成功'));
    }
    return HttpResponse.json(error(1001, '验证码错误'));
  }),
];