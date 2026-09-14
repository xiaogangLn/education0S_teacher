// packages/shared/src/mocks/handlers/portrait.ts
import { http, HttpResponse } from 'msw';
import { success, delay } from './index';

export const portraitHandlers = [
  http.get('/api/v1/portraits/student/:studentId', async () => {
    await delay(200);
    return HttpResponse.json(success({
      student_id: 's1',
      student_name: '张三',
      class_name: '九年级1班',
      academic: { overall_mastery: 78, trend: 'up', strengths: ['数学', '物理'], weaknesses: ['英语'] },
      abilities: { memory: 72, comprehension: 58, application: 45, analysis: 40, evaluation: 35, creation: 30 },
      behaviors: { homework_rate: 85, participation: 4.2, handwriting_score: 78 },
      psychology: { motivation: 3.8, anxiety: 'medium', self_efficacy: 3.5 },
      growth: { improvement_rate: 12, milestones: [] },
      updated_at: new Date().toISOString(),
    }));
  }),

  http.get('/api/v1/portraits/teacher/:teacherId', async () => {
    await delay(200);
    return HttpResponse.json(success({
      teacher_id: 'u1',
      teacher_name: '张老师',
      school_name: 'XX中学',
      teaching: { lesson_plan_quality: 4.5, classroom_interaction: 4.2, innovation_score: 88 },
      research: { research_participation: 4, training_hours: 12 },
      effectiveness: { student_progress: 6, satisfaction: 4.6 },
      growth: { capability_evolution: '稳步', milestones: [] },
      overall_score: 4.3,
      updated_at: new Date().toISOString(),
    }));
  }),
];