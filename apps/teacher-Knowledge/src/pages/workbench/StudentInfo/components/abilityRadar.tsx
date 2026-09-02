// components/AbilityRadar.tsx
import React from 'react';
import { Card } from 'antd';
import type { AbilityRadar as AbilityRadarType } from '../types';

interface AbilityRadarProps {
  abilities: AbilityRadarType[];
}

export const AbilityRadar: React.FC<AbilityRadarProps> = ({ abilities }) => {
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card size="small" className="mb-4">
      <div className="font-semibold text-sm mb-3">🧠 能力雷达</div>
      <div className="space-y-3">
        {abilities.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-bold text-gray-700">{item.value}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getColor(item.value)}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};