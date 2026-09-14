// components/ExamHeader.tsx
import React from 'react';
import { Tag, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ExamDetail } from '../types';
import { useNavigate } from 'react-router-dom';

interface ExamHeaderProps {
  exam: ExamDetail;
  onBack?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({ exam, onBack }) => {
    const navigate = useNavigate();
  const statusMap = {
    draft: { color: 'default', label: '草稿' },
    reviewing: { color: 'processing', label: '审核中' },
    published: { color: 'success', label: '已发布' },
    archived: { color: 'default', label: '已归档' },
  };

  const status = statusMap[exam.status] || statusMap.draft;

  return (
    <div className="flex-shrink-0 mb-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{exam.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            📚 {exam.subject} · {exam.grade} · {exam.className} · 版本 v{exam.version}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color={status.color}>{status.label}</Tag>
          {exam.isAIGenerated && (
            <Tag color="purple" className="flex items-center gap-1">🤖 AI生成</Tag>
          )}
          <Tag color="blue">v{exam.version}</Tag>
          <Button onClick={() => navigate('/workbench/historyOrder')} icon={<ArrowLeftOutlined />} className="rounded-full">返回</Button>
        </div>
      </div>
    </div>
  );
};