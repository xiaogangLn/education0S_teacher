// hooks/useDocumentList.ts
import { useState, useCallback } from 'react';
import type { Document } from '../types';

export const useDocumentList = (documents: Document[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(documents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentDocuments = documents.slice(startIndex, startIndex + pageSize);

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

  return {
    currentPage,
    totalPages,
    pageSize,
    currentDocuments,
    goToPage,
    nextPage,
    prevPage,
    totalCount: documents.length,
  };
};