-- 知识库文档表完整字段
CREATE TABLE knowledge_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    grade_id UUID REFERENCES grades(id),
    class_id UUID REFERENCES classes(id),
    folder_id UUID REFERENCES knowledge_folders(id),  -- 所属文件夹（新增）
    created_by UUID NOT NULL REFERENCES users(id),
    
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('document', 'sheet', 'video', 'audio', 'pdf', 'link', 'image')),
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('school', 'grade', 'class', 'personal')),
    category VARCHAR(50),                            -- 分类
    tags TEXT[] DEFAULT '{}',                        -- 标签数组（新增）
    
    content TEXT,
    file_url VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    
    is_favorited BOOLEAN DEFAULT FALSE,             -- 是否收藏（新增）
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    version INT DEFAULT 1,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_knowledge_school_id ON knowledge_items(school_id);
CREATE INDEX idx_knowledge_grade_id ON knowledge_items(grade_id);
CREATE INDEX idx_knowledge_class_id ON knowledge_items(class_id);
CREATE INDEX idx_knowledge_folder_id ON knowledge_items(folder_id);
CREATE INDEX idx_knowledge_created_by ON knowledge_items(created_by);
CREATE INDEX idx_knowledge_type ON knowledge_items(type);
CREATE INDEX idx_knowledge_permission ON knowledge_items(permission);
CREATE INDEX idx_knowledge_status ON knowledge_items(status);
CREATE INDEX idx_knowledge_tags ON knowledge_items USING GIN (tags);