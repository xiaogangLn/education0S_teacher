/**
 * 批量创建学习记录
 */
// POST /api/v1/learning/records/batch

// 请求体
interface BatchCreateRecordRequest {
    lesson_plan_id: string;             // 教案ID
    class_id: string;                   // 班级ID（全班生成）
    assignment_title: string;           // 作业标题
    common_questions: Question[];       // 必做题（全班统一）
    personalized_map: Record<string, Question[]>; // 个性化题 {studentId: [questions]}
}

interface Question {
    id: string;
    content: string;
    type: 'choice' | 'fill' | 'answer';
    score: number;
    options?: string[];
    answer?: string;
}

// 响应体
interface BatchCreateRecordResponse {
    code: number;
    message: string;
    data: {
        total: number;                  // 总生成数
        success: number;                // 成功数
        record_ids: string[];
        created_at: string;
    };
}

/**
 * 提交作业
 */

// PUT /api/v1/learning/records/{id}/submit

// 请求体
interface SubmitRecordRequest {
    images: string[];                   // 图片URL
    files: string[];                    // 文件URL
    answers: Record<string, string>;    // 题目答案 {questionId: answer}
    class_evaluation?: {
        rating: number;                 // 1-5星
        comment: string;                // 评语
    };
}

// 响应体
interface SubmitRecordResponse {
    code: number;
    message: string;
    data: {
        record_id: string;
        status: 'submitted';
        submitted_at: string;
        ai_analysis_started: boolean;
    };
}

/**
 * 批改作业
 */
// PUT /api/v1/learning/records/{id}/grade

// 请求体
interface GradeRecordRequest {
    scores: Record<string, number>;     // 每道题得分 {questionId: score}
    feedback: string;                   // 整体反馈
    teacher_score?: number;             // 教师打分
}

// 响应体
interface GradeRecordResponse {
    code: number;
    message: string;
    data: {
        record_id: string;
        status: 'graded';
        total_score: number;
        total_possible: number;
        mastery_rate: number;
        knowledge_analysis: {
            mastered: string[];
            developing: string[];
            not_mastered: string[];
        };
        graded_at: string;
    };
}