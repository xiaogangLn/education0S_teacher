// packages/shared/src/api/services/review.ts
import { httpClient } from '../client';

export interface ReviewItem {
  id: string;
  title: string;
  type: 'lesson_plan' | 'courseware' | 'exam';
  submitter: string;
  submitter_id: string;
  class_name: string;
  subject: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  preview_content: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  pass_rate: number;
  avg_duration: number;
}

export const reviewService = {
  // GET /api/v1/review/pending - 获取待审核列表
  getPending: (params?: {
    page?: number;
    page_size?: number;
    type?: 'lesson_plan' | 'courseware' | 'exam';
    subject?: string;
    grade_id?: string;
  }) => {
    return httpClient.get<{ items: ReviewItem[]; total: number; page: number; page_size: number }>(
      '/review/pending',
      { params }
    );
  },

  // GET /api/v1/review/list - 获取审核记录列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    status?: 'pending' | 'approved' | 'rejected';
    type?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    return httpClient.get<{ items: ReviewItem[]; total: number }>('/review/list', { params });
  },

  // GET /api/v1/review/{id} - 获取审核详情
  getDetail: (id: string) => {
    return httpClient.get<{
      review: {
        id: string;
        title: string;
        type: string;
        content: string;
        submitter: { id: string; name: string };
        approver: { id: string; name: string } | null;
        status: string;
        submitted_at: string;
        reviewed_at: string;
        comments: ReviewComment[];
        version_history: Array<{
          version: number;
          content: string;
          saved_at: string;
        }>;
      };
    }>(`/review/${id}`);
  },

  // POST /api/v1/review/{id}/approve - 审批通过
  approve: (id: string, comment?: string) => {
    return httpClient.post<{ id: string; status: 'approved'; reviewed_at: string }>(
      `/review/${id}/approve`,
      { comment }
    );
  },

  // POST /api/v1/review/{id}/reject - 审批驳回
  reject: (id: string, reason: string, comment?: string) => {
    return httpClient.post<{ id: string; status: 'rejected'; reviewed_at: string }>(
      `/review/${id}/reject`,
      { reason, comment }
    );
  },

  // POST /api/v1/review/{id}/comment - 添加批注
  addComment: (id: string, content: string) => {
    return httpClient.post<{ comment: ReviewComment }>(`/review/${id}/comment`, { content });
  },

  // GET /api/v1/review/{id}/comments - 获取批注列表
  getComments: (id: string) => {
    return httpClient.get<{ items: ReviewComment[] }>(`/review/${id}/comments`);
  },

  // GET /api/v1/review/stats - 获取审核统计
  getStats: () => {
    return httpClient.get<{ stats: ReviewStats }>('/review/stats');
  },

  // POST /api/v1/review/batch - 批量审批
  batch: (data: {
    ids: string[];
    action: 'approve' | 'reject';
    comment?: string;
    reason?: string;
  }) => {
    return httpClient.post<{
      success: number;
      failed: number;
      errors: Array<{ id: string; reason: string }>;
    }>('/review/batch', data);
  },
};