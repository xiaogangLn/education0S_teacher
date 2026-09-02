import React from 'react';
import { Drawer, Button, Input, Checkbox } from 'antd';
import { CloseOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import type { FileItem } from '../types';
import { CategoryTabs } from './CategoryTabs';
import { FileList } from './FileList';

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  searchKeyword: string;
  onSearchChange: (value: string) => void;
  onSearchPressEnter: (value: string) => void;
  onClearSearch: () => void;
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
  getCategoryCount: (category: string) => number;
  currentFiles: FileItem[];
  tempSelectedIds: Set<string>;
  onTempFileCheck: (id: string, checked: boolean) => void;
  onFileClick: (file: FileItem) => void;
  allChecked: boolean;
  indeterminate: boolean;
  onTempSelectAll: (checked: boolean) => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  open,
  onClose,
  onConfirm,
  searchKeyword,
  onSearchChange,
  onSearchPressEnter,
  onClearSearch,
  selectedCategory,
  onCategoryClick,
  getCategoryCount,
  currentFiles,
  tempSelectedIds,
  onTempFileCheck,
  onFileClick,
  allChecked,
  indeterminate,
  onTempSelectAll,
}) => {
  return (
    <Drawer
      title={null}
      placement="left"
      open={open}
      onClose={onClose}
      width={'35%'}
      closable={false}
      bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
      className="search-drawer"
      maskClosable={false}
    >
      <div className="flex flex-col h-full">
        {/* 搜索框 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <SearchOutlined className="text-gray-400 text-lg" />
          <Input
            placeholder="搜索文件、创建者、类型..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            onPressEnter={(e) => onSearchPressEnter((e.target as HTMLInputElement).value)}
            className="flex-1 border-0 shadow-none focus:shadow-none text-base"
            autoFocus
            suffix={
              searchKeyword && (
                <CloseOutlined
                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={onClearSearch}
                />
              )
            }
          />
          <Button type="text" onClick={onClose} className="text-gray-400">
            关闭
          </Button>
        </div>

        {/* 横向分类Tab */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryClick={onCategoryClick}
          getCategoryCount={getCategoryCount}
        />

        {/* 文件列表 */}
        <div className="flex-1 overflow-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-gray-50">
            <Checkbox
              checked={allChecked}
              indeterminate={indeterminate}
              onChange={(e) => onTempSelectAll(e.target.checked)}
              className="text-sm"
            >
              <span className="text-xs text-gray-400">全选 ({currentFiles.length})</span>
            </Checkbox>
            <span className="text-xs text-gray-400">
              已选 <span className="text-blue-500 font-medium">{tempSelectedIds.size}</span> 项
            </span>
          </div>
          <FileList
            files={currentFiles}
            selectedIds={tempSelectedIds}
            onCheck={onTempFileCheck}
            onFileClick={onFileClick}
            searchKeyword={searchKeyword}
          />
        </div>

        {/* 底部：已选数量 + 确认按钮 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckOutlined className="text-blue-500" />
            <span className="text-sm text-gray-600">
              已选 <span className="text-blue-500 font-semibold">{tempSelectedIds.size}</span> 个文件
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="rounded-full">
              取消选择
            </Button>
            <Button
              type="primary"
              onClick={onConfirm}
              className="rounded-full"
              disabled={tempSelectedIds.size === 0}
            >
              确认选择 ({tempSelectedIds.size})
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};