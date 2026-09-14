// components/CoursewareHeader.tsx
import React from 'react';
import { Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { CoursewareDetail } from '../types';
import { useNavigate } from 'react-router-dom';

interface CoursewareHeaderProps {
  courseware: CoursewareDetail;
  onBack?: () => void;
}

export const CoursewareHeader: React.FC<CoursewareHeaderProps> = ({
  courseware,
  onBack,
}) => {
    const navigate = useNavigate();
  const statusMap = {
    draft: { color: 'default', label: '草稿' },
    reviewing: { color: 'processing', label: '审核中' },
    published: { color: 'success', label: '已发布' },
    archived: { color: 'default', label: '已归档' },
  };

  const status = statusMap[courseware.status] || statusMap.draft;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{courseware.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            📚 {courseware.subject} · {courseware.grade} · {courseware.className}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tag color={status.color}>{status.label}</Tag>
          {courseware.isAIGenerated && (
            <Tag color="purple" className="flex items-center gap-1">
              🤖 AI生成
            </Tag>
          )}
          <Tag color="blue">v{courseware.version}</Tag>
            <Button onClick={() => navigate('/workbench/historyOrder')} icon={<ArrowLeftOutlined />} className="rounded-full">返回</Button>
        </div>
      </div>
    </div>
  );
};