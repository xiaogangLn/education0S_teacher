import { useCallback, useEffect, useState } from 'react';
import type { ReviewStats } from '../types';
import { reviewService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

export const useReviewStats = () => {
  const [stats, setStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    reviewing: 0,
    passRate: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const payload = extractPayload<{ stats: any }>(await reviewService.getStats());
      const data = payload?.stats || payload || {};
      setStats({
        pending: data.pending || 0,
        approved: data.approved || 0,
        rejected: data.rejected || 0,
        reviewing: data.pending || 0,
        passRate: Math.round((data.pass_rate || 0) * 100),
        avgDuration: data.avg_duration || 0,
      });
    } catch {
      setStats({ pending: 0, approved: 0, rejected: 0, reviewing: 0, passRate: 0, avgDuration: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};
