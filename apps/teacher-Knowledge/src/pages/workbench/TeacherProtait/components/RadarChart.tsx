import React from 'react';
import { Progress } from 'antd';
import type { TeacherProfile } from '../types/teacher';

interface RadarChartProps {
  data: TeacherProfile['radar'];
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <span className="font-semibold text-[15px] text-gray-700">📡 教学能力雷达</span>
        <span className="text-xs text-gray-400">基于多维度数据评估</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="text-sm font-medium text-gray-600">{item.label}</div>
            <Progress
              percent={item.value}
              strokeColor={item.color}
              size="small"
              className="mt-1"
            />
            <div className="text-xs text-gray-400 mt-0.5">{item.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};