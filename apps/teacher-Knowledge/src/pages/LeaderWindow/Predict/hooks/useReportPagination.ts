// hooks/useReportPagination.ts
import { useState, useMemo, useCallback } from 'react';
import type { ReportRecord } from '../types';

export const useReportPagination = (data: ReportRecord[], pageSize: number = 8) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const startIndex = useMemo(() => {
    if (data.length === 0) return 0;
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(currentPage * pageSize, data.length);
  }, [currentPage, pageSize, data.length]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    startIndex,
    endIndex,
    totalCount: data.length,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
  };
};