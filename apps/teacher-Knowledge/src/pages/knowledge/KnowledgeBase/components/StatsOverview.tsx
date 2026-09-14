import React from 'react';
import type { Stats } from '../types';

interface StatsOverviewProps {
  stats: Stats;
}

function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const limit = stats.storageLimit || 10 * 1024 * 1024 * 1024;
  const used = stats.storageUsed || 0;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const items = [
    { key: 'total', label: '文档', value: stats.total },
    { key: 'myCreated', label: '我创建的', value: stats.myCreated },
    { key: 'favorites', label: '收藏', value: stats.favorites },
    { key: 'pending', label: '待处理', value: stats.pending },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">📊 统计概览</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.key} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <div className="text-xl font-bold text-gray-800">{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400">
          <span>💾 存储使用</span>
          <span>{formatBytes(used)} / {formatBytes(limit)}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
};
