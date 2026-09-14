import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { useDocumentList } from './hooks/useDocumentList';
import { useCategoryFilter } from './hooks/useCategoryFilter';
import { WelcomeBanner } from './components/WelcomeBanner';
import { DocumentList } from './components/DocumentList';
import { CategoryTags } from './components/CategoryTags';
import { StatsOverview } from './components/StatsOverview';
import { TodoReminder } from './components/TodoReminder';
import QuickCreate from './components/QuickCreate';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useAppSelector } from '@/store/hooks';
import { getUserDisplayName, getUserSubtitle, isCommercialTenant, isLeaderRole, loadPersistedUser } from '@/utils/currentUser';
import { useOrgContext } from '@/hooks/useOrgContext';
import type { Todo } from './types';

const CREATE_TYPE_MAP: Record<string, string> = {
  document: 'document',
  sheet: 'sheet',
  video: 'pdf',
  audio: 'audio',
  file_j: 'document',
  file_k: 'document',
};

const CREATE_TITLE_MAP: Record<string, string> = {
  document: '未命名文档',
  sheet: '未命名表格',
  video: '未命名试卷',
  audio: '未命名音频',
  file_j: '未命名教案',
  file_k: '未命名课件',
};

const UPLOAD_KEYS = new Set(['video', 'audio', 'file_j', 'file_k']);

export const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const org = useOrgContext();
  const currentUser = useAppSelector((state) => state.user.current);
  const user = loadPersistedUser();
  const commercial = isCommercialTenant(user);
  const canWrite = ['teacher', 'grade_admin', 'is_grade_admin', 'admin'].includes(currentUser?.role || '');
  const { documents, categories, stats, todos, loading, error, refresh } = useKnowledgeBase();
  const documentList = useDocumentList(documents);
  const categoryFilter = useCategoryFilter(categories);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadKeyRef = useRef('video');

  const handleCreate = async (key: string, file?: File) => {
    if (!canWrite) {
      message.warning('当前账号没有创建文件权限');
      return;
    }
    try {
      let content = '';
      if (file && (file.type.startsWith('text/') || /\.(md|txt|csv)$/i.test(file.name))) {
        content = await file.text();
      }
      const response = await knowledgeService.create({
        title: file ? file.name.replace(/\.[^.]+$/, '') : CREATE_TITLE_MAP[key] || '未命名文档',
        type: CREATE_TYPE_MAP[key] || 'document',
        permission: isLeaderRole(currentUser?.role) ? 'school' : 'personal',
        content,
        grade_id: org.gradeId,
        file_size: file?.size,
      });
      const created = extractPayload<{ id: string }>(response);
      await refresh();
      if (file) {
        message.success('已添加到知识库');
        return;
      }
      if (created?.id) {
        navigate(`/knowledge/DocumentEditor?id=${created.id}`);
      }
    } catch (err: any) {
      message.error(err?.message || '创建失败');
    }
  };

  const handleItemClick = (key: string) => {
    if (UPLOAD_KEYS.has(key)) {
      uploadKeyRef.current = key;
      fileInputRef.current?.click();
      return;
    }
    void handleCreate(key);
  };

  const handleTodoClick = (todo: Todo) => {
    navigate(todo.href || '/reviewCenter');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="text-gray-500">{error}</div>
        <Button onClick={() => void refresh()}>重新加载</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void handleCreate(uploadKeyRef.current, file);
        }}
      />
      <WelcomeBanner
        userName={getUserDisplayName(currentUser)}
        subtitle={`知识库 · ${getUserSubtitle(currentUser)}`}
        stats={stats}
        className="flex-shrink-0"
      />
      {canWrite && (
        <QuickCreate className="mt-4 flex-shrink-0" onItemClick={handleItemClick} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 flex-1 min-h-0 overflow-y-auto">
        <div className="lg:col-span-2 space-y-4">
          <DocumentList
            documents={documentList.documents}
            onDocumentClick={documentList.handleDocumentClick}
            onDocumentEdit={documentList.handleDocumentEdit}
          />
          <CategoryTags
            categories={categoryFilter.categories}
            onManage={() => navigate('/knowledge/allDocuments')}
            onCategoryClick={(category) => {
              const key = category.name;
              categoryFilter.handleCategoryClick(key);
              documentList.handleCategoryFilter(
                categoryFilter.activeCategory === key ? null : key,
              );
            }}
            activeId={categoryFilter.activeCategory}
          />
        </div>
        <div className="space-y-4">
          <StatsOverview stats={stats} />
          {!commercial && <TodoReminder todos={todos} onTodoClick={handleTodoClick} />}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
