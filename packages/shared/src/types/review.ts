// packages/shared/src/types/review.ts
// ============================================================
// 审核相关类型定义
// ============================================================

import { PaginationParams, FilterParams } from './common';

/** 审核项 */
export interface ReviewItem {
  id: string;
  title: string;
  author: string;
  authorId: string;
  grade: string;
  className: string;
  subject: string;
  lessonCount: number;
  status: ReviewStatus;
  submittedAt: string;
  description: string;
  rejectReason?: string;
  aiGenerated: boolean;
  content: ReviewContent;
}

/** 审核状态 */
export type ReviewStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'modified';

/** 审核内容 */
export interface ReviewContent {
  objectives: string[];
  keyPoints: string[];
  schedule: string[];
  notes?: string;
}

/** 审核评论 */
export interface ReviewComment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  type: 'approve' | 'suggestion' | 'reject' | 'system';
}

/** 审核时间线 */
export interface ReviewTimeline {
  id: string;
  type: 'submit' | 'approve' | 'suggestion' | 'reject' | 'modify';
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
}

/** 审核详情 */
export interface ReviewDetail extends ReviewItem {
  content: ReviewContent;
  comments: ReviewComment[];
  timeline: ReviewTimeline[];
}

/** 审核统计 */
export interface ReviewStats {
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  total: number;
  passRate: number;
  avgDuration: number; // 平均审核时长（天）
}

/** 审核查询参数 */
export interface ReviewQueryParams extends PaginationParams, FilterParams {
  status?: ReviewStatus;
  subject?: string;
  grade?: string;
  classId?: string;
  authorId?: string;
}

/** 审核操作请求 */
export interface ReviewActionRequest {
  reviewId: string;
  action: 'approve' | 'reject';
  comment?: string;
  reason?: string;
}

/** 提交审核请求 */
export interface SubmitReviewRequest {
  taskId: string;
  comment?: string;
}