import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  onClick: () => void;
  selectedCount: number;
  scopeLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onClick, selectedCount, scopeLabel }) => {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
      onClick={onClick}
    >
      <SearchOutlined className="text-gray-400" />
      <span className="text-sm text-gray-400 flex-1">
        {scopeLabel ? `搜索 ${scopeLabel} 教材...` : '搜索文件、创建者、类型...'}
      </span>
      {selectedCount > 0 && (
        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
          {selectedCount}
        </span>
      )}
      <span className="text-xs text-gray-400">⌘K</span>
    </div>
  );
};