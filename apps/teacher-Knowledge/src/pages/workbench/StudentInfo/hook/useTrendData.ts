import { useMemo } from 'react';
import type { ExamRecord } from '../types';


export const useTrendData = (exams: ExamRecord[]) => {
  const trendData = useMemo(() => {
    return exams.map(exam => ({
      label: exam.name,
      score: exam.score,
    }));
  }, [exams]);

  const maxScore = useMemo(() => {
    if (trendData.length === 0) return 100;
    return Math.max(100, ...trendData.map(d => d.score)) + 10;
  }, [trendData]);

  return { trendData, maxScore };
};