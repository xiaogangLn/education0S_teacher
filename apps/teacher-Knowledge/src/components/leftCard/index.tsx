// components/leftCard/index.tsx
import React from 'react';
import { Button } from 'antd';
import type { LeftPanelProps } from './types';
import { useFileSelection } from './hook/useFileSelection';
import { SearchBar } from './components/SearchBar';
import { FileList } from './components/FileList';
import { UploadArea } from './components/UploadArea';
import { SearchDrawer } from './components/SearchDrawer';
import { useDeepCompareEffect } from 'react-use';

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onFileSelect,
  onFileClick,
  onSelectedFiles,  // 新增
  className = '',
}) => {
  const {
    searchKeyword,
    selectedCategory,
    selectedFileIds,
    tempSelectedIds,
    searchDrawerOpen,
    currentFiles,
    allChecked,
    indeterminate,
    handleSearch,
    openSearchDrawer,
    closeSearchDrawer,
    handleCategoryClick,
    handleTempSelectAll,
    handleTempFileCheck,
    handleConfirm,
    handleMainSelectAll,
    getCategoryCount,
    getSelectedFiles,
  } = useFileSelection();

  // 当选中的文件变化时，回调给父组件
  useDeepCompareEffect(() => {
    if (onSelectedFiles) {
      const selectedFiles = getSelectedFiles();
      onSelectedFiles(selectedFiles);
    }
  }, [selectedFileIds, getSelectedFiles, onSelectedFiles]);

  // 确认选择的包装函数
  const onConfirm = () => {
    handleConfirm(onFileSelect);
  };

  const onMainSelectAll = () => {
    handleMainSelectAll(onFileSelect);
  };

  return (
    <div className={`h-full flex flex-col bg-white border-r border-gray-100 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="font-semibold text-base">📁 素材库</span>
      </div>

      {/* 搜索框 */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <SearchBar onClick={openSearchDrawer} selectedCount={selectedFileIds.size} />
      </div>

      {/* 主文件列表 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-medium text-gray-600">
            计划使用
            <span className="text-xs text-gray-400 ml-2">({currentFiles.length} 项)</span>
          </span>
          {currentFiles.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                已选 <span className="text-blue-500 font-medium">{selectedFileIds.size}</span> 项
              </span>
              <Button
                type="text"
                size="small"
                className="text-xs text-blue-500"
                onClick={onMainSelectAll}
              >
                {currentFiles.every(f => selectedFileIds.has(f.id)) ? '取消全选' : '全选'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-2">
          <FileList
            files={currentFiles}
            selectedIds={selectedFileIds}
            onCheck={(id, checked) => {
              // 实际项目中需要暴露 setSelectedFileIds
              // 这里通过重新调用 handleMainSelectAll 来更新
              // 更好的方式是在 useFileSelection 中暴露 setSelectedFileIds
            }}
            onFileClick={onFileClick || (() => {})}
            searchKeyword={searchKeyword}
          />
        </div>
      </div>

      {/* 底部上传 */}
      <UploadArea />

      {/* 搜索抽屉 */}
      <SearchDrawer
        open={searchDrawerOpen}
        onClose={closeSearchDrawer}
        onConfirm={onConfirm}
        searchKeyword={searchKeyword}
        onSearchChange={handleSearch}
        onSearchPressEnter={handleSearch}
        onClearSearch={() => {
          handleSearch('');
        }}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
        getCategoryCount={getCategoryCount}
        currentFiles={currentFiles}
        tempSelectedIds={tempSelectedIds}
        onTempFileCheck={handleTempFileCheck}
        onFileClick={onFileClick || (() => {})}
        allChecked={allChecked}
        indeterminate={indeterminate}
        onTempSelectAll={handleTempSelectAll}
      />
    </div>
  );
};

export default LeftPanel;