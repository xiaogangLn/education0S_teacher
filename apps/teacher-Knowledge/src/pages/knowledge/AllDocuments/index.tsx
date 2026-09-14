// index.tsx - 主页面
import React from 'react';
import { Button, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDocumentFilter } from './hooks/useDocumentFilter';
import { useDocumentSelection } from './hooks/useDocumentSelection';
import { useDocumentList } from './hooks/useDocumentList';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { DocumentTable } from './components/DocumentTable';
import { Pagination } from './components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useAllDocuments } from './hooks/useAllDocuments';
import { knowledgeService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useAppSelector } from '@/store/hooks';
import { isLeaderRole } from '@/utils/currentUser';

interface AllDocumentsPageProps {
  onDocumentClick?: (doc: any) => void;
  onDocumentEdit?: (doc: any) => void;
}

export const AllDocumentsPage: React.FC<AllDocumentsPageProps> = ({
  onDocumentClick,
  onDocumentEdit,
}) => {
    const navigate = useNavigate();
    const currentUser = useAppSelector((state) => state.user.current);
    const canWrite = ['teacher', 'grade_admin', 'is_grade_admin', 'admin'].includes(currentUser?.role || '');
    const { documents, stats, loading, commercial } = useAllDocuments();

    const {
        filter,
        filteredDocuments,
        updateKeyword,
        updatePermission,
        toggleViewMode,
        getPermissionCount,
    } = useDocumentFilter(documents);

    const {
        currentPage,
        totalPages,
        pageSize,
        currentDocuments,
        goToPage,
        totalCount,
    } = useDocumentList(filteredDocuments);

    const currentIds = currentDocuments.map(d => d.id);
    const {
        selectedIds,
        isAllSelected,
        isIndeterminate,
        toggleSelectAll,
        toggleSelect,
    } = useDocumentSelection(currentIds);

    const openDoc = (doc: any) => {
      if (onDocumentClick) onDocumentClick(doc);
      else navigate(`/knowledge/DocumentEditor?id=${doc.id}`);
    };

    const editDoc = (doc: any) => {
      if (onDocumentEdit) onDocumentEdit(doc);
      else navigate(`/knowledge/DocumentEditor?id=${doc.id}`);
    };

    const handleCreate = async () => {
      if (!canWrite) {
        message.warning('当前账号没有创建文件权限');
        return;
      }
      try {
        const response = await knowledgeService.create({
          title: '未命名文档',
          type: 'document',
          permission: isLeaderRole(currentUser?.role) ? 'school' : 'personal',
          content: '',
        });
        const created = extractPayload<{ id: string }>(response);
        if (created?.id) navigate(`/knowledge/DocumentEditor?id=${created.id}`);
      } catch (error: any) {
        message.error(error?.message || '创建失败');
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="lex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                <h1 className="text-2xl font-bold text-gray-800">📂 全部文档</h1>
                {commercial? (
                  <p className="text-sm text-gray-500">当前知识库共 {stats.total} 个文档</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    学校 · 年级 · 班级 · 教研组 · 个人 · 共 {stats.total} 个文档
                </p>
                )}
                </div>
                <div className="flex gap-2">
                <Button onClick={() => navigate('/knowledge')} icon={<ArrowLeftOutlined />} className="rounded-full">
                    返回
                </Button>
                {canWrite && (
                  <Button type="primary" icon={<PlusOutlined />} className="rounded-full" onClick={() => void handleCreate()}>
                    新建文档
                  </Button>
                )}
                </div>
            </div>

            {!commercial && <StatsCards stats={stats} />}

            <div className='flex-1 bg-white rounded-2xl py-2 mt-4 min-h-0'>
                <FilterBar
                    isCommercial={commercial}
                    keyword={filter.keyword}
                    onKeywordChange={updateKeyword}
                    activePermission={filter.permission}
                    onPermissionChange={updatePermission}
                    viewMode={filter.viewMode}
                    onViewModeToggle={toggleViewMode}
                    getPermissionCount={getPermissionCount}
                />

                <div className="p-2 overflow-y-auto">
                    <DocumentTable
                    documents={currentDocuments}
                    selectedIds={selectedIds}
                    onSelect={toggleSelect}
                    onSelectAll={toggleSelectAll}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onPreview={openDoc}
                    onEdit={editDoc}
                    />

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
