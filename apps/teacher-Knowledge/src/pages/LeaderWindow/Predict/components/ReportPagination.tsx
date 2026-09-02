// components/ReportPagination.tsx
import React from 'react';
import { Button, Select } from 'antd';

interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  startIndex,
  endIndex,
  onPrev,
  onNext,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 16, 24, 48],
}) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push(-1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  if (totalCount === 0) {
    return (
      <div className="flex justify-center py-4 text-gray-400 text-sm">
        暂无数据
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 gap-3">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          共 {totalCount} 条记录 · 显示 {startIndex}-{endIndex}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>每页</span>
            <Select
              value={pageSize}
              onChange={onPageSizeChange}
              options={pageSizeOptions.map(size => ({ label: size, value: size }))}
              size="small"
              className="w-[70px]"
            />
            <span>条</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="small"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-lg"
        >
          ‹
        </Button>
        {getPageNumbers().map((page, index) => (
          <Button
            key={index}
            size="small"
            type={page === currentPage ? 'primary' : 'default'}
            onClick={() => page !== -1 && onPageChange(page)}
            disabled={page === -1}
            className={`rounded-lg ${page === -1 ? 'border-none cursor-default' : ''}`}
          >
            {page === -1 ? '…' : page}
          </Button>
        ))}
        <Button
          size="small"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg"
        >
          ›
        </Button>
      </div>
    </div>
  );
};