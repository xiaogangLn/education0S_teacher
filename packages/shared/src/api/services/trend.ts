// packages/shared/src/api/trend.ts
// ============================================================
// 趋势预测 API
// ============================================================

import { httpClient } from './client';
import {
  PredictionRequest,
  TrendPrediction,
  PredictionStep,
  PredictionStats,
  ApiResponse,
} from '../types';

const BASE_URL = '/trend';

export const trendApi = {
  // 启动预测（SSE 流式）
  startPrediction: (params: PredictionRequest): EventSource => {
    const url = `${BASE_URL}/predict/stream?grade=${encodeURIComponent(params.grade)}&subject=${encodeURIComponent(params.subject)}&weeks=${params.weeks}&confidence=${params.confidenceLevel || 80}`;
    return httpClient.createEventSource(url);
  },

  // 获取预测结果（非流式）
  getPrediction: (params: PredictionRequest): Promise<ApiResponse<TrendPrediction>> => {
    return httpClient.get(`${BASE_URL}/predict`, { params });
  },

  // 获取预测统计
  getStats: (params: { grade: string; subject: string }): Promise<ApiResponse<PredictionStats>> => {
    return httpClient.get(`${BASE_URL}/stats`, { params });
  },

  // 获取预警列表
  getAlerts: (params?: { grade?: string; subject?: string }): Promise<ApiResponse<PredictionStep[]>> => {
    return httpClient.get(`${BASE_URL}/alerts`, { params });
  },

  // 导出预测报告
  exportReport: (params: PredictionRequest & { format: 'pdf' | 'excel' }): Promise<void> => {
    return httpClient.download(`${BASE_URL}/export`, { params });
  },

  // 刷新预测模型
  refreshModel: (params: { grade: string; subject: string }): Promise<ApiResponse<{ status: string; message: string }>> => {
    return httpClient.post(`${BASE_URL}/refresh`, params);
  },
};