CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    student_no VARCHAR(20) UNIQUE NOT NULL,
    school_id UUID REFERENCES schools(id),
    grade_id UUID REFERENCES grades(id),
    class_id UUID REFERENCES classes(id),
    enrollment_year VARCHAR(10),      -- 入学年份
    parent_name VARCHAR(50),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'withdrawn')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_student_no ON students(student_no);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_grade_id ON students(grade_id);
CREATE INDEX idx_students_status ON students(status);