// hooks/useExportCenter.ts
import { useState, useCallback, useMemo } from 'react';
import type {
  ExportScope,
  ExportFormat,
  TimeRange,
  ExportTask,
} from '../types';
import { defaultScopes, formatOptions, timeRangeOptions, exportOptions } from '../constants';
import { exportService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

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
    setExportProgress(10);

    try {
      const payload = await exportService.create({
        scope: {
          academic: selectedScopes.includes('academic'),
          teacher: selectedScopes.includes('teacher'),
          student: selectedScopes.includes('student'),
          plan: selectedScopes.includes('plan'),
        },
        format: selectedFormat,
        time_range: selectedTimeRange,
      });
      const created = extractPayload<{ task_id?: string; file_name?: string; status?: string }>(payload);
      const taskId = created.task_id;
      if (!taskId) throw new Error('未返回导出任务');

      let progress = 20;
      let status = created.status || 'processing';
      let downloadUrl: string | undefined;
      let fileName = created.file_name || 'export';
      for (let i = 0; i < 8 && status !== 'completed' && status !== 'failed'; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const taskPayload = extractPayload<any>(await exportService.getTask(taskId));
        progress = Number(taskPayload.progress || progress + 10);
        status = taskPayload.status || status;
        downloadUrl = taskPayload.download_url;
        fileName = taskPayload.file_name || fileName;
        setExportProgress(Math.min(progress, 95));
      }

      if (status === 'failed') {
        throw new Error('导出任务失败');
      }

      const task: ExportTask = {
        id: taskId,
        name: optionId
          ? exportOptions.find(o => o.id === optionId)?.title || fileName
          : fileName,
        status: 'completed',
        progress: 100,
        format: selectedFormat,
        createdAt: new Date().toLocaleString('zh-CN'),
        downloadUrl: downloadUrl || `/api/v1/export/download/${taskId}`,
      };
      setExportProgress(100);
      setExportTasks(prev => [task, ...prev]);
      if (task.downloadUrl && task.downloadUrl !== '#') {
        window.open(task.downloadUrl, '_blank');
      }
      return { success: true, task };
    } catch (error: any) {
      return { success: false, error: error?.message || '导出失败，请重试' };
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }, [selectedScopes, selectedFormat, selectedTimeRange]);

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