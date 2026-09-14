/**
 * SSE 流式预测
 */
// GET /api/v1/predict/stream

// 查询参数
interface PredictStreamQuery {
    grade: string;          // 年级
    subject: string;        // 学科
    weeks: number;          // 预测周数 (4, 8, 12)
    class_id?: string;      // 班级ID（可选）
}

// SSE 事件流
// 事件类型: step, progress, complete, error

// step 事件
interface PredictStepEvent {
    type: 'step';
    data: {
        id: string;
        type: 'info' | 'analysis' | 'calculation' | 'result' | 'warning' | 'suggestion';
        title: string;
        content: string;        // Markdown格式
        timestamp: string;
    };
}

// progress 事件
interface PredictProgressEvent {
    type: 'progress';
    progress: number;       // 0-100
}

// complete 事件
interface PredictCompleteEvent {
    type: 'complete';
    data: {
        summary: string;
        accuracy: number;
        trend: 'up' | 'down' | 'stable';
        recommendations: string[];
        generated_at: string;
    };
}

// error 事件
interface PredictErrorEvent {
    type: 'error';
    code: number;
    message: string;
}