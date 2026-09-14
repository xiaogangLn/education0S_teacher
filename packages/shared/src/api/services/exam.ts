import { httpClient } from '../client';

export const examService = {
  getList: (params?: {
    page?: number;
    page_size?: number;
    student_id?: string;
    class_id?: string;
    subject?: string;
  }) => {
    return httpClient.get<{ items: any[]; total: number }>('/exam/records', { params });
  },
  getDetail: (id: string) => {
    return httpClient.get(`/exam/records/${id}`);
  },
  create: (data: {
    student_id: string;
    class_id?: string;
    subject: string;
    title: string;
    score: number;
    total_score?: number;
    exam_date?: string;
  }) => {
    return httpClient.post('/exam/records', data);
  },
  getStudent: (studentId: string) => {
    return httpClient.get<{ items: any[] }>(`/exam/student/${studentId}`);
  },
};
