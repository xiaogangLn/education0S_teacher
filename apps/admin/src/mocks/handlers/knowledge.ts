// packages/shared/src/mocks/handlers/knowledge.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { success, error, paginate, delay } from './index';

const mockDocuments = Array.from({ length: 30 }, (_, i) => ({
  id: `d${String(i + 1).padStart(3, '0')}`,
  title: faker.helpers.arrayElement([
    '2026届教学计划 · 数学',
    '二次函数教案',
    '函数图像动态演示',
    '英语听力训练音频',
    '校本课程纲要 2026版',
    '月考成绩分析',
    '三角函数单元测试',
    '导数概念微课视频',
    '数学建模竞赛指导',
    '物理实验报告模板',
  ]),
  type: faker.helpers.arrayElement(['document', 'sheet', 'video', 'audio', 'pdf', 'link']),
  permission: faker.helpers.arrayElement(['school', 'grade', 'class', 'personal']),
  category: faker.helpers.arrayElement(['教案', '课件', '试卷', '成绩分析', '教学视频']),
  file_size: faker.number.int({ min: 100, max: 50000 }),
  file_url: `https://storage.example.com/docs/${faker.string.alphanumeric(8)}.pdf`,
  creator_name: faker.person.fullName(),
  creator_id: `u${faker.number.int({ min: 1, max: 10 })}`,
  created_at: faker.date.recent({ days: 30 }).toISOString(),
  view_count: faker.number.int({ min: 0, max: 500 }),
  download_count: faker.number.int({ min: 0, max: 100 }),
  is_favorited: faker.datatype.boolean(),
  status: 'active',
  tags: faker.helpers.arrayElements(['数学', '函数', '导数', '高考'], { min: 0, max: 3 }),
}));

const mockFolders = [
  { id: 'f1', parent_id: null, name: '校本资源', permission: 'school', created_at: new Date().toISOString() },
  { id: 'f2', parent_id: null, name: '年级共享', permission: 'grade', created_at: new Date().toISOString() },
  { id: 'f3', parent_id: null, name: '班级资料', permission: 'class', created_at: new Date().toISOString() },
  { id: 'f4', parent_id: null, name: '个人草稿', permission: 'personal', created_at: new Date().toISOString() },
];

const mockCategories = [
  { id: 'c1', name: '教案', count: 42 },
  { id: 'c2', name: '课件', count: 28 },
  { id: 'c3', name: '试卷', count: 35 },
  { id: 'c4', name: '成绩分析', count: 18 },
  { id: 'c5', name: '教学视频', count: 12 },
];

const mockPermissions = [
  { key: 'school', label: '学校级', icon: '🏛️', desc: '全校师生可见', count: 18 },
  { key: 'grade', label: '年级级', icon: '📚', desc: '本年级师生可见', count: 32 },
  { key: 'class', label: '班级级', icon: '🏫', desc: '本班级师生可见', count: 46 },
  { key: 'personal', label: '个人级', icon: '👤', desc: '仅本人可见', count: 32 },
];

