// packages/shared/src/api/services/students.ts
import { httpClient } from '../client';

export interface StudentItem {
  id: string;
  user_id: string;
  student_no: string;
  name: string;
  gender: 'male' | 'female';
  school_id: string;
  school_name: string;
  grade_id: string;
  grade_name: string;
  class_id: string;
  class_name: string;
  enrollment_year: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn' | 'all';
  mastery_rate: number;
  rank: number;
  total_students: number;
  transfer_history?: TransferRecord[];
}

export interface StudentDetail extends StudentItem {
  strengths: string[];
  weaknesses: string[];
  transfer_history: TransferRecord[];
  abilities: Ability[];
  portraits: {
    academic: any;
    abilities: any;
    behaviors: any;
    psychology: any;
    growth: any;
  };
}

export interface TransferRecord {
  id: string;
  from_class: string;
  to_class: string;
  transfer_date: string;
  reason: string;
  operated_by: string;
}

export interface Ability {
  name: string;
  value: number;
  label: string;
}

export const studentsService = {
  // GET /api/v1/students - 获取学生列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    class_id?: string;
    grade_id?: string;
    school_id?: string;
    status?: 'active' | 'transferred' | 'graduated' | 'withdrawn' | 'all';
    enrollment_year?: string;
    sort_by?: 'name' | 'student_no' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }) => {
    return httpClient.get<{ items: StudentItem[]; total: number; page: number; page_size: number }>(
      '/students',
      { params }
    );
  },

  getEnrollmentYears: (params?: { school_id?: string }) => {
    return httpClient.get<{ items: Array<{ year: string; label: string; student_count: number }> }>(
      '/students/enrollment-years',
      { params },
    );
  },

  // GET /api/v1/students/{id} - 获取学生详情
  getDetail: (id: string) => {
    return httpClient.get<{ student: StudentDetail }>(`/students/${id}`);
  },

  // POST /api/v1/students - 创建学生
  create: (data: {
    user_id?: string;
    student_no: string;
    name?: string;
    gender?: 'male' | 'female';
    school_id?: string;
    grade_id?: string;
    class_id?: string;
    enrollment_year?: string;
    parent_name?: string;
    parent_phone?: string;
    parent_email?: string;
  }) => {
    return httpClient.post('/students', data);
  },

  // PUT /api/v1/students/{id} - 更新学生
  update: (id: string, data: Partial<StudentItem>) => {
    return httpClient.put(`/students/${id}`, data);
  },

  // DELETE /api/v1/students/{id} - 删除学生
  delete: (id: string) => {
    return httpClient.delete(`/students/${id}`);
  },

  // POST /api/v1/students/{id}/transfer - 换班
  transfer: (id: string, targetClassId: string, reason: string, transferDate?: string) => {
    return httpClient.post<{
      student_id: string;
      from_class: string;
      to_class: string;
      transfer_date: string;
      status: 'pending' | 'executed';
      record_id: string;
    }>(`/students/${id}/transfer`, {
      target_class_id: targetClassId,
      reason,
      transfer_date: transferDate,
    });
  },

  // GET /api/v1/students/{id}/transfers - 获取换班记录
  getTransfers: (id: string) => {
    return httpClient.get<{ items: TransferRecord[] }>(`/students/${id}/transfers`);
  },

  // GET /api/v1/students/class/{class_id} - 获取班级学生
  getClassStudents: (classId: string) => {
    return httpClient.get<{ items: StudentItem[]; total: number }>(`/students/class/${classId}`);
  },

  // POST /api/v1/students/import - 批量导入
  import: (formData: FormData) => {
    return httpClient.post<{
      task_id: string;
      total: number;
      success: number;
      failed: number;
      errors: Array<{ row: number; field: string; reason: string }>;
    }>('/students/import', formData);
  },

  // GET /api/v1/students/import/template - 下载导入模板
  downloadTemplate: () => {
    return httpClient.get('/students/import/template', { responseType: 'blob' });
  },

  // GET /api/v1/students/export - 导出学生
  export: (params?: { format?: 'excel' | 'csv'; class_id?: string; grade_id?: string }) => {
    return httpClient.get('/students/export', { params });
  },

  // GET /api/v1/students/{id}/portrait - 获取学生画像
  getPortrait: (id: string) => {
    return httpClient.get(`/students/${id}/portrait`);
  },

  // GET /api/v1/students/{id}/scores - 获取学生成绩
  getScores: (id: string) => {
    return httpClient.get(`/students/${id}/scores`);
  },
};