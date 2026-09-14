import { useCallback, useEffect, useMemo, useState } from 'react';
import { message, Modal } from 'antd';
import type { FilterState, ReviewItem } from '../types';
import { reviewService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';

const PAGE_SIZE = 10;

function mapStatus(status?: string): ReviewItem['status'] {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'reviewing') return 'reviewing';
  return 'pending';
}

function mapReview(item: any): ReviewItem {
  return {
    id: item.id,
    title: item.title || item.topic,
    author: item.submitter || item.creator?.name || '',
    grade: '',
    className: item.class_name || '',
    subject: item.subject || '',
    课时: 1,
    status: mapStatus(item.status),
    submittedAt: item.submitted_at ? new Date(item.submitted_at).toLocaleString('zh-CN') : '',
    description: item.preview_content || item.current_stage || '',
    rejectReason: item.reject_reason || '',
    aiGenerated: true,
  };
}

export const useReviewList = () => {
  const org = useOrgContext();
  const [filter, setFilter] = useState<FilterState>({
    keyword: '',
    subject: '全部学科',
    class: '全部班级',
    sortBy: '提交时间',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const sortParam =
    filter.sortBy === '学科'
      ? 'subject'
      : filter.sortBy === '最早提交'
        ? 'oldest'
        : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = extractPayload<{ items: any[]; total: number }>(
        await reviewService.getList({
          page: currentPage,
          page_size: PAGE_SIZE,
          status: 'pending',
          keyword: filter.keyword.trim() || undefined,
          subject: filter.subject !== '全部学科' ? filter.subject : undefined,
          sort: sortParam,
        } as any),
      );
      let next = (payload?.items || []).map(mapReview);
      if (filter.class !== '全部班级') {
        next = next.filter((item) => item.className === filter.class);
      }
      setItems(next);
      setTotalCount(filter.class !== '全部班级' ? next.length : (payload?.total ?? next.length));
      setSelectedIds((prev) => prev.filter((id) => next.some((item) => item.id === id)));
    } catch {
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter.keyword, filter.subject, filter.class, sortParam, org.className]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id)));
  }, []);

  const batchApprove = useCallback(async () => {
    const ids = selectedIds.length ? selectedIds : items.filter((item) => item.status === 'pending' || item.status === 'reviewing').map((item) => item.id);
    if (!ids.length) {
      message.warning('没有可批量通过的任务');
      return;
    }
    Modal.confirm({
      title: `确认批量通过 ${ids.length} 条？`,
      onOk: async () => {
        setBatchLoading(true);
        try {
          await reviewService.batch({ ids, action: 'approve', comment: '批量通过' } as any);
          message.success('批量通过完成');
          setSelectedIds([]);
          await load();
        } catch (error: any) {
          message.error(error?.message || '批量通过失败');
        } finally {
          setBatchLoading(false);
        }
      },
    });
  }, [selectedIds, items, load]);

  return {
    reviews: items,
    totalCount,
    currentPage,
    totalPages,
    filter,
    loading,
    selectedIds,
    batchLoading,
    toggleSelect,
    batchApprove,
    updateFilter: (next: Partial<FilterState>) => {
      setFilter((prev) => ({ ...prev, ...next }));
      setCurrentPage(1);
    },
    resetFilter: () => {
      setFilter({ keyword: '', subject: '全部学科', class: '全部班级', sortBy: '提交时间' });
      setCurrentPage(1);
    },
    goToPage: setCurrentPage,
    refresh: load,
  };
};
