/**
 * 获取学生列表
 */

// GET /api/v1/students

// 查询参数
interface StudentListQuery {
    page?: number;          // 页码，默认1
    page_size?: number;     // 每页数量，默认20
    keyword?: string;       // 搜索关键词
    class_id?: string;      // 班级ID筛选
    grade_id?: string;      // 年级ID筛选
    status?: 'active' | 'transferred' | 'graduated' | 'withdrawn';
    sort_by?: 'name' | 'student_no' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// 响应体
interface StudentListResponse {
    code: number;
    message: string;
    data: {
        items: StudentInfo[];
        total: number;
        page: number;
        page_size: number;
    };
}

interface StudentInfo {
    id: string;
    user_id: string;
    student_no: string;
    name: string;
    gender: 'male' | 'female';
    school_id: string;
    school_name: string;
    grade_id: string;
    grade_name: string;
    class_id: string;
    class_name: string;
    enrollment_year: string;
    parent_name: string;
    parent_phone: string;
    status: 'active' | 'transferred' | 'graduated' | 'withdrawn';
    mastery_rate: number;
    rank: number;
    total_students: number;
    created_at: string;
}
/**
 * 
 * 获取学生详情
 */

// GET /api/v1/students/{id}

// 响应体
interface StudentDetailResponse {
    code: number;
    message: string;
    data: {
        id: string;
        user_id: string;
        student_no: string;
        name: string;
        gender: 'male' | 'female';
        school_id: string;
        school_name: string;
        grade_id: string;
        grade_name: string;
        class_id: string;
        class_name: string;
        enrollment_year: string;
        parent_name: string;
        parent_phone: string;
        parent_email: string;
        status: string;
        // 扩展信息
        mastery_rate: number;
        rank: number;
        total_students: number;
        strengths: string[];
        weaknesses: string[];
        transfer_history: TransferRecord[];
        abilities: Ability[];
        portraits: {
            academic: any;
            abilities: any;
            behaviors: any;
            psychology: any;
            growth: any;
        };
        created_at: string;
        updated_at: string;
    };
}

interface TransferRecord {
    id: string;
    from_class: string;
    to_class: string;
    transfer_date: string;
    reason: string;
    operated_by: string;
}

interface Ability {
    name: string;
    value: number;
    label: string;
}

/**
 * 执行换班
 */
// POST /api/v1/students/{id}/transfer

// 请求体
interface TransferRequest {
    target_class_id: string;    // 目标班级ID
    reason: string;             // 换班原因
    transfer_date?: string;     // 换班日期，默认当天
}

// 响应体
interface TransferResponse {
    code: number;
    message: string;
    data: {
        student_id: string;
        from_class: string;
        to_class: string;
        from_grade: string;
        to_grade: string;
        transfer_date: string;
        status: 'pending' | 'executed';
        record_id: string;
    };
}