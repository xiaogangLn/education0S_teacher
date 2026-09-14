// components/GradeStats.tsx
import React from 'react';
import { Card } from 'antd';

interface GradeStatsProps {
  total: number;
  average: number;
  improvement: number;
  uploadedImages: number;
}

export const GradeStats: React.FC<GradeStatsProps> = ({
  total,
  average,
  improvement,
  uploadedImages,
}) => {
  const items = [
    { key: 'total', value: total, label: '总测验', color: '#4f46e5' },
    { key: 'average', value: average, label: '平均分', color: '#10b981' },
    { key: 'improvement', value: `+${improvement}`, label: '进步分数', color: '#f59e0b' },
    { key: 'images', value: uploadedImages, label: '试卷已上传', color: '#8b5cf6' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {items.map((item) => (
        <Card key={item.key} size="small" className="text-center" style={{ borderLeft: `4px solid ${item.color}` }}>
          <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </Card>
      ))}
    </div>
  );
};