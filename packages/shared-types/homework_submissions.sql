CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    lesson_plan_id UUID,
    assignment_title VARCHAR(200) NOT NULL,
    content TEXT,
    images JSONB DEFAULT '[]',
    files JSONB DEFAULT '[]',
    handwriting_analysis JSONB DEFAULT '{
        "neatness": 0,
        "stroke": 0,
        "consistency": 0,
        "layout": 0
    }',
    ai_score DECIMAL(5,2),
    teacher_score DECIMAL(5,2),
    teacher_feedback TEXT,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_homework_student_id ON homework_submissions(student_id);
CREATE INDEX idx_homework_lesson_plan_id ON homework_submissions(lesson_plan_id);
CREATE INDEX idx_homework_status ON homework_submissions(status);