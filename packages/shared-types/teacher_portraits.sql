CREATE TABLE teacher_portraits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID UNIQUE NOT NULL REFERENCES users(id),
    school_id UUID REFERENCES schools(id),
    department_id UUID REFERENCES departments(id),
    -- 教学画像
    teaching JSONB DEFAULT '{
        "lesson_plan_quality": 0,
        "classroom_interaction": 0,
        "teaching_style": "",
        "innovation_score": 0
    }',
    -- 教研画像
    research JSONB DEFAULT '{
        "research_participation": 0,
        "projects_count": 0,
        "training_hours": 0
    }',
    -- 效果画像
    effectiveness JSONB DEFAULT '{
        "student_progress": 0,
        "satisfaction": 0,
        "peer_evaluation": 0
    }',
    -- 成长画像
    growth JSONB DEFAULT '{
        "capability_evolution": "",
        "milestones": [],
        "development_suggestions": []
    }',
    overall_score DECIMAL(5,2),
    growth_trend DECIMAL(5,2),
    last_calculated_at TIMESTAMP,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_portraits_teacher_id ON teacher_portraits(teacher_id);