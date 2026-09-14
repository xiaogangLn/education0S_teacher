-- 用户表完整字段
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE,                    -- 用户名（新增）
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    real_name VARCHAR(50) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'grade_admin', 'teacher', 'student', 'parent')),
    school_id UUID REFERENCES schools(id),
    grade_id UUID REFERENCES grades(id),
    class_id UUID REFERENCES classes(id),
    
    avatar_url VARCHAR(500),                        -- 头像
    is_active BOOLEAN DEFAULT TRUE,
    totp_secret VARCHAR(100),
    totp_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,                        -- 最后登录时间
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_grade_id ON users(grade_id);
CREATE INDEX idx_users_class_id ON users(class_id);