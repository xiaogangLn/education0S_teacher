// hooks/useExportCenter.ts
import { useState, useCallback, useMemo } from 'react';
import type {
  ExportScope,
  ExportFormat,
  ExportFormatOption,
  TimeRange,
  ExportOption,
  ExportTask,
} from '../types';
import { defaultScopes, formatOptions, timeRangeOptions, exportOptions } from '../constants';

export const useExportCenter = () => {
  const [scopes, setScopes] = useState<ExportScope[]>(defaultScopes);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('3months');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([]);

  // 获取选中的范围
  const selectedScopes = useMemo(() => {
    return scopes.filter(s => s.checked).map(s => s.id);
  }, [scopes]);

  // 获取选中范围的数量
  const selectedCount = useMemo(() => {
    return scopes.filter(s => s.checked).length;
  }, [scopes]);

  // 切换范围选择
  const toggleScope = useCallback((id: string) => {
    setScopes(prev => prev.map(scope =>
      scope.id === id ? { ...scope, checked: !scope.checked } : scope
    ));
  }, []);

  // 全选/取消全选
  const toggleAllScopes = useCallback((checked: boolean) => {
    setScopes(prev => prev.map(scope => ({ ...scope, checked })));
  }, []);

  // 更新格式
  const updateFormat = useCallback((format: ExportFormat) => {
    setSelectedFormat(format);
  }, []);

  // 更新时间范围
  const updateTimeRange = useCallback((range: TimeRange) => {
    setSelectedTimeRange(range);
  }, []);

  // 获取当前时间范围的显示文本
  const getTimeRangeLabel = useCallback(() => {
    const option = timeRangeOptions.find(o => o.id === selectedTimeRange);
    return option?.label || '近3个月';
  }, [selectedTimeRange]);

  // 获取当前格式选项
  const getFormatOption = useCallback(() => {
    return formatOptions.find(f => f.id === selectedFormat);
  }, [selectedFormat]);

  // 执行导出
  const executeExport = useCallback(async (optionId?: string) => {
    if (selectedScopes.length === 0) {
      return { success: false, error: '请至少选择一个导出范围' };
    }

    setExporting(true);
    setExportProgress(0);

    try {
      // 模拟导出过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setExportProgress(i);
      }

      const task: ExportTask = {
        id: `task-${Date.now()}`,
        name: optionId
          ? exportOptions.find(o => o.id === optionId)?.title || '导出任务'
          : '批量导出',
        status: 'completed',
        progress: 100,
        format: selectedFormat,
        createdAt: new Date().toLocaleString('zh-CN'),
        downloadUrl: '#',
      };

      setExportTasks(prev => [task, ...prev]);

      return { success: true, task };
    } catch (error) {
      return { success: false, error: '导出失败，请重试' };
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }, [selectedScopes, selectedFormat]);

  // 批量导出
  const batchExport = useCallback(async () => {
    return executeExport();
  }, [executeExport]);

  // 单个选项导出
  const exportOption = useCallback(async (optionId: string) => {
    return executeExport(optionId);
  }, [executeExport]);

  // 生成导出记录
  const generateExportRecord = useCallback(() => {
    console.log('生成导出记录:', {
      scopes: selectedScopes,
      format: selectedFormat,
      timeRange: selectedTimeRange,
      timestamp: new Date().toISOString(),
    });
  }, [selectedScopes, selectedFormat, selectedTimeRange]);

  // 重置选择
  const resetSelection = useCallback(() => {
    setScopes(defaultScopes);
    setSelectedFormat('excel');
    setSelectedTimeRange('3months');
  }, []);

  return {
    // 状态
    scopes,
    selectedFormat,
    selectedTimeRange,
    selectedScopes,
    selectedCount,
    exporting,
    exportProgress,
    exportTasks,
    // 方法
    toggleScope,
    toggleAllScopes,
    updateFormat,
    updateTimeRange,
    getTimeRangeLabel,
    getFormatOption,
    batchExport,
    exportOption,
    generateExportRecord,
    resetSelection,
  };
};