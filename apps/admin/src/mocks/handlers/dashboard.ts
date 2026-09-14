// packages/shared/src/mocks/handlers/dashboard.ts
import { http, HttpResponse } from 'msw';
import { success, delay } from './index';

export const dashboardHandlers = [
  http.get('/api/v1/dashboard/overview', async () => {
    await delay(200);
    return HttpResponse.json(success({
      stats: {
        total_students: 1247,
        total_teachers: 38,
        total_classes: 12,
        total_documents: 128,
        total_lesson_plans: 42,
        total_assignments: 86,
      },
      trends: { mastery_avg: 78.5, mastery_change: 3.2, active_rate: 92 },
      alerts: [
        { id: 'a1', type: 'warning', title: '九年级4班数学下降', description: '连续2周下降', time: '2026-09-02' },
      ],
    }));
  }),

  http.get('/api/v1/dashboard/trend', async () => {
    await delay(200);
    return HttpResponse.json(success({
      grades: [
        { grade: '七年级', mastery_rate: 82, change: 4.2, trend: 'up' },
        { grade: '八年级', mastery_rate: 75, change: 2.1, trend: 'up' },
        { grade: '九年级', mastery_rate: 78.5, change: 3.2, trend: 'up' },
      ],
      history: Array.from({ length: 6 }, (_, i) => ({
        date: `2026-08-${String(i + 1).padStart(2, '0')}`,
        mastery_rate: 70 + i * 2,
      })),
    }));
  }),
];