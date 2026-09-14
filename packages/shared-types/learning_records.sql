-- 学习记录表完整字段
CREATE TABLE learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    lesson_plan_id UUID REFERENCES lesson_generation_tasks(id),
    lesson_plan_title VARCHAR(200) NOT NULL,
    assignment_title VARCHAR(200) NOT NULL,
    
    -- 作业内容
    common_questions JSONB DEFAULT '[]',           -- 必做题
    personalized_questions JSONB DEFAULT '[]',     -- 个性化题
    
    -- 提交内容
    images JSONB DEFAULT '[]',                      -- 作业图片
    files JSONB DEFAULT '[]',                       -- 附件文件（新增）
    
    -- 课堂评价
    class_evaluation JSONB DEFAULT '{
        "rating": 0,
        "comment": "",
        "teacher": "",
        "created_at": "",
        "type": ""
    }',
    
    -- AI批改结果
    ai_result JSONB DEFAULT '{
        "score": 0,
        "total_score": 0,
        "level": "",
        "basic_score": 0,
        "basic_total": 0,
        "basic_accuracy": 0,
        "advanced_score": 0,
        "advanced_total": 0,
        "advanced_accuracy": 0,
        "errors": []
    }',
    
    -- 教师反馈
    teacher_feedback TEXT,
    teacher_score DECIMAL(5,2),                     -- 教师评分（新增）
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_learning_student_id ON learning_records(student_id);
CREATE INDEX idx_learning_lesson_plan_id ON learning_records(lesson_plan_id);
CREATE INDEX idx_learning_status ON learning_records(status);
CREATE INDEX idx_learning_created_at ON learning_records(created_at DESC);