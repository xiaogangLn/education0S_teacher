// packages/shared/src/api/services/users.ts
import { httpClient } from '../client';

export interface UserItem {
  id: string;
  username: string;
  real_name: string;
  phone: string;
  email: string;
  role: string;
  school_id: string;
  school_name?: string;
  grade_id: string;
  class_id: string;
  class_ids?: string[];
  avatar_url: string;
  is_active: boolean;
  subjects?: string[];
  last_login_at: string;
  created_at: string;
}

export const usersService = {
  // GET /api/v1/users - 获取用户列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    role?: string;
    school_id?: string;
    tenant_type?: 'education' | 'commercial';
    status?: 'active' | 'inactive';
  }) => {
    return httpClient.get<{ items: UserItem[]; total: number; page: number; page_size: number }>(
      '/users',
      { params }
    );
  },

  // GET /api/v1/users/{id} - 获取用户详情
  getDetail: (id: string) => {
    return httpClient.get<{ user: UserItem }>(`/users/${id}`);
  },

  // POST /api/v1/users - 创建用户
  create: (data: {
    username: string;
    phone: string;
    email?: string;
    real_name: string;
    password: string;
    role: string;
    is_grade_admin?: boolean;
    school_id?: string;
    grade_id?: string;
    class_id?: string;
    class_ids?: string[];
    subjects?: string[];
  }) => {
    return httpClient.post('/users', data);
  },

  // PUT /api/v1/users/{id} - 更新用户
  update: (id: string, data: Partial<UserItem> & {
    subjects?: string[];
    password?: string;
    real_name?: string;
    class_ids?: string[];
    is_grade_admin?: boolean;
  }) => {
    return httpClient.put(`/users/${id}`, data);
  },

  // DELETE /api/v1/users/{id} - 删除用户
  delete: (id: string) => {
    return httpClient.delete(`/users/${id}`);
  },

  // POST /api/v1/users/{id}/deactivate - 停用用户
  deactivate: (id: string) => {
    return httpClient.post(`/users/${id}/deactivate`);
  },

  // POST /api/v1/users/{id}/activate - 启用用户
  activate: (id: string) => {
    return httpClient.post(`/users/${id}/activate`);
  },

  // POST /api/v1/users/{id}/reset-password - 重置密码
  resetPassword: (id: string, password = '123456') => {
    return httpClient.post(`/users/${id}/reset-password`, { password, new_password: password });
  },

  // POST /api/v1/users/import - 批量导入
  import: (formData: FormData) => {
    return httpClient.post<{
      task_id: string;
      total: number;
      success: number;
      failed: number;
      errors: Array<{ row: number; field: string; reason: string }>;
      error_file_url?: string;
    }>('/users/import', formData);
  },

  // GET /api/v1/users/import/template - 下载导入模板
  downloadTemplate: () => {
    return httpClient.get('/users/import/template', { responseType: 'blob' });
  },

  // GET /api/v1/export/users - 导出用户
  export: (params?: { format?: 'excel' | 'csv'; school_id?: string; role?: string }) => {
    return httpClient.get('/export/users', { params, responseType: 'blob' });
  },
};