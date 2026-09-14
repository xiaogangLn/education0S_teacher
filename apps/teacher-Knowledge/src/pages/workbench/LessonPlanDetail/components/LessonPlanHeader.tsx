// components/LessonPlanHeader.tsx
import React from 'react';
import { Button, Tag } from 'antd';
import type { LessonPlanDetail } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface LessonPlanHeaderProps {
  plan: LessonPlanDetail;
  onEdit?: () => void;
  onViewStats?: () => void;
}

export const LessonPlanHeader: React.FC<LessonPlanHeaderProps> = ({
  plan,
  onEdit,
  onViewStats,
}) => {
    const navigate = useNavigate();
  const getStatusColor = (status: LessonPlanDetail['status']) => {
    const map = {
      draft: 'default',
      reviewing: 'processing',
      published: 'success',
      archived: 'default',
    };
    return map[status] || 'default';
  };

  return (
    <div className="flex-shrink-0 flex flex-wrap justify-between items-start gap-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xl text-gray-800">{plan.title}</span>
          <Tag color={getStatusColor(plan.status)}>
            {plan.status === 'draft' ? '草稿' :
             plan.status === 'reviewing' ? '审核中' :
             plan.status === 'published' ? '已发布' : '已归档'}
          </Tag>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {plan.className} · {plan.subject} · {plan.publishedAt || plan.updatedAt} 发布
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
          <Button className="rounded-full" icon={<ArrowLeftOutlined />} onClick={() => navigate('/workbench/historyOrder')}>
            返回教案列表
          </Button>
          <Button type="primary" className="rounded-full" onClick={() => onEdit ? onEdit() : navigate(`/workbench/instrument?id=${plan.id}`)}>
            继续对话
          </Button>
      </div>
    </div>
  );
};