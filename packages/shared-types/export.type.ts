/**
 * 导出数据
 */
// POST /api/v1/export

// 请求体
interface ExportRequest {
    scope: {
        academic?: boolean;         // 全年级学情数据
        teacher?: boolean;          // 教师教学数据
        student?: boolean;          // 学生详细信息
        plan?: boolean;             // 教学计划审核记录
    };
    format: 'excel' | 'pdf' | 'csv' | 'json';
    time_range: '1month' | '3months' | '6months' | '1year';
    grade_id?: string;
    class_id?: string;
}

// 响应体
interface ExportResponse {
    code: number;
    message: string;
    data: {
        task_id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        file_name: string;
        file_url?: string;
        download_url?: string;
        expires_at?: string;
        created_at: string;
    };
}

/**
 * 获取导出任务状态
 */

// GET /api/v1/export/tasks/{task_id}

// 响应体
interface ExportTaskResponse {
    code: number;
    message: string;
    data: {
        task_id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress: number;
        file_name: string;
        file_size: number;
        download_url?: string;
        error_message?: string;
        created_at: string;
        completed_at?: string;
    };
}