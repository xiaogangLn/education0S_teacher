// packages/shared/src/api/export.ts
// ============================================================
// 导出 API
// ============================================================

import { httpClient } from './client';
import {
  ExportRequest,
  ExportResponse,
  ExportTask,
  ExportFormat,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const BASE_URL = '/export';

export const exportApi = {
  // 创建导出任务
  createTask: (data: ExportRequest): Promise<ApiResponse<ExportResponse>> => {
    return httpClient.post(`${BASE_URL}/tasks`, data);
  },

  // 获取导出任务状态
  getTaskStatus: (taskId: string): Promise<ApiResponse<ExportTask>> => {
    return httpClient.get(`${BASE_URL}/tasks/${taskId}`);
  },

  // 获取导出任务列表
  getTasks: (params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<ExportTask>>> => {
    return httpClient.get(`${BASE_URL}/tasks`, { params });
  },

  // 下载导出文件
  downloadFile: (taskId: string): Promise<void> => {
    return httpClient.download(`${BASE_URL}/tasks/${taskId}/download`);
  },

  // 取消导出任务
  cancelTask: (taskId: string): Promise<ApiResponse<void>> => {
    return httpClient.post(`${BASE_URL}/tasks/${taskId}/cancel`);
  },

  // 删除导出任务
  deleteTask: (taskId: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(`${BASE_URL}/tasks/${taskId}`);
  },

  // 获取导出选项
  getOptions: (): Promise<ApiResponse<{
    scopes: Array<{ id: string; label: string; description: string }>;
    formats: Array<{ id: string; label: string; icon: string }>;
    timeRanges: Array<{ id: string; label: string }>;
  }>> => {
    return httpClient.get(`${BASE_URL}/options`);
  },

  // 生成导出记录
  generateRecord: (taskId: string): Promise<ApiResponse<{ recordUrl: string }>> => {
    return httpClient.post(`${BASE_URL}/tasks/${taskId}/record`);
  },
};