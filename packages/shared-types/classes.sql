CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id),
    grade_id UUID NOT NULL REFERENCES grades(id),
    name VARCHAR(50) NOT NULL,  -- '九年级1班', '九年级2班'
    display_order INT DEFAULT 0,
    academic_year VARCHAR(20),  -- '2026届'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_grade_id ON classes(grade_id);