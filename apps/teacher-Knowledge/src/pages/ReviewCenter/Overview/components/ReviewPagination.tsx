// components/ReviewPagination.tsx
import React from 'react';
import { Button } from 'antd';

interface ReviewPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ReviewPagination: React.FC<ReviewPaginationProps> = ({
  current,
  total,
  pageSize,
  totalPages,
  onPageChange,
}) => {
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const getPageNumbers = () => {
    const pages: number[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      const startPage = Math.max(2, current - 1);
      const endPage = Math.min(totalPages - 1, current + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (current < totalPages - 2) pages.push(-1);
      pages.push(totalPages);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        共 {total} 项 · 显示 {start}-{end}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="small"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="rounded-lg"
        >
          ‹
        </Button>
        {getPageNumbers().map((page, index) => (
          <Button
            key={index}
            size="small"
            type={page === current ? 'primary' : 'default'}
            onClick={() => page !== -1 && onPageChange(page)}
            disabled={page === -1}
            className={`rounded-lg ${page === -1 ? 'border-none cursor-default' : ''}`}
          >
            {page === -1 ? '…' : page}
          </Button>
        ))}
        <Button
          size="small"
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
          className="rounded-lg"
        >
          ›
        </Button>
      </div>
    </div>
  );
};