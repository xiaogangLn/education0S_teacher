import React from 'react';
import { Empty } from 'antd';
import type { FileItem } from '../types';
import { FileListItem } from './FileListItem';

interface FileListProps {
  files: FileItem[];
  selectedIds: Set<string>;
  onCheck: (id: string, checked: boolean) => void;
  onFileClick: (file: FileItem) => void;
  searchKeyword?: string;
  showSelectAll?: boolean;
  onSelectAll?: (checked: boolean) => void;
  allChecked?: boolean;
  indeterminate?: boolean;
  selectedCount?: number;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedIds,
  onCheck,
  onFileClick,
  searchKeyword = '',
  showSelectAll = false,
  selectedCount = 0,
}) => {
  if (files.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={searchKeyword.trim() ? '未找到匹配文件' : '暂无文件'}
        className="mt-8"
      />
    );
  }

  return (
    <>
      {showSelectAll && (
        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-50">
          <span className="text-xs text-gray-400">
            已选 <span className="text-blue-500 font-medium">{selectedCount}</span> 项
          </span>
        </div>
      )}
      <div className="space-y-2">
        {files.map(file => (
          <FileListItem
            key={file.id}
            file={file}
            checked={selectedIds.has(file.id)}
            onCheck={onCheck}
            onClick={onFileClick}
          />
        ))}
      </div>
    </>
  );
};