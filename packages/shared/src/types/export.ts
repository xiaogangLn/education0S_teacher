// packages/shared/src/types/export.ts
// ============================================================
// 导出相关类型定义
// ============================================================

/** 导出格式 */
export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

/** 导出范围 */
export interface ExportScope {
  id: string;
  label: string;
  checked: boolean;
  description?: string;
}

/** 导出选项 */
export interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

/** 导出任务 */
export interface ExportTask {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  format: ExportFormat;
  createdAt: string;
  downloadUrl?: string;
  error?: string;
  fileSize?: number;
}

/** 导出请求 */
export interface ExportRequest {
  scopeIds: string[];
  format: ExportFormat;
  timeRange: string;
  filters?: Record<string, any>;
}

/** 导出响应 */
export interface ExportResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  estimatedTime?: number;
}