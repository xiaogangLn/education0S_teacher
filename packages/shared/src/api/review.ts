// packages/shared/src/api/review.ts
// ============================================================
// 审核 API
// ============================================================

import { httpClient } from './client';
import {
  ReviewItem,
  ReviewDetail,
  ReviewStats,
  ReviewQueryParams,
  ReviewActionRequest,
  SubmitReviewRequest,
  ApiResponse,
  PaginatedResponse,
  ReviewComment,
  ReviewTimeline,
} from '../types';

const BASE_URL = '/review';

export const reviewApi = {
  // 获取审核列表
  getList: (params: ReviewQueryParams): Promise<ApiResponse<PaginatedResponse<ReviewItem>>> => {
    return httpClient.get(BASE_URL, { params });
  },

  // 获取审核详情
  getDetail: (id: string): Promise<ApiResponse<ReviewDetail>> => {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // 审核操作（通过/驳回）
  action: (data: ReviewActionRequest): Promise<ApiResponse<ReviewItem>> => {
    return httpClient.post(`${BASE_URL}/action`, data);
  },

  // 提交审核
  submit: (data: SubmitReviewRequest): Promise<ApiResponse<ReviewItem>> => {
    return httpClient.post(`${BASE_URL}/submit`, data);
  },

  // 获取审核统计
  getStats: (params?: { grade?: string; subject?: string }): Promise<ApiResponse<ReviewStats>> => {
    return httpClient.get(`${BASE_URL}/stats`, { params });
  },

  // 添加批注
  addComment: (reviewId: string, content: string): Promise<ApiResponse<ReviewComment>> => {
    return httpClient.post(`${BASE_URL}/${reviewId}/comments`, { content });
  },

  // 获取批注列表
  getComments: (reviewId: string): Promise<ApiResponse<ReviewComment[]>> => {
    return httpClient.get(`${BASE_URL}/${reviewId}/comments`);
  },

  // 获取审核时间线
  getTimeline: (reviewId: string): Promise<ApiResponse<ReviewTimeline[]>> => {
    return httpClient.get(`${BASE_URL}/${reviewId}/timeline`);
  },

  // 批量审核
  batchAction: (ids: string[], action: 'approve' | 'reject', comment?: string): Promise<ApiResponse<{ success: string[]; failed: string[] }>> => {
    return httpClient.post(`${BASE_URL}/batch`, { ids, action, comment });
  },

  // 重新提交
  resubmit: (id: string): Promise<ApiResponse<ReviewItem>> => {
    return httpClient.post(`${BASE_URL}/${id}/resubmit`);
  },

  // 生成审核意见
  generateOpinion: (id: string): Promise<ApiResponse<{ opinion: string }>> => {
    return httpClient.post(`${BASE_URL}/${id}/generate-opinion`);
  },
};