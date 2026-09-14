// components/LessonPlanInfo.tsx
import React from 'react';
import { Card, Descriptions } from 'antd';

interface LessonPlanInfoProps {
  plan: {
    subject: string;
    grade: string;
    className: string;
    课时: number;
    createdAt: string;
    updatedAt: string;
  };
}

export const LessonPlanInfo: React.FC<LessonPlanInfoProps> = ({ plan }) => {
  const items = [
    { key: 'subject', label: '学科', children: plan.subject },
    { key: 'grade', label: '年级', children: plan.grade },
    { key: 'class', label: '班级', children: plan.className },
    { key: 'hours', label: '课时', children: `${plan.课时} 课时` },
    { key: 'created', label: '创建时间', children: plan.createdAt },
    { key: 'updated', label: '最后更新', children: plan.updatedAt },
  ];

  return (
    <Card size="small" className="mb-4">
      <Descriptions items={items} column={{ xs: 1, sm: 2, md: 3 }} size="small" />
    </Card>
  );
};