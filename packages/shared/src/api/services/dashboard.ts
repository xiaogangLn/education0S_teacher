// packages/shared/src/api/services/dashboard.ts
import { httpClient } from '../client';

export const dashboardService = {
  // GET /api/v1/dashboard/overview - 获取总览数据
  getOverview: () => {
    return httpClient.get<{
      stats: {
        total_students: number;
        total_teachers: number;
        total_classes: number;
        /** 知识库用户文件（不含教材同步/系统模板） */
        total_documents: number;
        total_lesson_plans: number;
        total_assignments: number;
      };
      trends: {
        mastery_avg: number;
        mastery_change: number;
        active_rate: number;
      };
      alerts: Array<{
        id: string;
        type: 'warning' | 'danger' | 'info';
        title: string;
        description: string;
        time: string;
      }>;
    }>('/dashboard/overview');
  },

  // GET /api/v1/dashboard/trend - 获取年级趋势
  getTrend: (params?: { weeks?: number; grade_id?: string; enrollment_year?: string }) => {
    return httpClient.get<{
      grades: Array<{
        grade: string;
        mastery_rate: number;
        change: number;
        trend: 'up' | 'down' | 'stable';
      }>;
      history: Array<{
        date: string;
        mastery_rate: number;
      }>;
    }>('/dashboard/trend', { params });
  },

  // GET /api/v1/dashboard/class/{class_id} - 获取班级学情
  getClassDetail: (classId: string) => {
    return httpClient.get<{
      class: { id: string; name: string; student_count: number };
      stats: {
        avg_mastery: number;
        pass_rate: number;
        excellent_rate: number;
        trend: 'up' | 'down' | 'stable';
      };
      subjects: Record<string, { mastery: number; rank: number }>;
      top_students: Array<{ name: string; mastery: number }>;
      bottom_students: Array<{ name: string; mastery: number }>;
    }>(`/dashboard/class/${classId}`);
  },

  // GET /api/v1/dashboard/stats - 获取统计卡片
  getStats: () => {
    return httpClient.get<{
      students: {
        total: number;
        active: number;
        transferred: number;
        graduated: number;
      };
      documents: {
        total: number;
        by_type: Record<string, number>;
        by_permission: Record<string, number>;
      };
      lesson_plans: { total: number };
      assignments: { total: number };
      tasks: {
        total: number;
        pending: number;
        reviewing: number;
        completed: number;
      };
    }>('/dashboard/stats');
  },

  // GET /api/v1/dashboard/activities - 获取最近动态
  getActivities: (params?: { limit?: number; type?: 'create' | 'update' | 'approve' | 'sync' }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        user: string;
        action: string;
        target: string;
        time: string;
        type: 'create' | 'update' | 'approve' | 'sync';
      }>;
    }>('/dashboard/activities', { params });
  },
};