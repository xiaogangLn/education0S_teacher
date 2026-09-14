// components/RecordStats.tsx
import React from 'react';
import { Card } from 'antd';

interface RecordStatsProps {
  total: number;
  graded: number;
  pending: number;
}

export const RecordStats: React.FC<RecordStatsProps> = ({ total, graded, pending }) => {
  const items = [
    { key: 'total', value: total, label: '总记录', color: '#4f46e5' },
    { key: 'graded', value: graded, label: '已批改', color: '#10b981' },
    { key: 'pending', value: pending, label: '待批改', color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {items.map((item) => (
        <Card key={item.key} size="small" className="text-center" style={{ borderLeft: `4px solid ${item.color}` }}>
          <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </Card>
      ))}
    </div>
  );
};