// hooks/useReviewList.ts
import { useState, useMemo, useCallback } from 'react';
import type { ReviewItem, FilterState } from '../types';
import { mockReviews, PAGE_SIZE } from '../constants';

export const useReviewList = () => {
  const [filter, setFilter] = useState<FilterState>({
    keyword: '',
    subject: '全部学科',
    class: '全部班级',
    sortBy: '提交时间',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选数据
  const filteredReviews = useMemo(() => {
    let result = mockReviews;

    if (filter.keyword.trim()) {
      const keyword = filter.keyword.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.author.includes(keyword)
      );
    }

    if (filter.subject !== '全部学科') {
      result = result.filter((item) => item.subject === filter.subject);
    }

    if (filter.class !== '全部班级') {
      result = result.filter((item) => item.className === filter.class);
    }

    // 排序
    if (filter.sortBy === '提交时间') {
      result = result.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    } else if (filter.sortBy === '学科') {
      result = result.sort((a, b) => a.subject.localeCompare(b.subject));
    } else if (filter.sortBy === '状态') {
      const statusOrder = { pending: 0, reviewing: 1, modified: 2, approved: 3, rejected: 4 };
      result = result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    return result;
  }, [filter]);

  // 分页数据
  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, currentPage]);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      keyword: '',
      subject: '全部学科',
      class: '全部班级',
      sortBy: '提交时间',
    });
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const getStatusCount = useCallback((status: ReviewItem['status'] | 'all') => {
    if (status === 'all') return filteredReviews.length;
    return filteredReviews.filter((item) => item.status === status).length;
  }, [filteredReviews]);

  const getStatusStats = useCallback(() => {
    return {
      pending: filteredReviews.filter((item) => item.status === 'pending').length,
      reviewing: filteredReviews.filter((item) => item.status === 'reviewing').length,
      approved: filteredReviews.filter((item) => item.status === 'approved').length,
      rejected: filteredReviews.filter((item) => item.status === 'rejected').length,
      total: filteredReviews.length,
    };
  }, [filteredReviews]);

  return {
    reviews: paginatedReviews,
    allReviews: filteredReviews,
    filter,
    currentPage,
    totalPages,
    totalCount: filteredReviews.length,
    updateFilter,
    resetFilter,
    goToPage,
    getStatusCount,
    getStatusStats,
  };
};