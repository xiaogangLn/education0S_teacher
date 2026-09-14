/**
 * 获取待审核列表
 */
// GET /api/v1/review/pending

// 查询参数
interface PendingReviewQuery {
    page?: number;
    page_size?: number;
    type?: 'lesson_plan' | 'courseware' | 'exam';
    subject?: string;
    grade_id?: string;
}

// 响应体
interface PendingReviewResponse {
    code: number;
    message: string;
    data: {
        items: PendingReviewItem[];
        total: number;
        page: number;
        page_size: number;
    };
}

interface PendingReviewItem {
    id: string;
    title: string;
    type: string;
    submitter: string;
    submitter_id: string;
    class_name: string;
    subject: string;
    submitted_at: string;
    status: 'pending';
    preview_content: string;
}

/**
 * 审核操作
 */
// POST /api/v1/review/{id}/approve

// 请求体
interface ReviewActionRequest {
    action: 'approve' | 'reject';
    comment?: string;               // 审核意见
    rejection_reason?: string;      // 驳回原因（reject时必填）
}

// 响应体
interface ReviewActionResponse {
    code: number;
    message: string;
    data: {
        id: string;
        status: 'approved' | 'rejected';
        reviewed_at: string;
        next_step?: string;
    };
}