// hooks/useReviewDetail.ts
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import type { ReviewDetail, Comment } from '../types';

// 模拟详情数据
const mockDetailData: ReviewDetail = {
  id: '1',
  title: '导数的几何意义教案',
  author: '张老师',
  grade: '高二',
  className: '高二(3)班',
  subject: '数学',
  课时: 3,
  status: 'pending',
  submittedAt: '2026-09-02 14:35',
  description: '包含学情分析、五阶段完整生成内容，已标注AI生成部分',
  aiGenerated: true,
  rejectReason: undefined,
  content: {
    objectives: [
      '理解导数的几何意义——切线斜率',
      '掌握切线方程的求法（点斜式）',
      '体会极限思想在导数中的应用',
    ],
    keyPoints: ['导数几何意义的理解', '极限思想的建立'],
    schedule: ['第1课时：概念引入', '第2课时：应用与练习'],
    notes: '🤖 AI生成内容已标注 · 教师想法已整合',
  },
  comments: [
    {
      id: 'c1',
      author: '王主任',
      content: '教学目标设计合理，建议增加分层练习',
      createdAt: '2026-09-02 09:30',
      type: 'approve',
    },
    {
      id: 'c2',
      author: '教研组长',
      content: '建议在练习环节增加2道变式题，强化图像平移的理解',
      createdAt: '2026-09-02 10:15',
      type: 'suggestion',
    },
  ],
  timeline: [
    {
      id: 't1',
      type: 'submit',
      author: '张老师',
      content: '提交教案审核',
      createdAt: '2026-09-02 09:00',
    },
    {
      id: 't2',
      type: 'approve',
      author: '王主任',
      content: '初审通过，建议增加分层练习',
      createdAt: '2026-09-02 09:30',
    },
    {
      id: 't3',
      type: 'suggestion',
      author: '教研组长',
      content: '提出修改建议：增加变式题',
      createdAt: '2026-09-02 10:15',
    },
  ],
};

// 不同ID对应的不同详情数据（模拟）
const mockDetailMap: Record<string, ReviewDetail> = {
  '1': mockDetailData,
  '2': {
    ...mockDetailData,
    id: '2',
    title: '二次函数单元教案',
    author: '李老师',
    className: '高二(1)班',
    status: 'reviewing',
    submittedAt: '2026-09-02 10:20',
    description: '已审阅，等待最终确认',
    aiGenerated: false,
    content: {
      objectives: [
        '理解二次函数的图像与性质',
        '掌握二次函数的顶点式和一般式转换',
        '能够应用二次函数解决实际问题',
      ],
      keyPoints: ['二次函数图像特征', '顶点坐标计算'],
      schedule: ['第1课时：图像与性质', '第2课时：应用与练习'],
      notes: '教学设计完整，建议增加实际应用案例',
    },
    comments: [
      {
        id: 'c3',
        author: '王主任',
        content: '教学设计完整，建议增加实际应用案例',
        createdAt: '2026-09-02 11:00',
        type: 'suggestion',
      },
    ],
    timeline: [
      {
        id: 't4',
        type: 'submit',
        author: '李老师',
        content: '提交教案审核',
        createdAt: '2026-09-02 10:20',
      },
      {
        id: 't5',
        type: 'suggestion',
        author: '王主任',
        content: '建议增加实际应用案例',
        createdAt: '2026-09-02 11:00',
      },
    ],
  },
  '3': {
    ...mockDetailData,
    id: '3',
    title: '英语阅读理解专项计划',
    author: '赵老师',
    className: '高二(3)班',
    subject: '英语',
    status: 'rejected',
    submittedAt: '2026-09-01 16:30',
    description: '教学目标不够具体，建议增加分层设计',
    aiGenerated: false,
    rejectReason: '教学目标不够具体，建议增加分层设计',
    content: {
      objectives: [
        '提高学生英语阅读理解能力',
        '掌握阅读技巧和策略',
      ],
      keyPoints: ['阅读技巧训练', '词汇积累'],
      schedule: ['第1课时：阅读技巧', '第2课时：实战训练'],
      notes: '需进一步完善教学目标',
    },
    comments: [
      {
        id: 'c4',
        author: '王主任',
        content: '教学目标不够具体，建议增加分层设计',
        createdAt: '2026-09-01 17:00',
        type: 'reject',
      },
    ],
    timeline: [
      {
        id: 't6',
        type: 'submit',
        author: '赵老师',
        content: '提交教案审核',
        createdAt: '2026-09-01 16:30',
      },
      {
        id: 't7',
        type: 'reject',
        author: '王主任',
        content: '驳回：教学目标不够具体，建议增加分层设计',
        createdAt: '2026-09-01 17:00',
      },
    ],
  },
};

