// components/ExportTimeRange.tsx
import React from 'react';
import type { TimeRange, TimeRangeOption } from '../types';

interface ExportTimeRangeProps {
  options: TimeRangeOption[];
  selectedRange: TimeRange;
  onSelect: (range: TimeRange) => void;
}

export const ExportTimeRange: React.FC<ExportTimeRangeProps> = ({
  options,
  selectedRange,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="font-semibold text-base mb-4">📅 数据时间范围</div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <span
            key={option.id}
            className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all ${
              selectedRange === option.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
};