// components/FilterBar.tsx
import React from 'react';
import { SearchOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { PERMISSION_CONFIG, PermissionType } from '../types';

interface FilterBarProps {
  isCommercial: boolean;
  keyword: string;
  onKeywordChange: (value: string) => void;
  activePermission: PermissionType | 'all';
  onPermissionChange: (permission: PermissionType | 'all') => void;
  viewMode: 'list' | 'grid';
  onViewModeToggle: () => void;
  getPermissionCount: (permission: PermissionType | 'all') => number;
}

const permissionTabs: Array<{ key: PermissionType | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'school', label: '🏛️ 学校' },
  { key: 'grade', label: '📚 年级' },
  { key: 'class', label: '🏫 班级' },
  { key: 'research', label: '👥 教研组' },
  { key: 'personal', label: '👤 个人' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  isCommercial,
  keyword,
  onKeywordChange,
  activePermission,
  onPermissionChange,
  viewMode,
  onViewModeToggle,
  getPermissionCount,
}) => {
  return (
    <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-full px-4 border border-gray-200 focus-within:border-blue-400 transition-colors">
        <SearchOutlined className="text-gray-400" />
        <input
          type="text"
          placeholder="搜索文档标题、作者、类型..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="flex-1 py-2 bg-transparent border-none outline-none text-sm"
        />
        {keyword && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => onKeywordChange('')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto flex-wrap">
        {!isCommercial && permissionTabs.map(tab => (
          <span
            key={tab.key}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap cursor-default transition-colors ${
              activePermission === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onPermissionChange(tab.key)}
          >
            {tab.label}
            <span className={`text-xs ml-1 ${activePermission === tab.key ? 'text-blue-200' : 'text-gray-400'}`}>
              ({getPermissionCount(tab.key)})
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:bg-gray-100'}`}
          onClick={onViewModeToggle}
        >
          <UnorderedListOutlined />
        </button>
        {/* <button
          className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:bg-gray-100'}`}
          onClick={onViewModeToggle}
        >
          <AppstoreOutlined />
        </button> */}
      </div>
    </div>
  );
};