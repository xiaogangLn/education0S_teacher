// packages/shared/src/types/trend.ts
// ============================================================
// 趋势预测相关类型定义
// ============================================================

/** 趋势数据点 */
export interface TrendDataPoint {
    week: number;
    weekLabel: string;
    actual: number | null;
    predicted: number | null;
    lowerBound: number | null;
    upperBound: number | null;
  }
  
  /** 趋势预测结果 */
  export interface TrendPrediction {
    data: TrendDataPoint[];
    startValue: number;
    currentValue: number;
    predictedValue: number;
    totalChange: number;
    weeklyGrowth: number;
    accuracy: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
  }
  
  /** 预测请求参数 */
  export interface PredictionRequest {
    grade: string;
    subject: string;
    weeks: number;
    confidenceLevel?: 80 | 95;
  }
  
  /** 预测步骤（SSE 流式） */
  export interface PredictionStep {
    id: string;
    type: 'info' | 'analysis' | 'calculation' | 'result' | 'warning' | 'suggestion';
    title: string;
    content: string;
    timestamp: string;
    status: 'pending' | 'processing' | 'done';
  }
  
  /** SSE 事件 */
  export interface SSEEvent {
    type: 'step' | 'progress' | 'complete' | 'error';
    data: any;
    step?: PredictionStep;
    progress?: number;
    message?: string;
  }
  
  /** 预测统计 */
  export interface PredictionStats {
    currentValue: number;
    predictedValue: number;
    totalChange: number;
    weeklyGrowth: number;
    accuracy: number;
    confidenceLevel: number;
  }