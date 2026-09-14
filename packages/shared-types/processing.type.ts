/**
 * 创建生成任务
 */
// POST /api/v1/processing/tasks

// 请求体
interface CreateTaskRequest {
    class_id: string;               // 班级ID
    subject: string;                // 学科
    topic: string;                  // 课题
    teacher_ideas: {
        teaching_approach: string;  // 教学思路
        key_points: string[];       // 重点强调
        special_design: string;     // 特殊设计
        target_students: string;    // 目标学生
    };
}

// 响应体
interface CreateTaskResponse {
    code: number;
    message: string;
    data: {
        task_id: string;
        status: string;
        current_stage: 'init';
        created_at: string;
    };
}

/**
 * SSE 启动生成
 */
// GET /api/v1/processing/tasks/{task_id}/stream/{stage}

// 路径参数
// task_id: 任务ID
// stage: init | analysis | outline | content | refine

// SSE 事件流
// 事件类型: start, chunk, data, progress, complete, error

// start 事件
interface SSEStartEvent {
    type: 'start';
    stage: string;
    timestamp: string;
}

// chunk 事件（流式内容）
interface SSEChunkEvent {
    type: 'chunk';
    data: {
        type: 'text' | 'markdown' | 'structured';
        content: string;
        position: number;
    };
}

// data 事件（结构化数据）
interface SSEDataEvent {
    type: 'data';
    data: {
        type: 'structured';
        content: any;
    };
}

// progress 事件
interface SSEProgressEvent {
    type: 'progress';
    progress: number;       // 0-100
    total: number;
}

// complete 事件
interface SSECompleteEvent {
    type: 'complete';
    stage: string;
    status: 'done';
    content: string;
    next_action: 'confirm' | 'adjust' | 'next';
}

// error 事件
interface SSEErrorEvent {
    type: 'error';
    code: number;
    message: string;
}

/**
 * 阶段确认
 */
// POST /api/v1/processing/tasks/{task_id}/confirm

// 请求体
interface ConfirmStageRequest {
    stage: 'init' | 'analysis' | 'outline' | 'content' | 'refine';
    confirmed: boolean;
    adjustments?: string;   // 调整意见
}

// 响应体
interface ConfirmStageResponse {
    code: number;
    message: string;
    data: {
        stage: string;
        status: 'confirmed';
        next_stage: string;
    };
}

/**
 * 对话调整
 */
// POST /api/v1/processing/tasks/{task_id}/adjust

// 请求体
interface AdjustRequest {
    stage: 'analysis' | 'outline' | 'content' | 'refine';
    instruction: string;                // 调整指令
    type: 'adjust' | 'regenerate' | 'refine';
    target?: string;                    // 调整目标（如章节ID）
}

// 响应体
interface AdjustResponse {
    code: number;
    message: string;
    data: {
        task_id: string;
        stage: string;
        stream_url: string;             // 新的SSE流地址
    };
}

