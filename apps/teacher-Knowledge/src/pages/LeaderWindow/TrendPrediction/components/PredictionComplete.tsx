// components/PredictionComplete.tsx
import React from 'react';

interface PredictionCompleteProps {
  stepCount: number;
  onViewReport: () => void;
  onExport: () => void;
}

export const PredictionComplete: React.FC<PredictionCompleteProps> = ({
  stepCount,
  onViewReport,
  onExport,
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center text-green-700">
      <span className="font-medium">✅ 预测完成！</span>
      <span className="text-sm ml-2">
        共 {stepCount} 个分析步骤，预测准确度 87%
      </span>
      <div className="flex justify-center gap-3 mt-3">
        <button
          className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
          onClick={onViewReport}
        >
          📈 查看完整报告
        </button>
        <button
          className="px-4 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-gray-50"
          onClick={onExport}
        >
          📊 导出数据
        </button>
      </div>
    </div>
  );
};