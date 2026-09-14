// packages/shared/src/api/services/portrait.ts
import { httpClient } from '../client';

export interface StudentPortrait {
  student_id: string;
  student_name: string;
  class_name: string;
  academic: {
    subjects: Record<string, { score: number; mastery: number; rank: number }>;
    overall_mastery: number;
    trend: 'up' | 'down' | 'stable';
    strengths: string[];
    weaknesses: string[];
  };
  abilities: {
    memory: number;
    comprehension: number;
    application: number;
    analysis: number;
    evaluation: number;
    creation: number;
  };
  behaviors: {
    homework_rate: number;
    homework_accuracy: number;
    participation: number;
    handwriting_score: number;
    learning_habit: 'good' | 'moderate' | 'poor';
  };
  psychology: {
    motivation: number;
    anxiety: number;
    self_efficacy: number;
    cooperation: number;
    stress_level: 'low' | 'medium' | 'high';
  };
  growth: {
    milestones: Array<{ date: string; title: string; description: string }>;
    improvement_rate: number;
    teacher_comments: Array<{ teacher: string; content: string; date: string }>;
  };
  updated_at: string;
}

export interface TeacherPortrait {
  teacher_id: string;
  teacher_name: string;
  school_name: string;
  department: string;
  teaching: {
    lesson_plan_quality: number;
    classroom_interaction: number;
    teaching_style: string;
    innovation_score: number;
  };
  research: {
    research_participation: number;
    projects_count: number;
    training_hours: number;
  };
  effectiveness: {
    student_progress: number;
    satisfaction: number;
    peer_evaluation: number;
  };
  growth: {
    capability_evolution: string;
    milestones: Array<{ date: string; title: string }>;
    development_suggestions: string[];
  };
  overall_score: number;
  growth_trend: number;
  updated_at: string;
}

export const portraitService = {
  // GET /api/v1/portraits/student/{student_id} - 获取学生画像
  getStudent: (studentId: string) => {
    return httpClient.get<{ data: StudentPortrait }>(`/portraits/student/${studentId}`);
  },

  // GET /api/v1/portraits/teacher/{teacher_id} - 获取教师画像
  getTeacher: (teacherId: string) => {
    return httpClient.get<{ data: TeacherPortrait }>(`/portraits/teacher/${teacherId}`);
  },

  // GET /api/v1/portraits/stats - 获取画像统计
  getStats: () => {
    return httpClient.get<{
      stats: {
        total_students: number;
        avg_mastery: number;
        avg_abilities: Record<string, number>;
        distribution: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
    }>('/portraits/stats');
  },

  // GET /api/v1/portraits/class/{class_id} - 获取班级画像汇总
  getClassPortrait: (classId: string) => {
    return httpClient.get<{
      data: {
        class_id: string;
        class_name: string;
        total_students: number;
        avg_mastery: number;
        subject_mastery: Record<string, number>;
        ability_distribution: Record<string, number>;
        top_students: StudentPortrait[];
        bottom_students: StudentPortrait[];
      };
    }>(`/portraits/class/${classId}`);
  },

  // GET /api/v1/portraits/student/{student_id}/abilities - 获取能力雷达
  getAbilities: (studentId: string) => {
    return httpClient.get<{
      abilities: Array<{ name: string; value: number; label: string }>;
    }>(`/portraits/student/${studentId}/abilities`);
  },

  // GET /api/v1/portraits/student/{student_id}/growth - 获取成长轨迹
  getGrowth: (studentId: string) => {
    return httpClient.get<{
      milestones: Array<{ date: string; title: string; description: string }>;
      improvement_rate: number;
      teacher_comments: Array<{ teacher: string; content: string; date: string }>;
    }>(`/portraits/student/${studentId}/growth`);
  },

  // GET /api/v1/portraits/student/{student_id}/recommendations - AI学习建议
  getRecommendations: (studentId: string) => {
    return httpClient.get<{ recommendations: string[] }>(
      `/portraits/student/${studentId}/recommendations`
    );
  },
};