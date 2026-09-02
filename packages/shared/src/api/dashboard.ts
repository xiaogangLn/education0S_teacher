// packages/shared/src/api/dashboard.ts
// ============================================================
// 仪表盘 API
// ============================================================

import { httpClient } from './client';
import {
  DashboardStats,
  GradeTrend,
  ClassDetail,
  DashboardQueryParams,
  LeaderViewData,
  AlertItem,
  ApiResponse,
} from '../types';

const BASE_URL = '/dashboard';

export const dashboardApi = {
  // 获取仪表盘统计数据
  getStats: (params?: DashboardQueryParams): Promise<ApiResponse<DashboardStats>> => {
    return httpClient.get(`${BASE_URL}/stats`, { params });
  },

  // 获取年级趋势
  getGradeTrends: (params?: DashboardQueryParams): Promise<ApiResponse<GradeTrend[]>> => {
    return httpClient.get(`${BASE_URL}/grade-trends`, { params });
  },

  // 获取班级详情
  getClassDetails: (params?: DashboardQueryParams): Promise<ApiResponse<ClassDetail[]>> => {
    return httpClient.get(`${BASE_URL}/class-details`, { params });
  },

  // 获取领导视图完整数据
  getLeaderView: (params?: DashboardQueryParams): Promise<ApiResponse<LeaderViewData>> => {
    return httpClient.get(`${BASE_URL}/leader-view`, { params });
  },

  // 获取预警列表
  getAlerts: (params?: { resolved?: boolean; severity?: string }): Promise<ApiResponse<AlertItem[]>> => {
    return httpClient.get(`${BASE_URL}/alerts`, { params });
  },

  // 标记预警已处理
  resolveAlert: (id: string): Promise<ApiResponse<void>> => {
    return httpClient.post(`${BASE_URL}/alerts/${id}/resolve`);
  },

  // 导出报表数据（直接下载文件）
  exportReport: (params: DashboardQueryParams & { format: 'excel' | 'pdf' }): Promise<void> => {
    return httpClient.download(`${BASE_URL}/export`, { params });
  },
};