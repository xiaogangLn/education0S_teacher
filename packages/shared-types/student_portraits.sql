CREATE TABLE student_portraits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(id),
    -- 学业画像
    academic JSONB DEFAULT '{
        "subjects": {},
        "overall_mastery": 0,
        "trend": "stable",
        "strengths": [],
        "weaknesses": []
    }',
    -- 能力画像（布鲁姆六层）
    abilities JSONB DEFAULT '{
        "memory": 0,
        "comprehension": 0,
        "application": 0,
        "analysis": 0,
        "evaluation": 0,
        "creation": 0
    }',
    -- 行为画像
    behaviors JSONB DEFAULT '{
        "homework_rate": 0,
        "homework_accuracy": 0,
        "participation": 0,
        "handwriting_score": 0,
        "learning_habit": "moderate"
    }',
    -- 心理画像
    psychology JSONB DEFAULT '{
        "motivation": 0,
        "anxiety": 0,
        "self_efficacy": 0,
        "cooperation": 0,
        "stress_level": 0
    }',
    -- 成长画像
    growth JSONB DEFAULT '{
        "milestones": [],
        "improvement_rate": 0,
        "teacher_comments": []
    }',
    overall_score DECIMAL(5,2),
    overall_grade VARCHAR(10),
    last_calculated_at TIMESTAMP,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portraits_student_id ON student_portraits(student_id);
CREATE INDEX idx_portraits_overall_score ON student_portraits(overall_score);