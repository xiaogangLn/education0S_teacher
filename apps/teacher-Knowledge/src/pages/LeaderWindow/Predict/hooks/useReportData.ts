import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReportRecord, FilterState, ReportStats } from '../types';
import { dashboardService, studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';

const ALL_CLASS = '全部班级';
const ALL_SUBJECT = '全部学科';
const ALL_DIMENSION = '全部维度';

export const useReportData = () => {
  const org = useOrgContext();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<ReportRecord[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([ALL_CLASS]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([ALL_SUBJECT]);
  const [filter, setFilter] = useState<FilterState>({
    grade: ALL_CLASS,
    subject: ALL_SUBJECT,
    dimension: ALL_DIMENSION,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentRes, trendRes] = await Promise.all([
        studentsService.getList({
          page: 1,
          page_size: 500,
          enrollment_year: org.enrollmentYear || undefined,
        }),
        dashboardService.getTrend({ enrollment_year: org.enrollmentYear || undefined }),
      ]);
      const payload = extractPayload<{ items: any[] }>(studentRes);
      const trend = extractPayload<{ subjects?: string[]; grades?: Array<{ grade: string; change?: number }> }>(trendRes);
      const items = payload?.items || [];
      const byClass = new Map<string, { id: string; className: string; grade: string; rates: number[] }>();
      items.forEach((item) => {
        const className = item.class_name || '未分班';
        const current = byClass.get(className) || {
          id: item.class_id || className,
          className,
          grade: item.grade_name || org.enrollmentYear || '',
          rates: [],
        };
        current.rates.push(Number(item.mastery_rate || 0));
        byClass.set(className, current);
      });
      const rows: ReportRecord[] = Array.from(byClass.values()).map((item) => {
        const avg = item.rates.length
          ? Math.round(item.rates.reduce((sum, value) => sum + value, 0) / item.rates.length)
          : 0;
        const excellentRate = item.rates.length
          ? Math.round((item.rates.filter((value) => value >= 85).length / item.rates.length) * 100)
          : 0;
        const improvementRate = item.rates.length
          ? Math.round((item.rates.filter((value) => value > 0 && value < 60).length / item.rates.length) * 100)
          : 0;
        const weekChange = Number(
          (trend?.grades || []).find((g) => g.grade === item.className || g.grade === item.grade)?.change || 0,
        );
        return {
          id: item.id,
          grade: item.grade,
          className: item.className,
          subject: '综合',
          masteryRate: avg,
          excellentRate,
          improvementRate,
          weekChange,
          trend: weekChange > 0.5 ? 'up' : weekChange < -0.5 ? 'down' : avg >= 80 ? 'up' : avg < 60 ? 'down' : 'stable',
        };
      });
      setAllData(rows);
      setClassOptions([ALL_CLASS, ...rows.map((item) => item.className)]);
      const subjects = Array.from(new Set(['综合', ...(trend?.subjects || [])].filter(Boolean)));
      setSubjectOptions([ALL_SUBJECT, ...subjects]);
    } catch {
      setAllData([]);
      setClassOptions([ALL_CLASS]);
      setSubjectOptions([ALL_SUBJECT]);
    } finally {
      setLoading(false);
    }
  }, [org.enrollmentYear]);

  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (filter.grade !== ALL_CLASS && item.className !== filter.grade && item.grade !== filter.grade) return false;
      if (filter.subject !== ALL_SUBJECT && item.subject !== filter.subject && filter.subject !== '综合') return false;
      if (filter.dimension === '优秀率') return item.excellentRate >= 30;
      if (filter.dimension === '待提升率') return item.improvementRate >= 20;
      if (filter.dimension === '掌握度') return item.masteryRate >= 0;
      return true;
    });
  }, [allData, filter]);

  const stats: ReportStats = useMemo(() => {
    if (!filteredData.length) {
      return { totalRecords: 0, averageMastery: 0, maxMastery: 0, minMastery: 0, upTrendCount: 0, downTrendCount: 0 };
    }
    const rates = filteredData.map((item) => item.masteryRate);
    return {
      totalRecords: filteredData.length,
      averageMastery: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
      maxMastery: Math.max(...rates),
      minMastery: Math.min(...rates),
      upTrendCount: filteredData.filter((item) => item.trend === 'up').length,
      downTrendCount: filteredData.filter((item) => item.trend === 'down').length,
    };
  }, [filteredData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    filteredData,
    filter,
    stats,
    classOptions,
    subjectOptions,
    updateFilter: (key: keyof FilterState, value: string) => setFilter((prev) => ({ ...prev, [key]: value })),
    resetFilter: () => setFilter({ grade: ALL_CLASS, subject: ALL_SUBJECT, dimension: ALL_DIMENSION }),
    reload: loadData,
  };
};
