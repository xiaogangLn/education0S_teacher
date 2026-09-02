// components/PredictionEmptyState.tsx
import React from 'react';

export const PredictionEmptyState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
      <div className="text-5xl mb-3">📊</div>
      <p className="text-sm">点击「开始预测」按钮，AI 将逐步分析数据并生成预测结果</p>
      <p className="text-xs mt-1">预测过程将通过 SSE 流式展示，实时呈现每一步分析</p>
    </div>
  );
};