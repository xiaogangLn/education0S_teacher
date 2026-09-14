CREATE TABLE class_transfer_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    from_class_id UUID REFERENCES classes(id),
    to_class_id UUID NOT NULL REFERENCES classes(id),
    from_grade_id UUID REFERENCES grades(id),
    to_grade_id UUID REFERENCES grades(id),
    transfer_date DATE NOT NULL,
    reason VARCHAR(200),
    operated_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfer_student_id ON class_transfer_records(student_id);
CREATE INDEX idx_transfer_from_class ON class_transfer_records(from_class_id);
CREATE INDEX idx_transfer_to_class ON class_transfer_records(to_class_id);