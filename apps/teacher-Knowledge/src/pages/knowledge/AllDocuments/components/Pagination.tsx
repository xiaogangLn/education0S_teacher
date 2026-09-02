// components/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push(-1); // ellipsis
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(total - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        显示 {start}-{end} / 共 {totalCount} 项
      </span>
      <div className="flex items-center gap-1">
        <button
          className={`px-3 py-1 rounded-lg border border-gray-200 text-sm ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`px-3 py-1 rounded-lg border text-sm ${
              page === currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : page === -1
                ? 'border-transparent cursor-default'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => page !== -1 && onPageChange(page)}
            disabled={page === -1}
          >
            {page === -1 ? '…' : page}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded-lg border border-gray-200 text-sm ${
            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
};