export const knowledgeHandlers = [
  // GET /api/v1/knowledge/documents
  http.get('/api/v1/knowledge/documents', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const keyword = url.searchParams.get('keyword') || '';
    const type = url.searchParams.get('type') || '';
    const permission = url.searchParams.get('permission') || '';

    let filtered = [...mockDocuments];
    if (keyword) filtered = filtered.filter(d => d.title.includes(keyword) || d.creator_name.includes(keyword));
    if (type) filtered = filtered.filter(d => d.type === type);
    if (permission) filtered = filtered.filter(d => d.permission === permission);

    return HttpResponse.json(success(paginate(filtered, page, pageSize)));
  }),

  // GET /api/v1/knowledge/documents/{id}
  http.get('/api/v1/knowledge/documents/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) return HttpResponse.json(error(1004, '文档不存在'), { status: 404 });

    return HttpResponse.json(success({
      ...doc,
      content: faker.lorem.paragraphs(3),
      tags: ['数学', '函数'],
      folder_id: 'f1',
      comments: Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
        user_name: faker.person.fullName(),
        content: faker.lorem.sentence(),
        created_at: faker.date.recent().toISOString(),
      })),
    }));
  }),

  // POST /api/v1/knowledge/documents
  http.post('/api/v1/knowledge/documents', async ({ request }) => {
    await delay(400);
    const body = await request.json() as any;
    const newDoc = {
      id: `d${String(mockDocuments.length + 1).padStart(3, '0')}`,
      ...body,
      creator_name: '当前用户',
      created_at: new Date().toISOString(),
      view_count: 0,
      download_count: 0,
      is_favorited: false,
      status: 'active',
    };
    mockDocuments.unshift(newDoc);
    return HttpResponse.json(success({ id: newDoc.id, title: newDoc.title, created_at: newDoc.created_at }, '创建成功'));
  }),

  // PUT /api/v1/knowledge/documents/{id}
  http.put('/api/v1/knowledge/documents/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) return HttpResponse.json(error(1004, '文档不存在'), { status: 404 });
    mockDocuments[index] = { ...mockDocuments[index], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(success({ success: true }, '更新成功'));
  }),

  // DELETE /api/v1/knowledge/documents/{id}
  http.delete('/api/v1/knowledge/documents/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) return HttpResponse.json(error(1004, '文档不存在'), { status: 404 });
    mockDocuments.splice(index, 1);
    return HttpResponse.json(success({ success: true }, '删除成功'));
  }),

  // GET /api/v1/knowledge/folders
  http.get('/api/v1/knowledge/folders', async () => {
    await delay(200);
    return HttpResponse.json(success({ items: mockFolders }));
  }),

  // POST /api/v1/knowledge/folders
  http.post('/api/v1/knowledge/folders', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const newFolder = { id: `f${mockFolders.length + 1}`, ...body, created_at: new Date().toISOString() };
    mockFolders.push(newFolder);
    return HttpResponse.json(success(newFolder, '创建成功'));
  }),

  // GET /api/v1/knowledge/permissions
  http.get('/api/v1/knowledge/permissions', async () => {
    await delay(200);
    return HttpResponse.json(success({ items: mockPermissions }));
  }),

  // PUT /api/v1/knowledge/documents/{id}/permission
  http.put('/api/v1/knowledge/documents/:id/permission', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const body = await request.json() as any;
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) return HttpResponse.json(error(1004, '文档不存在'), { status: 404 });
    doc.permission = body.permission;
    return HttpResponse.json(success({ success: true }, '权限更新成功'));
  }),

  // GET /api/v1/knowledge/categories
  http.get('/api/v1/knowledge/categories', async () => {
    await delay(200);
    return HttpResponse.json(success({ items: mockCategories }));
  }),

  // POST /api/v1/knowledge/categories
  http.post('/api/v1/knowledge/categories', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const newCategory = { id: `c${mockCategories.length + 1}`, ...body, count: 0 };
    mockCategories.push(newCategory);
    return HttpResponse.json(success(newCategory, '创建成功'));
  }),

  // GET /api/v1/knowledge/search
  http.get('/api/v1/knowledge/search', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');

    const results = mockDocuments.filter(d => d.title.includes(keyword) || d.creator_name.includes(keyword));
    return HttpResponse.json(success(paginate(results, page, pageSize)));
  }),

  // POST /api/v1/knowledge/documents/{id}/favorite
  http.post('/api/v1/knowledge/documents/:id/favorite', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) return HttpResponse.json(error(1004, '文档不存在'), { status: 404 });
    doc.is_favorited = !doc.is_favorited;
    return HttpResponse.json(success({ favorited: doc.is_favorited }, doc.is_favorited ? '已收藏' : '已取消收藏'));
  }),

  // GET /api/v1/knowledge/favorites
  http.get('/api/v1/knowledge/favorites', async () => {
    await delay(200);
    const items = mockDocuments.filter(d => d.is_favorited);
    return HttpResponse.json(success({ items, total: items.length }));
  }),

  // GET /api/v1/knowledge/recent
  http.get('/api/v1/knowledge/recent', async () => {
    await delay(200);
    return HttpResponse.json(success({ items: mockDocuments.slice(0, 10) }));
  }),

  // POST /api/v1/knowledge/grading/photo
  http.post('/api/v1/knowledge/grading/photo', async () => {
    await delay(1000);
    return HttpResponse.json(success({
      record_id: `grd_${Date.now()}`,
      ocr_result: '1. 求 y=x² 在 x=1 处的导数\n答：2',
      handwriting_analysis: { neatness: 82, stroke: 78, consistency: 85, layout: 75 },
      ai_score: 72,
      ai_feedback: '基础题掌握较好，拓展题需加强',
      status: 'pending_confirm',
    }, '批改完成'));
  }),
];