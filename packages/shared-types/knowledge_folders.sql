-- 知识库文件夹表
CREATE TABLE knowledge_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES knowledge_folders(id),
    school_id UUID REFERENCES schools(id),
    grade_id UUID REFERENCES grades(id),
    class_id UUID REFERENCES classes(id),
    created_by UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(100) NOT NULL,
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('school', 'grade', 'class', 'personal')),
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_folders_parent_id ON knowledge_folders(parent_id);
CREATE INDEX idx_knowledge_folders_permission ON knowledge_folders(permission);