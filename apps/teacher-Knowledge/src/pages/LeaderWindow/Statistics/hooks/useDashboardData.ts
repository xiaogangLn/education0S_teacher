import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ClassDetail, FilterState, GradeTrend } from '../types';
import { dashboardService, studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';

export const useDashboardData = () => {
  const org = useOrgContext();
  const [loading, setLoading] = useState(false);
  const [gradeTrends, setGradeTrends] = useState<GradeTrend[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isExportDrawer, setIsExportDrawer] = useState<boolean>(false);
  const [overview, setOverview] = useState<any>(null);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(['全部学科']);
  const [filter, setFilter] = useState<FilterState>({
    grade: '全部班级',
    subject: '全部学科',
    dimension: '全部维度',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [trendRes, overviewRes, studentRes] = await Promise.all([
        dashboardService.getTrend({ enrollment_year: org.enrollmentYear || undefined }),
        dashboardService.getOverview(),
        studentsService.getList({
          page: 1,
          page_size: 500,
          enrollment_year: org.enrollmentYear || undefined,
        }),
      ]);
      const trend = extractPayload<any>(trendRes);
      const overviewData = extractPayload<any>(overviewRes);
      const students = extractPayload<{ items: any[] }>(studentRes)?.items || [];
      setOverview(overviewData);
      setGradeTrends(
        (trend?.grades || []).map((item: any) => ({
          grade: item.grade,
          masteryRate: Math.round(Number(item.mastery_rate || 0)),
          change: Number(item.change || 0),
          trend: item.trend || 'stable',
        })),
      );
      const subjects = Array.from(new Set(['综合', ...(trend?.subjects || [])].filter(Boolean)));
      setSubjectOptions(['全部学科', ...subjects]);

      const byClass = new Map<string, { id: string; className: string; grade: string; rates: number[] }>();
      students.forEach((item) => {
        const className = item.class_name || '未分班';
        const current = byClass.get(className) || {
          id: item.class_id || className,
          className,
          grade: item.grade_name || '',
          rates: [],
        };
        current.rates.push(Number(item.mastery_rate || 0));
        byClass.set(className, current);
      });
      setClassDetails(
        Array.from(byClass.values()).map((item) => {
          const avg = item.rates.length
            ? Math.round(item.rates.reduce((sum, value) => sum + value, 0) / item.rates.length)
            : 0;
          return {
            id: item.id,
            grade: item.grade,
            className: item.className,
            subject: '综合',
            masteryRate: avg,
            excellentRate: item.rates.length
              ? Math.round((item.rates.filter((value) => value >= 85).length / item.rates.length) * 100)
              : 0,
            improvementRate: item.rates.length
              ? Math.round((item.rates.filter((value) => value > 0 && value < 60).length / item.rates.length) * 100)
              : 0,
            weekChange: Number(
              (trend?.grades || []).find((g: any) => g.grade === item.className || g.grade === item.grade)?.change
              ?? overviewData?.trends?.mastery_change
              ?? 0,
            ),
            trend: avg >= 80 ? 'up' : avg < 60 ? 'down' : 'stable',
          };
        }),
      );
    } catch {
      setGradeTrends([]);
      setClassDetails([]);
    } finally {
      setLoading(false);
    }
  }, [org.enrollmentYear]);

  const filteredData = classDetails.filter((item) => {
    if (filter.grade !== '全部班级' && item.className !== filter.grade && item.grade !== filter.grade) return false;
    if (filter.subject !== '全部学科' && item.subject !== filter.subject && filter.subject !== '综合') return false;
    return true;
  });

  const highlights = useMemo(() => {
    if (!filteredData.length) {
      return { average: 0, best: null as ClassDetail | null, worst: null as ClassDetail | null };
    }
    const sorted = [...filteredData].sort((a, b) => b.masteryRate - a.masteryRate);
    const average = Math.round(filteredData.reduce((sum, item) => sum + item.masteryRate, 0) / filteredData.length);
    return { average, best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [filteredData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    gradeTrends,
    classDetails: filteredData,
    isExportDrawer,
    setIsExportDrawer,
    filter,
    setFilter,
    subjectOptions,
    classOptions: ['全部班级', ...classDetails.map((item) => item.className)],
    highlights,
    overview,
    reload: loadData,
  };
};
