// index.tsx - 主页面
import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDocumentFilter } from './hooks/useDocumentFilter';
import { useDocumentSelection } from './hooks/useDocumentSelection';
import { useDocumentList } from './hooks/useDocumentList';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { DocumentTable } from './components/DocumentTable';
import { Pagination } from './components/Pagination';
import { mockDocuments, mockStats } from './constants';
import { useNavigate } from 'react-router-dom';

interface AllDocumentsPageProps {
  onDocumentClick?: (doc: any) => void;
  onDocumentEdit?: (doc: any) => void;
}

export const AllDocumentsPage: React.FC<AllDocumentsPageProps> = ({
  onDocumentClick,
  onDocumentEdit,
}) => {
    const navigate = useNavigate();
    // 筛选逻辑
    const {
        filter,
        filteredDocuments,
        updateKeyword,
        updatePermission,
        toggleViewMode,
        getPermissionCount,
    } = useDocumentFilter(mockDocuments);

    // 分页逻辑
    const {
        currentPage,
        totalPages,
        pageSize,
        currentDocuments,
        goToPage,
        totalCount,
    } = useDocumentList(filteredDocuments);

    // 选择逻辑
    const currentIds = currentDocuments.map(d => d.id);
    const {
        selectedIds,
        isAllSelected,
        isIndeterminate,
        toggleSelectAll,
        toggleSelect,
    } = useDocumentSelection(currentIds);

    return (
        <div className="flex flex-col h-full">
            {/* 标题栏 */}
            <div className="lex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                <h1 className="text-2xl font-bold text-gray-800">📂 全部文档</h1>
                <p className="text-sm text-gray-500">
                    学校 · 年级 · 班级 · 教研组 · 个人 · 共 {mockStats.total} 个文档
                </p>
                </div>
                <div className="flex gap-2">
                <Button onClick={() => navigate('/knowledge')} icon={<ArrowLeftOutlined />} className="rounded-full">
                    返回
                </Button>
                <Button type="primary" icon={<PlusOutlined />} className="rounded-full">
                    新建文档
                </Button>
                </div>
            </div>

            {/* 统计卡片 */}
            <StatsCards stats={mockStats} />

            <div className='flex-1 bg-white rounded-2xl py-2 mt-4 min-h-0'>
                {/* 筛选栏 */}
                <FilterBar
                    keyword={filter.keyword}
                    onKeywordChange={updateKeyword}
                    activePermission={filter.permission}
                    onPermissionChange={updatePermission}
                    viewMode={filter.viewMode}
                    onViewModeToggle={toggleViewMode}
                    getPermissionCount={getPermissionCount}
                />

                {/* 文档表格 */}
                <div className="p-2 overflow-y-auto">
                    <DocumentTable
                    documents={currentDocuments}
                    selectedIds={selectedIds}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onPreview={onDocumentClick}
                    onEdit={onDocumentEdit}
                    />

                    {/* 分页 */}
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={goToPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default AllDocumentsPage;