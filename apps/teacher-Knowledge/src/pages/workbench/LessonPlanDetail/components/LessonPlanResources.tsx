// components/LessonPlanResources.tsx
import React from 'react';
import { Card, Tag, Space } from 'antd';
import type { Resource } from '../types';

interface LessonPlanResourcesProps {
  resources: Resource[];
}

const typeColors = {
  ppt: 'blue',
  video: 'purple',
  pdf: 'red',
  doc: 'green',
  link: 'cyan',
};

const typeIcons = {
  ppt: '📄',
  video: '📹',
  pdf: '📎',
  doc: '📝',
  link: '🔗',
};

export const LessonPlanResources: React.FC<LessonPlanResourcesProps> = ({ resources }) => {
  return (
    <Card size="small" title="📎 关联资源" extra={<Tag color="default">{resources.length} 个</Tag>}>
      <div className="flex flex-wrap gap-2">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <span>{typeIcons[resource.type] || '📄'}</span>
            <span className="text-sm">{resource.name}</span>
            <Tag color={typeColors[resource.type] || 'default'} className="text-xs">
              {resource.type.toUpperCase()}
            </Tag>
            {resource.size && <span className="text-xs text-gray-400">{resource.size}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
};