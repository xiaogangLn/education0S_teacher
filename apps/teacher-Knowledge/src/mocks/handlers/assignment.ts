// packages/shared/src/mocks/handlers/assignment.ts
import { http, HttpResponse } from 'msw';
import { success, delay } from './index';

export const assignmentHandlers = [
  http.post('/api/v1/assignment/generate-pdf', async () => {
    await delay(800);
    return HttpResponse.json(success({
      task_id: `pdf_${Date.now()}`,
      pdf_url: '/api/v1/assignment/download/pdf_xxx',
      total_pages: 8,
      total_students: 45,
      generated_at: new Date().toISOString(),
    }, 'PDF生成成功'));
  }),

  http.get('/api/v1/assignment/preview/:taskId', async () => {
    await delay(200);
    return HttpResponse.json(success({
      task: {
        id: 'task_001',
        title: '导数的几何意义',
        class_name: '九年级1班',
        pages: [{ page: 1, content: '第1页内容' }],
        common_questions: [{ id: 'q1', content: '求 y=x² 的导数', type: 'answer', score: 10 }],
        personalized_questions: [{ id: 'p1', content: '个性化题目', type: 'answer', score: 15 }],
      },
    }));
  }),
];