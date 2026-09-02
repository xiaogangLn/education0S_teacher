// index.tsx - 主页面
import React, { useState } from 'react';
import { message } from 'antd';
import { useReviewList } from './hooks/useReviewList';
import { useReviewStats } from './hooks/useReviewStats';
import { ReviewStats } from './components/ReviewStats';
import { ReviewFilter } from './components/ReviewFilter';
import { ReviewItem } from './components/ReviewItem';
import { ReviewPagination } from './components/ReviewPagination';
import ReviewDetailModal from './components/ReviewDetailModal';
import { useReviewDetail } from './hooks/useReviewDetail';

export const ReviewCenterPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { stats, loading: statsLoading } = useReviewStats();
  const {
    reviews,
    totalCount,
    currentPage,
    totalPages,
    filter,
    updateFilter,
    resetFilter,
    goToPage,
  } = useReviewList();

  const { detail, loadDetail } = useReviewDetail(selectedId || '');

  const handleViewDetail = (id: string) => {
    setSelectedId(id);
    loadDetail(id);
    setDetailModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    message.success('已通过审批');
    setDetailModalOpen(false);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('请输入驳回原因：');
    if (reason) {
      message.success('已驳回');
      setDetailModalOpen(false);
    }
  };

  const handleResubmit = (id: string) => {
    message.success('已重新提交，等待审核');
  };

  return (
    <div className="">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📋 审核中心</h1>
        <p className="text-sm text-gray-500">
          审核教师提交的教学计划 · 批注 · 通过 / 驳回 · 进度追踪
        </p>
      </div>

      {/* 统计卡片 */}
      <ReviewStats stats={stats} loading={statsLoading} />

      {/* 待审核列表 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="font-semibold text-base">⏳ 待审核列表</span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {stats.pending} 项待处理
            </span>
            <span>📅 2026-09-02</span>
          </div>
        </div>

        {/* 筛选栏 */}
        <ReviewFilter
          filter={filter}
          onFilterChange={updateFilter}
          onReset={resetFilter}
          loading={statsLoading}
        />

        {/* 列表 */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">暂无审核项目</div>
            </div>
          ) : (
            reviews.map((item) => (
              <ReviewItem
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetail={handleViewDetail}
                onResubmit={handleResubmit}
              />
            ))
          )}
        </div>

        {/* 分页 */}
        <ReviewPagination
          current={currentPage}
          total={totalCount}
          pageSize={3}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

        <ReviewDetailModal
            open={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            detail={detail}
            onApprove={handleApprove}
            onReject={handleReject}
        />

      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        EducationOS V8.0 · 审核中心 · 教学计划审核 · 2026-09-02
      </div>
    </div>
  );
};

export default ReviewCenterPage;