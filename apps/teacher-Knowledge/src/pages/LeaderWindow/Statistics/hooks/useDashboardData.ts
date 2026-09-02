// hooks/useDashboardData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ClassDetail, FilterState, GradeTrend } from '../types';
import { mockClassDetails, mockGradeTrends } from '../constants';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(false);
  const [gradeTrends, setGradeTrends] = useState<GradeTrend[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isExportDrawer, setIsExportDrawer] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterState>({
    grade: '全部年级',
    subject: '全部学科',
    dimension: '全部维度',
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setGradeTrends(mockGradeTrends);
      setClassDetails(mockClassDetails);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 筛选数据
  const filteredData = useMemo(() => {
    let result = classDetails;

    if (filter.grade !== '全部年级') {
      result = result.filter(item => item.grade === filter.grade);
    }
    if (filter.subject !== '全部学科') {
      result = result.filter(item => item.subject === filter.subject);
    }

    return result;
  }, [classDetails, filter]);

  // 更新筛选条件
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  // 重置筛选
  const resetFilter = useCallback(() => {
    setFilter({
      grade: '全部年级',
      subject: '全部学科',
      dimension: '全部维度',
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    gradeTrends,
    classDetails: filteredData,
    allClassDetails: classDetails,
    isExportDrawer,
    setIsExportDrawer,
    filter,
    updateFilter,
    resetFilter,
    reload: loadData,
  };
};