export const useReviewDetail = (reviewId: string) => {
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 加载详情
  const loadDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // 模拟 API 请求
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 模拟数据查找
      const data = mockDetailMap[id];
      if (data) {
        setDetail(data);
      } else {
        // 如果找不到对应ID，返回默认数据
        setDetail({
          ...mockDetailData,
          id: id,
        });
      }
    } catch (err) {
      setError('加载详情失败，请重试');
      message.error('加载详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 提交评论
  const submitComment = useCallback(
    async (content: string) => {
      if (!detail) {
        message.warning('请先加载详情');
        return false;
      }

      if (!content.trim()) {
        message.warning('请输入批注内容');
        return false;
      }

      setSubmitting(true);
      try {
        // 模拟 API 请求
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newComment: Comment = {
          id: `c${Date.now()}`,
          author: '王主任', // 从当前用户获取
          content: content.trim(),
          createdAt: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: 'suggestion',
        };

        setDetail((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newComment],
                timeline: [
                  ...prev.timeline,
                  {
                    id: `t${Date.now()}`,
                    type: 'suggestion',
                    author: '王主任',
                    content: `添加批注：${content.trim()}`,
                    createdAt: new Date().toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ],
              }
            : null
        );

        message.success('批注提交成功');
        return true;
      } catch (err) {
        message.error('提交失败，请重试');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [detail]
  );

  // 审批通过
  const approveReview = useCallback(async () => {
    if (!detail) {
      message.warning('请先加载详情');
      return false;
    }

    if (detail.status === 'approved') {
      message.warning('该教案已通过审批');
      return false;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const now = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              status: 'approved',
              timeline: [
                ...prev.timeline,
                {
                  id: `t${Date.now()}`,
                  type: 'approve',
                  author: '王主任',
                  content: '审批通过',
                  createdAt: now,
                },
              ],
            }
          : null
      );

      message.success('审批通过');
      return true;
    } catch (err) {
      message.error('审批失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [detail]);

  // 驳回
  const rejectReview = useCallback(
    async (reason: string) => {
      if (!detail) {
        message.warning('请先加载详情');
        return false;
      }

      if (detail.status === 'rejected') {
        message.warning('该教案已被驳回');
        return false;
      }

      if (!reason || !reason.trim()) {
        message.warning('请输入驳回原因');
        return false;
      }

      setSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const now = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        setDetail((prev) =>
          prev
            ? {
                ...prev,
                status: 'rejected',
                rejectReason: reason.trim(),
                timeline: [
                  ...prev.timeline,
                  {
                    id: `t${Date.now()}`,
                    type: 'reject',
                    author: '王主任',
                    content: `驳回：${reason.trim()}`,
                    createdAt: now,
                  },
                ],
                comments: [
                  ...prev.comments,
                  {
                    id: `c${Date.now()}`,
                    author: '王主任',
                    content: `驳回原因：${reason.trim()}`,
                    createdAt: now,
                    type: 'reject',
                  },
                ],
              }
            : null
        );

        message.success('已驳回');
        return true;
      } catch (err) {
        message.error('驳回失败，请重试');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [detail]
  );

  // 重新提交（修改后重新提交审核）
  const resubmitReview = useCallback(async () => {
    if (!detail) {
      message.warning('请先加载详情');
      return false;
    }

    if (detail.status !== 'rejected') {
      message.warning('只有被驳回的教案才能重新提交');
      return false;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const now = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              status: 'pending',
              rejectReason: undefined,
              timeline: [
                ...prev.timeline,
                {
                  id: `t${Date.now()}`,
                  type: 'submit',
                  author: prev.author,
                  content: '已修改并重新提交审核',
                  createdAt: now,
                },
              ],
            }
          : null
      );

      message.success('已重新提交，等待审核');
      return true;
    } catch (err) {
      message.error('重新提交失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [detail]);

  // 更新教案内容
  const updateContent = useCallback(
    async (content: Partial<ReviewDetail['content']>) => {
      if (!detail) {
        message.warning('请先加载详情');
        return false;
      }

      setSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        setDetail((prev) =>
          prev
            ? {
                ...prev,
                content: {
                  ...prev.content,
                  ...content,
                },
              }
            : null
        );

        message.success('内容已更新');
        return true;
      } catch (err) {
        message.error('更新失败，请重试');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [detail]
  );

  // 获取状态信息
  const getStatusInfo = useCallback(() => {
    if (!detail) return null;

    const statusMap = {
      pending: { color: 'warning', label: '待审核', icon: '⏳' },
      reviewing: { color: 'processing', label: '审核中', icon: '🔄' },
      approved: { color: 'success', label: '已通过', icon: '✅' },
      rejected: { color: 'error', label: '已驳回', icon: '❌' },
      modified: { color: 'default', label: '已修改', icon: '📝' },
    };

    return statusMap[detail.status] || statusMap.pending;
  }, [detail]);

  // 检查是否可以审批
  const canApprove = useCallback(() => {
    if (!detail) return false;
    return detail.status === 'pending' || detail.status === 'reviewing';
  }, [detail]);

  // 检查是否可以驳回
  const canReject = useCallback(() => {
    if (!detail) return false;
    return detail.status === 'pending' || detail.status === 'reviewing';
  }, [detail]);

  // 检查是否可以重新提交
  const canResubmit = useCallback(() => {
    if (!detail) return false;
    return detail.status === 'rejected';
  }, [detail]);

  // 检查是否可以编辑
  const canEdit = useCallback(() => {
    if (!detail) return false;
    return detail.status === 'rejected' || detail.status === 'modified';
  }, [detail]);

  useEffect(() => {
    if (reviewId) {
      loadDetail(reviewId);
    }
  }, [reviewId, loadDetail]);

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
    updateContent,
    getStatusInfo,
    canApprove,
    canReject,
    canResubmit,
    canEdit,
    // 便捷属性
    isPending: detail?.status === 'pending' || detail?.status === 'reviewing',
    isApproved: detail?.status === 'approved',
    isRejected: detail?.status === 'rejected',
  };
};