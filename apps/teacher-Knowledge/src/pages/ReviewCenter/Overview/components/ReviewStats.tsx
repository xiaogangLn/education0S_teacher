// components/ReviewStats.tsx
import React from 'react';
import type { ReviewStats as ReviewStatsType } from '../types';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  loading?: boolean;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ stats, loading = false }) => {
  const items = [
    { key: 'pending', value: stats.pending, label: '⏳ 待审核', color: 'text-yellow-500' },
    { key: 'approved', value: stats.approved, label: '✅ 已通过', color: 'text-green-500' },
    { key: 'rejected', value: stats.rejected, label: '📝 已退回', color: 'text-red-500' },
    { key: 'passRate', value: `${stats.passRate}%`, label: '📈 通过率', color: 'text-blue-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3 my-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-8 w-16 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-20 bg-gray-200 rounded mx-auto mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {items.map((item) => (
        <div key={item.key} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-sm text-gray-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
};