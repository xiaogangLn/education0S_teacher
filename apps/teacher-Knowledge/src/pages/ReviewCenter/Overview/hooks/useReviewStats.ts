// hooks/useReviewStats.ts
import { useState, useEffect, useCallback } from 'react';
import type { ReviewStats } from '../types';
import { mockStats } from '../constants';

export const useReviewStats = () => {
  const [stats, setStats] = useState<ReviewStats>(mockStats);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStats(mockStats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};