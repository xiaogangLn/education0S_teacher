import React, { useState } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useReviewList } from './hooks/useReviewList';
import { useReviewStats } from './hooks/useReviewStats';
import { useReviewDetail } from './hooks/useReviewDetail';
import { ReviewStats } from './components/ReviewStats';
import { ReviewFilter } from './components/ReviewFilter';
import { ReviewItem } from './components/ReviewItem';
import { ReviewPagination } from './components/ReviewPagination';
import ReviewDetailModal from './components/ReviewDetailModal';
import { RejectReasonModal } from './components/RejectReasonModal';

export const ReviewCenterPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const { stats, loading: statsLoading, refresh: refreshStats } = useReviewStats();
  const {
    reviews,
    totalCount,
    currentPage,
    totalPages,
    filter,
    loading: listLoading,
    updateFilter,
    resetFilter,
    goToPage,
    refresh: refreshList,
    batchApprove,
    batchLoading,
  } = useReviewList();
  const navigate = useNavigate();
  const {
    detail,
    loading: detailLoading,
    submitting,
    loadDetail,
    approveReview,
    rejectReview,
    resubmitReview,
    submitComment,
  } = useReviewDetail();

  const refreshAll = async () => {
    await Promise.all([refreshList(), refreshStats()]);
  };

  const handleViewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailModalOpen(true);
    await loadDetail(id);
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    const ok = await approveReview(id);
    setActionId(null);
    if (!ok) return;
    if (selectedId === id) setDetailModalOpen(false);
    await refreshAll();
  };

  const handleOpenReject = (id: string) => {
    setRejectTargetId(id);
    setSelectedId(id);
    setRejectOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTargetId) return;
    setActionId(rejectTargetId);
    const ok = await rejectReview(rejectTargetId, reason);
    setActionId(null);
    if (!ok) return;
    setRejectOpen(false);
    if (selectedId === rejectTargetId) setDetailModalOpen(false);
    setRejectTargetId(null);
    await refreshAll();
  };

  const handleResubmit = async (id: string) => {
    setActionId(id);
    const ok = await resubmitReview(id);
    setActionId(null);
    if (ok) await refreshAll();
  };

  const handleSubmitComment = async (content: string) => {
    if (!selectedId) return false;
    return submitComment(selectedId, content);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 审核中心</h1>
          <p className="text-sm text-gray-500">
            审核教师提交的教学计划 · 批注 · 通过 / 驳回 · 进度追踪
          </p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workbench')}>
          返回
        </Button>
      </div>

      <ReviewStats stats={stats} loading={statsLoading} />

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="font-semibold text-base">⏳ 待审核列表</span>
          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm">
            {stats.pending} 项待处理
          </span>
        </div>

        <ReviewFilter
          filter={filter}
          onFilterChange={(key, value) => updateFilter({ [key]: value })}
          onReset={resetFilter}
          onBatch={batchApprove}
          loading={listLoading || statsLoading || batchLoading}
        />

        <div className="space-y-3">
          {listLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">暂无待审核项目</div>
            </div>
          ) : (
            reviews.map((item) => (
              <ReviewItem
                key={item.id}
                item={item}
                actionLoading={submitting && actionId === item.id}
                onApprove={handleApprove}
                onReject={handleOpenReject}
                onViewDetail={handleViewDetail}
                onResubmit={handleResubmit}
              />
            ))
          )}
        </div>

        <ReviewPagination
          current={currentPage}
          total={totalCount}
          pageSize={10}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

      <ReviewDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        detail={detail}
        loading={detailLoading}
        submitting={submitting}
        onApprove={handleApprove}
        onReject={handleOpenReject}
        onSubmitComment={handleSubmitComment}
      />

      <RejectReasonModal
        open={rejectOpen}
        loading={submitting}
        onCancel={() => setRejectOpen(false)}
        onConfirm={handleConfirmReject}
      />

      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        EducationOS V8.0 · 审核中心 · 教学计划审核
      </div>
    </div>
  );
};

export default ReviewCenterPage;
