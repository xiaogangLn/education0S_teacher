import { useState, useCallback } from 'react';
import type { ClassDetail, ExportFormat } from '../types';
import { exportService } from '@api/index';
import { message } from 'antd';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportData = useCallback(async (data: ClassDetail[], format: ExportFormat) => {
    setExporting(true);
    setExportProgress(20);
    try {
      const created = await exportService.create({
        scope: { academic: true, teacher: true, student: true, plan: true },
        format: format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'excel',
        time_range: '3months',
      });
      setExportProgress(80);
      const payload: any = created;
      const taskId = payload?.data?.task_id || payload?.task_id;
      if (taskId) {
        try {
          await exportService.download(taskId);
        } catch {
          const header = '班级,掌握度';
          const csv = [header, ...data.map((item) => `${item.className},${item.masteryRate}`)].join('\n');
          const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `学情报表_${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
      setExportProgress(100);
      message.success('导出任务已创建');
      return { success: true };
    } catch (error: any) {
      message.error(error?.message || '导出失败');
      return { success: false };
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportProgress, exportData };
};
