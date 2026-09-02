// components/ExportScope.tsx
import React from 'react';
import { Checkbox, Card, Space } from 'antd';
import type { ExportScope as ExportScopeType } from '../types';

interface ExportScopeProps {
  scopes: ExportScopeType[];
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  selectedCount: number;
  totalCount: number;
}

export const ExportScope: React.FC<ExportScopeProps> = ({
  scopes,
  onToggle,
  onToggleAll,
  selectedCount,
  totalCount,
}) => {
  const allChecked = selectedCount === totalCount && totalCount > 0;
  const indeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">📌 导出范围</span>
          <span className="text-sm text-gray-400">
            (已选 {selectedCount}/{totalCount})
          </span>
        </div>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={(e) => onToggleAll(e.target.checked)}
          className="text-sm"
        >
          全选
        </Checkbox>
      </div>
      <div className="space-y-2">
        {scopes.map(scope => (
          <div
            key={scope.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              scope.checked ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Checkbox
              checked={scope.checked}
              onChange={() => onToggle(scope.id)}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{scope.label}</div>
              {scope.description && (
                <div className="text-xs text-gray-400">{scope.description}</div>
              )}
            </div>
            {scope.checked && (
              <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                已选
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};