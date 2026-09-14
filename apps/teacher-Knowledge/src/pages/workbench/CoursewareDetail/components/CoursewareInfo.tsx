// components/CoursewareInfo.tsx
import React from 'react';
import { Card, Descriptions } from 'antd';
import type { CoursewareDetail } from '../types';

interface CoursewareInfoProps {
  courseware: CoursewareDetail;
}

export const CoursewareInfo: React.FC<CoursewareInfoProps> = ({ courseware }) => {
  const items = [
    { key: 'name', label: '课件名称', children: courseware.name },
    { key: 'pages', label: '页数', children: `${courseware.totalPages} 页` },
    { key: 'size', label: '文件大小', children: courseware.fileSize },
    { key: 'format', label: '格式', children: courseware.format.toUpperCase() },
    { key: 'created', label: '创建时间', children: courseware.createdAt },
    { key: 'lesson', label: '关联教案', children: courseware.lessonPlanTitle },
    { key: 'status', label: '状态', children: courseware.status },
    { key: 'version', label: '版本', children: `v${courseware.version}` },
  ];

  return (
    <Card size="small" className="flex-shrink-0 mb-4" title="📊 课件信息">
      <Descriptions items={items} column={{ xs: 1, sm: 2, md: 4 }} size="small" />
    </Card>
  );
};