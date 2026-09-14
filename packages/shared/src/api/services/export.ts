// packages/shared/src/api/services/export.ts
import { httpClient } from '../client';

export const exportService = {
  // POST /api/v1/export - 创建导出任务
  create: (data: {
    scope: {
      academic?: boolean;
      teacher?: boolean;
      student?: boolean;
      plan?: boolean;
    };
    format: 'excel' | 'pdf' | 'csv' | 'json';
    time_range: '1month' | '3months' | '6months' | '1year';
    grade_id?: string;
    class_id?: string;
  }) => {
    return httpClient.post<{
      task_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      file_name: string;
      created_at: string;
    }>('/export', data);
  },

  // GET /api/v1/export/tasks/{task_id} - 查询导出任务
  getTask: (taskId: string) => {
    return httpClient.get<{
      task_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      file_name: string;
      file_size: number;
      download_url: string;
      created_at: string;
      completed_at: string;
    }>(`/export/tasks/${taskId}`);
  },

  // GET /api/v1/export/tasks - 获取导出任务列表
  getTasks: (params?: { page?: number; page_size?: number; status?: string }) => {
    return httpClient.get<{
      items: Array<{
        task_id: string;
        file_name: string;
        format: string;
        status: string;
        progress: number;
        created_at: string;
        download_url: string;
      }>;
      total: number;
    }>('/export/tasks', { params });
  },

  // GET /api/v1/export/download/{task_id} - 下载文件
  download: (taskId: string) => {
    return httpClient.get(`/export/download/${taskId}`, { responseType: 'blob' });
  },

  // DELETE /api/v1/export/tasks/{task_id} - 删除导出任务
  deleteTask: (taskId: string) => {
    return httpClient.delete(`/export/tasks/${taskId}`);
  },

  // GET /api/v1/export/templates - 获取导出模板
  getTemplates: () => {
    return httpClient.get<{
      items: Array<{
        id: string;
        name: string;
        description: string;
        scope: any;
        format: string;
        time_range: string;
        is_default: boolean;
      }>;
    }>('/export/templates');
  },
};