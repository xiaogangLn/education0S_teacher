// POST /api/v1/auth/login

// 请求体
interface LoginRequest {
    phone: string;          // 手机号
    password: string;       // 密码
    remember?: boolean;     // 记住我
}

// 响应体
interface LoginResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            username: string;
            real_name: string;
            phone: string;
            email: string;
            role: 'admin' | 'grade_admin' | 'teacher' | 'student' | 'parent';
            school_id: string;
            grade_id: string;
            class_id: string;
            avatar_url: string;
            is_active: boolean;
        };
    };
}

// POST /api/v1/auth/refresh

// 请求体
interface RefreshTokenRequest {
    refresh_token: string;
}

// 响应体
interface RefreshTokenResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
        expires_in: number;
    };
}