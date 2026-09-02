// components/StatsCards.tsx
import React from 'react';
import type { StatsData } from '../types';
import { PERMISSION_CONFIG } from '../types';

interface StatsCardsProps {
  stats: StatsData;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const items = [
    { key: 'school', count: stats.school, label: '学校级', desc: '全校可见', config: PERMISSION_CONFIG.school },
    { key: 'grade', count: stats.grade, label: '年级级', desc: '年级可见', config: PERMISSION_CONFIG.grade },
    { key: 'class', count: stats.class, label: '班级级', desc: '班级可见', config: PERMISSION_CONFIG.class },
    { key: 'research', count: stats.research, label: '教研组', desc: '教研组可见', config: PERMISSION_CONFIG.research },
    { key: 'personal', count: stats.personal, label: '个人级', desc: '仅本人可见', config: PERMISSION_CONFIG.personal },
  ];

  return (
    <div className="lex-shrink-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
      {items.map(item => (
        <div
          key={item.key}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-400 transition-all cursor-default"
        >
          <div className="text-2xl font-bold text-gray-800">{item.count}</div>
          <div className="text-sm text-gray-600">{item.config.icon} {item.label}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${item.config.color}`}>
            {item.desc}
          </span>
        </div>
      ))}
    </div>
  );
};