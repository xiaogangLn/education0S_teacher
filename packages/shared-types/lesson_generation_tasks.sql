CREATE TABLE lesson_generation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    -- 五阶段数据
    teacher_ideas JSONB NOT NULL DEFAULT '{
        "teaching_approach": "",
        "key_points": [],
        "special_design": "",
        "target_students": ""
    }',
    class_analysis JSONB DEFAULT '{
        "mastery_rate": 0,
        "weak_points": [],
        "layers": {"A": 0, "B": 0, "C": 0},
        "zone_of_proximal_development": ""
    }',
    outline JSONB DEFAULT '{
        "sections": []
    }',
    content JSONB DEFAULT '{
        "sections": []
    }',
    refined_content JSONB DEFAULT '{
        "sections": []
    }',
    -- 生成状态
    current_stage VARCHAR(20) DEFAULT 'init' CHECK (current_stage IN ('init', 'analysis', 'outline', 'content', 'refine', 'complete')),
    generated_lesson_plan TEXT,
    generated_courseware_path VARCHAR(500),
    ai_generated_at TIMESTAMP,
    ai_tags TEXT[] DEFAULT '{"AI生成"}',
    -- 审批状态
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'pending_review', 'approved', 'rejected', 'published', 'archived')),
    draft_saved_at TIMESTAMP,
    submitted_at TIMESTAMP,
    approver_id UUID REFERENCES users(id),
    approval_comment TEXT,
    approved_at TIMESTAMP,
    knowledge_item_id UUID REFERENCES knowledge_items(id),
    published_at TIMESTAMP,
    -- 版本和编辑
    teacher_edits JSONB DEFAULT '[]',
    edit_count INT DEFAULT 0,
    version INT DEFAULT 1,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lesson_tasks_class_id ON lesson_generation_tasks(class_id);
CREATE INDEX idx_lesson_tasks_status ON lesson_generation_tasks(status);
CREATE INDEX idx_lesson_tasks_current_stage ON lesson_generation_tasks(current_stage);
CREATE INDEX idx_lesson_tasks_created_by ON lesson_generation_tasks(created_by);