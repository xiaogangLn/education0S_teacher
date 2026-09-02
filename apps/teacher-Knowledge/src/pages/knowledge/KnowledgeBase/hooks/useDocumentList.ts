// hooks/useDocumentList.ts
import { useState, useMemo, useCallback } from 'react';
import type { Document } from '../types';

export const useDocumentList = (documents: Document[]) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    let result = documents;
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(keyword) ||
        doc.author.includes(keyword)
      );
    }
    if (selectedCategory) {
      result = result.filter(doc => doc.category === selectedCategory);
    }
    return result;
  }, [documents, searchKeyword, selectedCategory]);

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const handleCategoryFilter = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleDocumentClick = useCallback((doc: Document) => {
    console.log('打开文档:', doc.title);
    // 实际导航逻辑
  }, []);

  const handleDocumentEdit = useCallback((doc: Document) => {
    console.log('编辑文档:', doc.title);
    // 实际编辑逻辑
  }, []);

  return {
    documents: filteredDocuments,
    searchKeyword,
    selectedCategory,
    handleSearch,
    handleCategoryFilter,
    handleDocumentClick,
    handleDocumentEdit,
  };
};