// components/DocumentRow.tsx
import React from 'react';
import { type  Document, PERMISSION_CONFIG, FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '../types';

interface DocumentRowProps {
  document: Document;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onPreview?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  selected,
  onSelect,
  onPreview,
  onEdit,
}) => {
  const permission = PERMISSION_CONFIG[document.permission];
  const fileIcon = FILE_TYPE_ICONS[document.type] || '📄';
  const fileLabel = FILE_TYPE_LABELS[document.type] || '文件';

  const getActionLabel = () => {
    const actions: Record<Document['type'], string> = {
      document: '预览',
      sheet: '预览',
      video: '播放',
      audio: '播放',
      pdf: '预览',
      link: '访问',
    };
    return actions[document.type] || '查看';
  };

  const handleAction = () => {
    onPreview?.(document);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(document.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{fileIcon}</span>
          <span className="font-medium text-gray-800">{document.title}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{fileLabel}</span>
      </td>
      <td className="px-4 py-3 text-gray-600">{document.author}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{document.updatedAt}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${permission.color}`}>
          {permission.icon} {permission.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-blue-500 cursor-pointer hover:text-blue-700"
            onClick={handleAction}
          >
            {getActionLabel()}
          </span>
          <span
            className="text-sm text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() => onEdit?.(document)}
          >
            ✏️
          </span>
        </div>
      </td>
    </tr>
  );
};