// components/ExamStatus.tsx
import React from 'react';
import { Card } from 'antd';
import type { ExamDetail } from '../types';

interface ExamStatusProps {
  exam: ExamDetail;
}

export const ExamStatus: React.FC<ExamStatusProps> = ({ exam }) => {
  const statusMap = {
    draft: {
      icon: '📝',
      title: '草稿',
      desc: '试卷正在编辑中，尚未提交审核',
      color: 'border-gray-300 bg-gray-50',
    },
    reviewing: {
      icon: '⏳',
      title: '待审核',
      desc: '试卷已提交，等待年级组长审核',
      color: 'border-yellow-300 bg-yellow-50',
    },
    published: {
      icon: '✅',
      title: '已发布',
      desc: '试卷已审核通过，可用于教学',
      color: 'border-green-300 bg-green-50',
    },
    archived: {
      icon: '📦',
      title: '已归档',
      desc: '试卷已归档，仅可查看',
      color: 'border-gray-300 bg-gray-50',
    },
  };

  const status = statusMap[exam.status] || statusMap.draft;

  return (
    <Card
      size="small"
      className={`border-2 ${status.color} mb-4 flex-shrink-0`}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl">{status.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{status.title}</div>
          <div className="text-sm text-gray-600">{status.desc}</div>
        </div>
        <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200">
          {exam.status}
        </span>
      </div>
    </Card>
  );
};