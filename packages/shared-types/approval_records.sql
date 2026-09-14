-- 审批记录表完整字段
CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('lesson_plan', 'courseware', 'exam', 'knowledge_item')),
    target_id UUID NOT NULL,
    submitter_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    comment TEXT,
    rejection_reason TEXT,                          -- 驳回原因（新增）
    attachments JSONB DEFAULT '[]',                  -- 附件
    
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approval_target ON approval_records(target_type, target_id);
CREATE INDEX idx_approval_submitter ON approval_records(submitter_id);
CREATE INDEX idx_approval_status ON approval_records(status);