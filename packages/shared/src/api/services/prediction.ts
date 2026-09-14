// packages/shared/src/api/services/prediction.ts
import { httpClient } from '../client';

export const predictionService = {
  // GET /api/v1/predict/stream - SSE流式预测
  createStream: (params: { grade: string; subject: string; weeks: 4 | 8 | 12; class_id?: string; enrollment_year?: string }): EventSource => {
    const query = new URLSearchParams(params as any).toString();
    return httpClient.createEventSource(`/predict/stream?${query}`);
  },

  // GET /api/v1/predict/report - 获取预测报告
  getReport: (params: { grade: string; subject: string; weeks: 4 | 8 | 12; class_id?: string; enrollment_year?: string }) => {
    return httpClient.get('/predict/report', { params });
  },

  // GET /api/v1/predict/export - 导出预测数据
  export: (params: {
    grade: string;
    subject: string;
    weeks: 4 | 8 | 12;
    class_id?: string;
    enrollment_year?: string;
    format?: 'excel' | 'pdf';
  }) => {
    return httpClient.get('/predict/export', { params });
  },
};