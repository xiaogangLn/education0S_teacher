-- 收藏表（更灵活的设计）
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('knowledge_item', 'lesson_plan', 'exam', 'courseware')),
    target_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_target ON favorites(target_type, target_id);