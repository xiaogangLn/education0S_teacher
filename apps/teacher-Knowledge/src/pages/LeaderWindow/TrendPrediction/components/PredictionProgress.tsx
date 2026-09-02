// components/PredictionProgress.tsx
import React from 'react';

export const PredictionProgress: React.FC = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-blue-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
      </span>
      <span>SSE 流式传输中... 正在接收预测数据</span>
    </div>
  );
};