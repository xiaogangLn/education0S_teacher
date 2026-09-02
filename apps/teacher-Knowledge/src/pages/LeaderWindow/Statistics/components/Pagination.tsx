// components/Pagination.tsx
import React from 'react';
import { Button, Space } from 'antd';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  startIndex,
  endIndex,
  onPrev,
  onNext,
  onPageChange,
  totalPages,
}) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        共 {total} 条记录 · 显示 {startIndex}-{endIndex}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="small"
          onClick={onPrev}
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
          onClick={onNext}
          disabled={current === totalPages}
          className="rounded-lg"
        >
          ›
        </Button>
      </div>
    </div>
  );
};