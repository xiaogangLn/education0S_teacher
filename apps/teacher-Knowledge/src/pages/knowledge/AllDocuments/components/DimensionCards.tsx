// components/DimensionCards.tsx
import React from 'react';
import type { StatsData } from '../types';
import { PERMISSION_CONFIG } from '../types';

interface DimensionCardsProps {
  stats: StatsData;
}

export const DimensionCards: React.FC<DimensionCardsProps> = ({ stats }) => {
  const items = [
    { key: 'school', count: stats.school, label: '学校', config: PERMISSION_CONFIG.school },
    { key: 'grade', count: stats.grade, label: '年级', config: PERMISSION_CONFIG.grade },
    { key: 'class', count: stats.class, label: '班级', config: PERMISSION_CONFIG.class },
    { key: 'research', count: stats.research, label: '教研组', config: PERMISSION_CONFIG.research },
    { key: 'personal', count: stats.personal, label: '个人', config: PERMISSION_CONFIG.personal },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:hidden mt-4">
      {items.map(item => (
        <div
          key={item.key}
          className="bg-white rounded-xl p-3 text-center border border-gray-100"
        >
          <div className="text-xl font-bold text-gray-800">{item.count}</div>
          <div className="text-xs text-gray-500">{item.config.icon} {item.label}</div>
        </div>
      ))}
    </div>
  );
};