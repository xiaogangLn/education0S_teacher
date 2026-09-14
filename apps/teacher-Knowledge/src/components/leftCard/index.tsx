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
  onSelectedFiles,
  initialPlannedFiles,
  historyMode = false,
  className = '',
}) => {
  const {
    searchKeyword,
    selectedCategory,
    selectedFileIds,
    tempSelectedIds,
    searchDrawerOpen,
    plannedFiles,
    drawerFiles,
    allChecked,
    indeterminate,
    uploading,
    scopeLabel,
    handleSearch,
    handleSearchChange,
    cancelPendingSearch,
    openSearchDrawer,
    closeSearchDrawer,
    handleCategoryClick,
    handleTempSelectAll,
    handleTempFileCheck,
    handleConfirm,
    handlePlannedFileCheck,
    handleMainSelectAll,
    handleUpload,
    getCategoryCount,
    getSelectedFiles,
  } = useFileSelection(initialPlannedFiles);

  useDeepCompareEffect(() => {
    if (onSelectedFiles) {
      onSelectedFiles(getSelectedFiles());
    }
  }, [selectedFileIds, getSelectedFiles, onSelectedFiles]);

  const onConfirm = () => {
    handleConfirm(onFileSelect);
  };

  const onMainSelectAll = () => {
    handleMainSelectAll(onFileSelect);
  };

  return (
    <div className={`h-full flex flex-col bg-white border-r border-gray-100 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="font-semibold text-base">📁 素材库</span>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <SearchBar onClick={openSearchDrawer} selectedCount={plannedFiles.length} scopeLabel={scopeLabel} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-medium text-gray-600">
            计划使用
            <span className="text-xs text-gray-400 ml-2">({plannedFiles.length} 项)</span>
            {historyMode && plannedFiles.length > 0 && (
              <span className="text-xs text-blue-500 ml-2">本记录已选</span>
            )}
          </span>
          {plannedFiles.length > 0 && (
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
                {plannedFiles.every((file) => selectedFileIds.has(file.id)) ? '取消全选' : '全选'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-2">
          <FileList
            files={plannedFiles}
            selectedIds={selectedFileIds}
            onCheck={handlePlannedFileCheck}
            onFileClick={onFileClick || (() => {})}
            emptyDescription={historyMode ? '该记录未选择素材' : '请搜索选择素材，或从下方上传'}
          />
        </div>
      </div>

      <UploadArea uploading={uploading} onUpload={handleUpload} />

      <SearchDrawer
        open={searchDrawerOpen}
        onClose={closeSearchDrawer}
        onConfirm={onConfirm}
        searchKeyword={searchKeyword}
        onSearchChange={handleSearchChange}
        onSearchPressEnter={handleSearch}
        onCancelPendingSearch={cancelPendingSearch}
        onClearSearch={() => {
          handleSearch('');
        }}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
        getCategoryCount={getCategoryCount}
        currentFiles={drawerFiles}
        tempSelectedIds={tempSelectedIds}
        onTempFileCheck={handleTempFileCheck}
        onFileClick={onFileClick || (() => {})}
        allChecked={allChecked}
        indeterminate={indeterminate}
        onTempSelectAll={handleTempSelectAll}
        scopeLabel={scopeLabel}
      />
    </div>
  );
};

export default LeftPanel;
