import { useState, useEffect, useCallback } from 'react';
import { knowledgeService } from '@api/index';
import type { Document, Category, Activity, Stats, Todo } from '../types';
import { extractPayload, mapKnowledgeDocument } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';

interface KnowledgeBaseData {
  documents: Document[];
  categories: Category[];
  activities: Activity[];
  stats: Stats;
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

const emptyStats: Stats = {
  total: 0,
  myCreated: 0,
  favorites: 0,
  pending: 0,
  storageUsed: 0,
  storageLimit: 10 * 1024 * 1024 * 1024,
};

export const useKnowledgeBase = () => {
  const org = useOrgContext();
  const [data, setData] = useState<KnowledgeBaseData>({
    documents: [],
    categories: [],
    activities: [],
    stats: emptyStats,
    todos: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const payload = extractPayload<{
        stats: any;
        documents: any[];
        categories: any[];
        todos: any[];
      }>(await knowledgeService.getHome({ grade_id: org.gradeId, class_id: org.classId }));

      const stats = payload?.stats || {};
      setData({
        documents: (payload?.documents || []).map(mapKnowledgeDocument),
        categories: (payload?.categories || []).map((item: any) => ({
          id: item.id || item.name,
          name: item.name,
          count: item.count || 0,
        })),
        activities: [],
        stats: {
          total: stats.total || 0,
          myCreated: stats.myCreated || 0,
          favorites: stats.favorites || 0,
          pending: stats.pending || 0,
          storageUsed: stats.storage_used || 0,
          storageLimit: stats.storage_limit || emptyStats.storageLimit,
        },
        todos: (payload?.todos || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type === 'confirm' ? 'confirm' : item.type === 'import' ? 'import' : 'approve',
          priority: item.priority === 'medium' || item.priority === 'low' ? item.priority : 'high',
          href: item.href,
        })),
        loading: false,
        error: null,
      });
    } catch (err) {
      setData({
        documents: [],
        categories: [],
        activities: [],
        stats: emptyStats,
        todos: [],
        loading: false,
        error: err instanceof Error ? err.message : '加载数据失败，请重试',
      });
    }
  }, [org.gradeId, org.classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    fetchData,
    refresh: fetchData,
  };
};
