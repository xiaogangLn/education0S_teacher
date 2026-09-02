// components/DocumentTable.tsx
import React from 'react';
import type { Document } from '../types';
import { DocumentRow } from './DocumentRow';

interface DocumentTableProps {
  documents: Document[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedIds,
  onSelect,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
  onPreview,
  onEdit,
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📭</div>
        <div className="text-sm">暂无匹配的文档</div>
        <div className="text-xs mt-1">尝试调整搜索条件或筛选维度</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-gray-500 font-medium text-xs">文档名称</th>
            <th className="px-4 py-3 text-left text-gray-500 font-medium text-xs">类型</th>
            <th className="px-4 py-3 text-left text-gray-500 font-medium text-xs">作者</th>
            <th className="px-4 py-3 text-left text-gray-500 font-medium text-xs">更新时间</th>
            <th className="px-4 py-3 text-left text-gray-500 font-medium text-xs">归属</th>
            <th className="px-4 py-3 text-center text-gray-500 font-medium text-xs">操作</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              document={doc}
              selected={selectedIds.has(doc.id)}
              onSelect={onSelect}
              onPreview={onPreview}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};