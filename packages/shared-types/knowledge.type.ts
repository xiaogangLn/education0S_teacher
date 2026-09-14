/**
 * 获取文档列表
 */
// GET /api/v1/knowledge/documents

// 查询参数
interface DocumentListQuery {
    page?: number;
    page_size?: number;
    keyword?: string;
    type?: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'link' | 'image';
    permission?: 'school' | 'grade' | 'class' | 'personal';
    category?: string;
    sort_by?: 'created_at' | 'title' | 'view_count';
    sort_order?: 'asc' | 'desc';
}

// 响应体
interface DocumentListResponse {
    code: number;
    message: string;
    data: {
        items: DocumentInfo[];
        total: number;
        page: number;
        page_size: number;
    };
}

interface DocumentInfo {
    id: string;
    title: string;
    type: string;
    permission: 'school' | 'grade' | 'class' | 'personal';
    file_size: number;
    file_url: string;
    creator_name: string;
    created_at: string;
    view_count: number;
    download_count: number;
    status: 'active' | 'archived';
}

/**
 * 上传文件
 */
// POST /api/v1/knowledge/documents

// 请求体 (multipart/form-data)
interface DocumentUploadRequest {
    file: File;                 // 文件
    title: string;              // 文档标题
    permission: 'school' | 'grade' | 'class' | 'personal';  // 权限
    category?: string;          // 分类
    tags?: string[];            // 标签
}

// 响应体
interface DocumentUploadResponse {
    code: number;
    message: string;
    data: {
        id: string;
        title: string;
        file_url: string;
        file_size: number;
        permission: string;
        created_at: string;
    };
}

/**
 * 拍照批改
 */
// POST /api/v1/knowledge/grading/photo

// 请求体 (multipart/form-data)
interface PhotoGradingRequest {
    image: File;                // 图片
    student_id: string;         // 学生ID
    subject: string;            // 学科
    assignment_title: string;   // 作业标题
}

// 响应体
interface PhotoGradingResponse {
    code: number;
    message: string;
    data: {
        record_id: string;
        ocr_result: string;     // OCR识别文本
        handwriting_analysis: {
            neatness: number;   // 工整度
            stroke: number;     // 笔画规范性
            consistency: number; // 一致性
            layout: number;     // 排版
        };
        ai_score: number;
        ai_feedback: string;
        status: 'pending_confirm';
    };
}