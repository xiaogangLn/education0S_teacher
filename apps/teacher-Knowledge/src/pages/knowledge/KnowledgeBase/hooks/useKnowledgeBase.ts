// hooks/useKnowledgeBase.ts
import { useState, useEffect, useCallback } from 'react';
import type { Document, Category, Activity, Stats, Todo } from '../types';
import {
  mockDocuments,
  mockCategories,
  mockActivities,
  mockStats,
  mockTodos,
} from '../constants';

interface KnowledgeBaseData {
  documents: Document[];
  categories: Category[];
  activities: Activity[];
  stats: Stats;
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const useKnowledgeBase = () => {
  const [data, setData] = useState<KnowledgeBaseData>({
    documents: [],
    categories: [],
    activities: [],
    stats: mockStats,
    todos: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 400));
      setData({
        documents: mockDocuments,
        categories: mockCategories,
        activities: mockActivities,
        stats: mockStats,
        todos: mockTodos,
        loading: false,
        error: null,
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: '加载数据失败，请重试',
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    fetchData,
    refresh: fetchData,
  };
};