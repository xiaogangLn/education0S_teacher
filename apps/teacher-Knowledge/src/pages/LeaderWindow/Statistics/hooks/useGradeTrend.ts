// hooks/useGradeTrend.ts
import { useCallback, useMemo } from 'react';
import type { GradeTrend } from '../types';

export const useGradeTrend = (trends: GradeTrend[]) => {
  const totalAverage = useMemo(() => {
    if (trends.length === 0) return 0;
    const sum = trends.reduce((acc, t) => acc + t.masteryRate, 0);
    return Math.round((sum / trends.length) * 10) / 10;
  }, [trends]);

  const maxChange = useMemo(() => {
    if (trends.length === 0) return 0;
    return Math.max(...trends.map(t => t.change));
  }, [trends]);

  const getTrendColor = useCallback((trend: GradeTrend['trend']) => {
    const colors = {
      up: 'text-green-500',
      down: 'text-red-500',
      stable: 'text-yellow-500',
    };
    return colors[trend] || 'text-gray-500';
  }, []);

  const getTrendIcon = useCallback((trend: GradeTrend['trend']) => {
    const icons = {
      up: '↑',
      down: '↓',
      stable: '→',
    };
    return icons[trend] || '·';
  }, []);

  return {
    totalAverage,
    maxChange,
    getTrendColor,
    getTrendIcon,
  };
};