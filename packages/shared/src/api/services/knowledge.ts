// packages/shared/src/api/services/knowledge.ts
import { httpClient } from '../client';

export interface DocumentItem {
  id: string;
  title: string;
  type: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'link' | 'image';
  permission: 'school' | 'grade' | 'class' | 'personal';
  category: string;
  file_size: number;
  file_url: string;
  creator_name: string;
  creator_id: string;
  created_at: string;
  view_count: number;
  download_count: number;
  is_favorited: boolean;
  status: 'active' | 'archived';
}

export const knowledgeService = {
  // GET /api/v1/knowledge/home - 知识库首页
  getHome: (params?: { grade_id?: string; class_id?: string }) => {
    return httpClient.get<{
      stats: {
        total: number;
        myCreated: number;
        favorites: number;
        pending: number;
        storage_used: number;
        storage_limit: number;
      };
      documents: DocumentItem[];
      categories: Array<{ id: string; name: string; count: number }>;
      todos: Array<{ id: string; title: string; type: 'approve' | 'confirm' | 'import'; priority: string; href?: string }>;
    }>('/knowledge/home', { params });
  },

  // GET /api/v1/knowledge/documents - 获取文档列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    type?: string;
    permission?: string;
    category?: string;
    folder_id?: string;
    grade_id?: string;
    subject?: string;
    exclude_type?: string;
    generation_task_id?: string;
    sort_by?: 'created_at' | 'title' | 'view_count';
    sort_order?: 'asc' | 'desc';
  }) => {
    return httpClient.get<{ items: DocumentItem[]; total: number; page: number; page_size: number }>(
      '/knowledge/documents',
      { params }
    );
  },

  // GET /api/v1/knowledge/documents/{id} - 获取文档详情
  getDetail: (id: string) => {
    return httpClient.get<{
      document: DocumentItem & {
        content: string;
        tags: string[];
        folder_id: string;
        comments: Array<{
          id: string;
          user_name: string;
          content: string;
          created_at: string;
        }>;
      };
    }>(`/knowledge/documents/${id}`);
  },

  // POST /api/v1/knowledge/documents - 创建文档
  create: (data: FormData | Record<string, unknown>) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
    return httpClient.post<{
      id: string;
      title: string;
      file_url: string;
      file_size: number;
      permission: string;
      created_at: string;
    }>('/knowledge/documents', data, isForm ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : undefined);
  },

  // PUT /api/v1/knowledge/documents/{id} - 更新文档
  update: (id: string, data: Partial<DocumentItem>) => {
    return httpClient.put(`/knowledge/documents/${id}`, data);
  },

  // DELETE /api/v1/knowledge/documents/{id} - 删除文档
  delete: (id: string) => {
    return httpClient.delete(`/knowledge/documents/${id}`);
  },

  // GET /api/v1/knowledge/folders - 获取文件夹列表
  getFolders: (params?: { parent_id?: string; permission?: string }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        parent_id: string;
        name: string;
        permission: string;
        sort_order: number;
        created_at: string;
      }>;
    }>('/knowledge/folders', { params });
  },

  // POST /api/v1/knowledge/folders - 创建文件夹
  createFolder: (data: { parent_id?: string; name: string; permission: string }) => {
    return httpClient.post('/knowledge/folders', data);
  },

  // GET /api/v1/knowledge/permissions - 获取权限层级
  getPermissions: () => {
    return httpClient.get<{
      items: Array<{
        key: 'school' | 'grade' | 'class' | 'personal';
        label: string;
        icon: string;
        desc: string;
        count: number;
      }>;
    }>('/knowledge/permissions');
  },

  // PUT /api/v1/knowledge/documents/{id}/permission - 更新权限
  updatePermission: (id: string, permission: string) => {
    return httpClient.put(`/knowledge/documents/${id}/permission`, { permission });
  },

  // GET /api/v1/knowledge/categories - 获取分类列表
  getCategories: () => {
    return httpClient.get<{
      items: Array<{ id: string; name: string; count: number }>;
    }>('/knowledge/categories');
  },

  // POST /api/v1/knowledge/categories - 创建分类
  createCategory: (data: { name: string }) => {
    return httpClient.post('/knowledge/categories', data);
  },

  // GET /api/v1/knowledge/search - 搜索文档
  search: (keyword: string, params?: {
    page?: number;
    page_size?: number;
    type?: string;
    subject?: string;
    grade_id?: string;
  }) => {
    return httpClient.get<{ items: DocumentItem[]; total: number }>('/knowledge/search', {
      params: { keyword, ...params },
    });
  },

  // GET /api/v1/knowledge/catalog - 按学科/年级查询教材目录
  getCatalog: (params?: { subject?: string; grade?: string }) => {
    return httpClient.get<{
      textbook?: unknown;
      catalog?: { id: string; title: string; subject?: string };
      chapters?: Array<{ id: string; title: string; content?: string; gradeId?: string }>;
    }>('/knowledge/catalog', { params });
  },

  // GET /api/v1/knowledge/templates - 按学校/学科解析加工台模板
  getTemplates: (params?: { subject?: string; grade_id?: string; school_id?: string }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        title: string;
        kind: string;
        scope: 'personal' | 'school' | 'system';
        source_label: string;
        subject: string;
        grade_id: string;
        builtin_type: string;
        has_steps: boolean;
      }>;
      school_templates: Array<{
        id: string;
        title: string;
        kind: string;
        scope: 'school';
        source_label: string;
        subject: string;
        builtin_type: string;
      }>;
    }>('/knowledge/templates', { params });
  },

  // POST /api/v1/knowledge/documents/{id}/favorite - 收藏/取消收藏
  toggleFavorite: (id: string) => {
    return httpClient.post<{ favorited: boolean }>(`/knowledge/documents/${id}/favorite`);
  },

  // GET /api/v1/knowledge/favorites - 获取收藏列表
  getFavorites: (params?: { page?: number; page_size?: number }) => {
    return httpClient.get<{ items: DocumentItem[]; total: number }>('/knowledge/favorites', { params });
  },

  // GET /api/v1/knowledge/recent - 获取最近访问
  getRecent: () => {
    return httpClient.get<{ items: DocumentItem[] }>('/knowledge/recent');
  },

  // POST /api/v1/knowledge/grading/photo - 拍照批改
  gradingPhoto: (data: {
    student_id?: string;
    subject?: string;
    assignment_title?: string;
    learning_record_id?: string;
    image_urls?: string[];
    ocr_result?: string;
  }) => {
    return httpClient.post<{
      record_id: string;
      ocr_result: string;
      handwriting_analysis: {
        neatness: number;
        stroke: number;
        consistency: number;
        layout: number;
      };
      ai_score: number;
      ai_feedback: string;
      status: 'pending_confirm';
    }>('/knowledge/grading/photo', data, { timeout: 180000 });
  },

  // GET /api/v1/knowledge/grading/{id} - 获取批改详情
  getGradingDetail: (id: string) => {
    return httpClient.get<{
      record: {
        id: string;
        student_name: string;
        subject: string;
        assignment_title: string;
        ocr_result: string;
        handwriting_analysis: any;
        ai_score: number;
        teacher_score: number;
        status: string;
        created_at: string;
        images: string[];
        annotated_images?: string[];
      };
    }>(`/knowledge/grading/${id}`);
  },

  // GET /api/v1/knowledge/grading/list - 获取批改列表
  getGradingList: (params?: {
    page?: number;
    page_size?: number;
    student_id?: string;
    status?: 'pending_confirm' | 'confirmed' | 'modified';
  }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        student_name: string;
        subject: string;
        assignment_title: string;
        ai_score: number;
        status: string;
        created_at: string;
      }>;
      total: number;
    }>('/knowledge/grading/list', { params });
  },

  // POST /api/v1/knowledge/grading/tickets - 生成扫码上传票
  createGradingTicket: (data: {
    purpose?: 'grade' | 'homework';
    student_id?: string;
    class_id?: string;
    subject?: string;
    assignment_title?: string;
    learning_record_id?: string;
  }) => {
    return httpClient.post<{
      token: string;
      purpose: 'grade' | 'homework';
      status: string;
      subject: string;
      assignment_title: string;
      student_name: string;
      expires_at: string;
      expire_in: number;
      images?: string[];
      max_images?: number;
    }>('/knowledge/grading/tickets', data);
  },

  // GET /api/v1/knowledge/grading/tickets/{token} - 读取上传票
  getGradingTicket: (token: string) => {
    return httpClient.get<{
      purpose: 'grade' | 'homework';
      status: string;
      subject: string;
      assignment_title: string;
      student_name: string;
      expires_at: string;
      expire_in: number;
      record_id?: string;
      message?: string;
      images?: string[];
      max_images?: number;
    }>(`/knowledge/grading/tickets/${token}`);
  },

  // POST /api/v1/knowledge/grading/tickets/{token}/submit - 凭票提交拍照批改
  submitGradingTicket: (token: string, data: { image_urls: string[] }) => {
    return httpClient.post<{
      purpose: 'grade' | 'homework';
      status: string;
      record_id?: string;
      subject_mismatch?: boolean;
      ai_feedback?: string;
      message?: string;
      images?: string[];
    }>(`/knowledge/grading/tickets/${token}/submit`, data, { timeout: 180000 });
  },

  // PUT /api/v1/knowledge/grading/{id}/confirm - 确认批改（可携带原图批注的 OSS 地址存档）
  confirmGrading: (id: string, confirmed: boolean, feedback?: string, annotatedImageUrls?: string[]) => {
    return httpClient.put(`/knowledge/grading/${id}/confirm`, {
      confirmed,
      feedback,
      ...(annotatedImageUrls?.length ? { annotated_image_urls: annotatedImageUrls } : {}),
    });
  },

  // POST /api/v1/files/upload - 统一文件上传（OSS/local），dir 指定目录前缀
  uploadFile: (file: File | Blob, options?: { dir?: string; filename?: string }) => {
    const formData = new FormData();
    formData.append('file', file, options?.filename || (file instanceof File ? file.name : 'upload.bin'));
    if (options?.dir) formData.append('dir', options.dir);
    return httpClient.post<{ url: string; filename: string; driver: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // PUT /api/v1/knowledge/grading/{id}/update - 修改批改
  updateGrading: (id: string, data: { ai_score?: number; teacher_score?: number; feedback?: string }) => {
    return httpClient.put(`/knowledge/grading/${id}/update`, data);
  },
};