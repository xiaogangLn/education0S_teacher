import { useCallback, useState } from 'react';
import { message } from 'antd';
import type { ReviewDetail } from '../types';
import { processingService, reviewService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

function mapCommentType(type?: string): 'approve' | 'suggestion' | 'reject' | 'system' {
  if (type === 'approval' || type === 'approve') return 'approve';
  if (type === 'rejection' || type === 'reject') return 'reject';
  if (type === 'suggestion' || type === 'issue') return 'suggestion';
  return 'system';
}

function mapDetail(id: string, review: any): ReviewDetail {
  const status =
    review.status === 'approved'
      ? 'approved'
      : review.status === 'rejected'
        ? 'rejected'
        : review.status === 'reviewing'
          ? 'reviewing'
          : 'pending';
  const comments = (review.comments || []).map((item: any) => ({
    id: item.id,
    author: item.author || review.approver?.name || '',
    content: item.content,
    createdAt: item.created_at || item.createdAt,
    type: mapCommentType(item.type),
  }));
  const markdown =
    review.markdown ||
    review.content?.markdown ||
    (typeof review.content === 'string' ? review.content : '');
  return {
    id,
    title: review.title || review.topic,
    author: review.submitter?.name || review.submitter || review.creator?.name || '',
    grade: '',
    className: review.class_name || '',
    subject: review.subject || '',
    课时: 1,
    status,
    submittedAt: review.submitted_at ? new Date(review.submitted_at).toLocaleString('zh-CN') : '',
    description: review.preview_content || '',
    aiGenerated: true,
    markdown,
    rejectReason: review.reject_reason || comments.find((item: any) => item.type === 'reject')?.content,
    content: {
      objectives: review.content?.objectives || [],
      keyPoints: review.content?.keyPoints || [],
      schedule: review.content?.schedule || [],
      notes: review.content?.notes,
      markdown,
    },
    comments,
    timeline: comments.map((item: any, index: number) => ({
      id: `t${index}`,
      type: item.type === 'reject' ? 'reject' : item.type === 'approve' ? 'approve' : 'suggestion',
      author: item.author || '',
      content: item.content,
      createdAt: item.createdAt,
    })),
  };
}

export const useReviewDetail = () => {
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = extractPayload<{ review: any }>(await reviewService.getDetail(id));
      setDetail(mapDetail(id, payload?.review || payload));
    } catch {
      setError('加载详情失败，请重试');
      setDetail(null);
      message.error('加载详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitComment = useCallback(async (id: string, content: string) => {
    if (!id || !content.trim()) return false;
    setSubmitting(true);
    try {
      await reviewService.addComment(id, content.trim());
      message.success('批注提交成功');
      await loadDetail(id);
      return true;
    } catch {
      message.error('提交失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [loadDetail]);

  const approveReview = useCallback(async (id: string) => {
    if (!id) return false;
    setSubmitting(true);
    try {
      await reviewService.approve(id, '审批通过');
      message.success('已通过');
      return true;
    } catch {
      message.error('审批失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const rejectReview = useCallback(async (id: string, reason: string) => {
    if (!id || !reason.trim()) return false;
    setSubmitting(true);
    try {
      await reviewService.reject(id, reason.trim());
      message.success('已驳回');
      return true;
    } catch {
      message.error('驳回失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const resubmitReview = useCallback(async (id: string) => {
    if (!id) return false;
    setSubmitting(true);
    try {
      await processingService.submit(id);
      message.success('已重新提交，等待审核');
      return true;
    } catch {
      message.error('重新提交失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    detail,
    loading,
    error,
    submitting,
    loadDetail,
    submitComment,
    approveReview,
    rejectReview,
    resubmitReview,
  };
};
