import React from 'react';
import { Tag, Progress } from 'antd';
import type { TeacherDimension } from '../types/teacher';

const badgeColorMap: Record<string, string> = {
  green: 'success',
  blue: 'processing',
  purple: 'default',
  gray: 'default',
};

interface DimensionCardProps {
  dimension: TeacherDimension;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({ dimension }) => {
  const scoreColor = typeof dimension.score === 'number'
    ? dimension.score >= 4 ? '#10b981' : dimension.score >= 3 ? '#f59e0b' : '#ef4444'
    : '#f59e0b';

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[15px] text-gray-700">{dimension.label}</span>
        <span className="text-xl font-bold" style={{ color: scoreColor }}>
          {dimension.score}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        {dimension.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-0.5">
            <span>{item.label}</span>
            <Tag color={badgeColorMap[item.badge || 'gray']} className="m-0 text-xs">
              {item.value}
            </Tag>
          </div>
        ))}
      </div>
      {dimension.progress !== undefined && (
        <div className="mt-2.5">
          <Progress
            percent={dimension.progress}
            showInfo={false}
            strokeColor="#4f46e5"
            size="small"
          />
        </div>
      )}
    </div>
  );
};