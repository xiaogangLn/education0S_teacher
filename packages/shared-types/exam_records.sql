CREATE TABLE exam_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    exam_name VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    class_average DECIMAL(5,2),
    rank INT,
    total_students INT,
    exam_type VARCHAR(20) CHECK (exam_type IN ('midterm', 'final', 'quiz', 'mock')),
    exam_date DATE NOT NULL,
    images JSONB DEFAULT '[]',
    knowledge_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_student_id ON exam_records(student_id);
CREATE INDEX idx_exam_subject ON exam_records(subject);
CREATE INDEX idx_exam_exam_date ON exam_records(exam_date);