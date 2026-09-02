import React from 'react';
import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { FileItem } from '../types';
import { fileTypeIconMap, permissionConfig } from '../constants';

interface FileListItemProps {
  file: FileItem;
  checked: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onClick: (file: FileItem) => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({
  file,
  checked,
  onCheck,
  onClick,
}) => {
  const fileType = fileTypeIconMap[file.type] || { icon: null, label: '文件', color: 'text-gray-500' };
  const permission = permissionConfig[file.permission];

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group ${
        checked ? 'bg-blue-50' : ''
      }`}
      onClick={() => onClick(file)}
    >
      <Checkbox
        checked={checked}
        onChange={(e: CheckboxChangeEvent) => {
          e.stopPropagation();
          onCheck(file.id, e.target.checked);
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      />
      
      <div className={`text-lg flex-shrink-0 ${fileType.color}`}>
        {fileType.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
            {fileType.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{file.creator}</span>
          <span>·</span>
          <span>{file.updatedAt}</span>
          {file.size && file.size !== '-' && (
            <>
              <span>·</span>
              <span>{file.size}</span>
            </>
          )}
        </div>
      </div>
      
      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${permission.color}`}>
        {permission.label}
      </span>
    </div>
  );
};