// components/ExportOptions.tsx
import React from 'react';
import type { ExportOption, ExportFormat } from '../types';

interface ExportOptionsProps {
  options: ExportOption[];
  onExport: (id: string) => void;
  format: ExportFormat;
  exporting: boolean;
  disabled?: boolean;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  options,
  onExport,
  format,
  exporting,
  disabled = false,
}) => {
  const getFormatLabel = (format: ExportFormat) => {
    const labels = {
      excel: '📊 Excel',
      pdf: '📄 PDF',
      csv: '📋 CSV',
      json: '📦 JSON',
    };
    return labels[format] || '导出';
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="font-semibold text-base mb-4">📦 导出选项</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map(option => (
          <div
            key={option.id}
            className={`bg-gray-50 rounded-xl p-4 text-center border-2 transition-all ${
              option.enabled
                ? 'border-transparent hover:border-blue-300 hover:bg-blue-50'
                : 'border-gray-200 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <div className="font-semibold text-sm text-gray-800">{option.title}</div>
            <div className="text-xs text-gray-400 mt-1">{option.description}</div>
            <button
              className={`mt-3 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                option.enabled && !disabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => option.enabled && !disabled && onExport(option.id)}
              disabled={!option.enabled || disabled || exporting}
            >
              {exporting ? '导出中...' : getFormatLabel(format)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};