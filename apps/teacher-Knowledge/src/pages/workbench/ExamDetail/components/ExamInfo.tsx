// components/ExamInfo.tsx
import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import type { ExamDetail } from '../types';

interface ExamInfoProps {
  exam: ExamDetail;
}

export const ExamInfo: React.FC<ExamInfoProps> = ({ exam }) => {
  const items = [
    { key: 'name', label: '试卷名称', children: exam.name },
    { key: 'total', label: '总分', children: `${exam.totalScore} 分` },
    { key: 'types', label: '题型', children: exam.questionTypes.map(t => `${t.type} ${t.count}题`).join(' + ') },
    { key: 'version', label: '版本', children: `v${exam.version}` },
    { key: 'created', label: '创建时间', children: exam.createdAt },
    { key: 'lesson', label: '关联教案', children: exam.lessonPlanTitle },
    { key: 'status', label: '状态', children: exam.status },
    { key: 'time', label: '预计用时', children: `${exam.estimatedTime} min` },
  ];

  return (
    <Card size="small" className="mb-4 flex-shrink-0" title="📄 试卷信息">
      <Descriptions items={items} column={{ xs: 1, sm: 2, md: 4 }} size="small" />
    </Card>
  );
};