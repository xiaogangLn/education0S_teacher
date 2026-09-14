// types.ts
export interface PredictionStep {
    id: string;
    type: 'info' | 'analysis' | 'calculation' | 'result' | 'warning' | 'suggestion';
    title: string;
    content: string;
    timestamp: string;
    status: 'pending' | 'processing' | 'done';
  }
  
  export interface PredictionParams {
    grade: string;
    subject: string;
    weeks: number;
    enrollment_year?: string;
  }
  
  export interface SSEEvent {
    type: 'step' | 'progress' | 'complete' | 'error';
    data: any;
  }
  
  export const STEP_TYPE_CONFIG = {
    info: { icon: '📊', color: 'border-blue-400 bg-blue-50' },
    analysis: { icon: '📈', color: 'border-purple-400 bg-purple-50' },
    calculation: { icon: '🧮', color: 'border-yellow-400 bg-yellow-50' },
    result: { icon: '✅', color: 'border-green-400 bg-green-50' },
    warning: { icon: '⚠️', color: 'border-red-400 bg-red-50' },
    suggestion: { icon: '💡', color: 'border-indigo-400 bg-indigo-50' },
  } as const;