// hooks/useReportData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReportRecord, FilterState, ReportStats } from '../types';
import { mockReportData } from '../constants';

export const useReportData = () => {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<ReportRecord[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    grade: '全部班级',
    subject: '全部学科',
    dimension: '全部维度',
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAllData(mockReportData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 筛选数据
  const filteredData = useMemo(() => {
    let result = allData;

    if (filter.grade !== '全部班级') {
      result = result.filter(item => item.grade === filter.grade);
    }
    if (filter.subject !== '全部学科') {
      result = result.filter(item => item.subject === filter.subject);
    }

    return result;
  }, [allData, filter]);

  // 统计信息
  const stats = useMemo((): ReportStats => {
    if (filteredData.length === 0) {
      return {
        totalRecords: 0,
        averageMastery: 0,
        maxMastery: 0,
        minMastery: 0,
        upTrendCount: 0,
        downTrendCount: 0,
      };
    }

    const rates = filteredData.map(d => d.masteryRate);
    const upCount = filteredData.filter(d => d.trend === 'up').length;
    const downCount = filteredData.filter(d => d.trend === 'down').length;

    return {
      totalRecords: filteredData.length,
      averageMastery: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length * 10) / 10,
      maxMastery: Math.max(...rates),
      minMastery: Math.min(...rates),
      upTrendCount: upCount,
      downTrendCount: downCount,
    };
  }, [filteredData]);

  // 更新筛选条件
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  // 重置筛选
  const resetFilter = useCallback(() => {
    setFilter({
      grade: '全部班级',
      subject: '全部学科',
      dimension: '全部维度',
    });
  }, []);

  // 获取唯一值列表
  const getUniqueValues = useCallback((key: keyof ReportRecord) => {
    const values = new Set(allData.map(item => String(item[key])));
    return Array.from(values);
  }, [allData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    allData,
    filteredData,
    filter,
    stats,
    updateFilter,
    resetFilter,
    reload: loadData,
    getUniqueValues,
  };
};