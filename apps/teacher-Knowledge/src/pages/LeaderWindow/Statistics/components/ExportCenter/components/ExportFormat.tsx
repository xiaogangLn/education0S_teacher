// components/ExportFormat.tsx
import React from 'react';
import type { ExportFormat as ExportFormatType, ExportFormatOption } from '../types';

interface ExportFormatProps {
  formats: ExportFormatOption[];
  selectedFormat: ExportFormatType;
  onSelect: (format: ExportFormatType) => void;
}

export const ExportFormat: React.FC<ExportFormatProps> = ({
  formats,
  selectedFormat,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="font-semibold text-base mb-4">📋 导出格式</div>
      <div className="flex flex-wrap gap-3">
        {formats.map(format => {
          const isSelected = selectedFormat === format.id;
          const colors: Record<string, string> = {
            excel: 'border-green-200 hover:border-green-400',
            pdf: 'border-red-200 hover:border-red-400',
            csv: 'border-blue-200 hover:border-blue-400',
            json: 'border-purple-200 hover:border-purple-400',
          };
          const selectedColors: Record<string, string> = {
            excel: 'border-green-500 bg-green-50',
            pdf: 'border-red-500 bg-red-50',
            csv: 'border-blue-500 bg-blue-50',
            json: 'border-purple-500 bg-purple-50',
          };

          return (
            <div
              key={format.id}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? selectedColors[format.id] || 'border-blue-500 bg-blue-50'
                  : colors[format.id] || 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelect(format.id)}
            >
              <span className="text-2xl">{format.icon}</span>
              <div>
                <div className="font-medium text-sm">{format.label}</div>
                <div className="text-xs text-gray-400">.{format.extension}</div>
              </div>
              {isSelected && (
                <span className="text-blue-500 text-xs ml-1">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};