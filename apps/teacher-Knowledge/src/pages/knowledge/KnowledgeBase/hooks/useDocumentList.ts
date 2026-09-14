// hooks/useDocumentList.ts
import { useState, useMemo, useCallback } from 'react';
import type { Document } from '../types';
import { useNavigate } from 'react-router-dom';

export const useDocumentList = (documents: Document[]) => {
  const navigate = useNavigate();
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
    navigate(`/knowledge/DocumentEditor?id=${doc.id}`);
  }, [navigate]);

  const handleDocumentEdit = useCallback((doc: Document) => {
    navigate(`/knowledge/DocumentEditor?id=${doc.id}`);
  }, [navigate]);

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