// hooks/useCategoryFilter.ts
import { useState, useCallback } from 'react';
import type { Category } from '../types';

export const useCategoryFilter = (categories: Category[]) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  const getCategoryCount = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.count || 0;
  }, [categories]);

  return {
    activeCategory,
    categories,
    handleCategoryClick,
    getCategoryCount,
  };
};