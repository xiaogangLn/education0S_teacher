// packages/shared/src/api/services/assignment.ts
import { httpClient } from '../client';
import { Question } from './learning';

export const assignmentService = {
  // POST /api/v1/assignment/generate-pdf - 生成作业PDF
  generatePDF: (data: {
    lesson_plan_id: string;
    class_id: string;
    include_common: boolean;
    include_personalized: boolean;
    personalized_map?: Record<string, Question[]>;
  }) => {
    return httpClient.post<{
      task_id: string;
      pdf_url: string;
      total_pages: number;
      total_students: number;
      generated_at: string;
    }>('/assignment/generate-pdf', data);
  },

  // GET /api/v1/assignment/preview/{task_id} - 获取作业预览
  preview: (taskId: string) => {
    return httpClient.get<{
      task: {
        id: string;
        title: string;
        class_name: string;
        student_name?: string;
        pages: Array<{ page: number; content: string }>;
        common_questions: Question[];
        personalized_questions: Question[];
      };
    }>(`/assignment/preview/${taskId}`);
  },

  // POST /api/v1/assignment/batch-print - 批量打印
  batchPrint: (data: {
    task_id: string;
    student_ids?: string[];
    copies?: number;
    duplex?: boolean;
    paper_size?: 'A4' | 'B5';
  }) => {
    return httpClient.post<{
      record_id: string;
      total_students: number;
      total_pages: number;
      print_status: 'pending' | 'printing' | 'completed' | 'failed';
    }>('/assignment/batch-print', data);
  },

  // GET /api/v1/assignment/print-records - 获取打印记录
  getPrintRecords: (params?: {
    page?: number;
    page_size?: number;
    lesson_plan_id?: string;
    class_id?: string;
    status?: 'pending' | 'printing' | 'completed' | 'distributed';
  }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        lesson_plan_title: string;
        class_name: string;
        total_students: number;
        printed_count: number;
        distributed_count: number;
        status: string;
        created_at: string;
      }>;
      total: number;
    }>('/assignment/print-records', { params });
  },

  // PUT /api/v1/assignment/distribute/{record_id} - 标记已分发
  distribute: (recordId: string, data?: { student_ids?: string[]; distributed_at?: string }) => {
    return httpClient.put<{
      record_id: string;
      distributed_count: number;
      total_count: number;
      status: 'distributed';
    }>(`/assignment/distribute/${recordId}`, data || {});
  },

  // GET /api/v1/assignment/download/{record_id} - 下载作业PDF
  download: (recordId: string) => {
    return httpClient.get(`/assignment/download/${recordId}`, { responseType: 'blob' });
  },
};