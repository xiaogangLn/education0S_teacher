// hooks/useDocumentFilter.ts
import { useState, useCallback, useMemo } from 'react';
import type { Document, FilterState, PermissionType } from '../types';

export const useDocumentFilter = (documents: Document[]) => {
  const [filter, setFilter] = useState<FilterState>({
    keyword: '',
    permission: 'all',
    viewMode: 'list',
  });

  const filteredDocuments = useMemo(() => {
    let result = documents;

    // 关键词搜索
    if (filter.keyword.trim()) {
      const keyword = filter.keyword.toLowerCase();
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(keyword) ||
        doc.author.includes(keyword) ||
        doc.category.includes(keyword)
      );
    }

    // 权限筛选
    if (filter.permission !== 'all') {
      result = result.filter(doc => doc.permission === filter.permission);
    }

    return result;
  }, [documents, filter.keyword, filter.permission]);

  const updateKeyword = useCallback((keyword: string) => {
    setFilter(prev => ({ ...prev, keyword }));
  }, []);

  const updatePermission = useCallback((permission: PermissionType | 'all') => {
    setFilter(prev => ({ ...prev, permission }));
  }, []);

  const toggleViewMode = useCallback(() => {
    setFilter(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'list' ? 'grid' : 'list',
    }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      keyword: '',
      permission: 'all',
      viewMode: 'list',
    });
  }, []);

  const getPermissionCount = useCallback((permission: PermissionType | 'all') => {
    if (permission === 'all') return documents.length;
    return documents.filter(doc => doc.permission === permission).length;
  }, [documents]);

  return {
    filter,
    filteredDocuments,
    updateKeyword,
    updatePermission,
    toggleViewMode,
    resetFilter,
    getPermissionCount,
  };
};