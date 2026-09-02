// index.tsx - 主页面
import React from 'react';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { useDocumentList } from './hooks/useDocumentList';
import { useCategoryFilter } from './hooks/useCategoryFilter';
import { WelcomeBanner } from './components/WelcomeBanner';
import { DocumentList } from './components/DocumentList';
import { CategoryTags } from './components/CategoryTags';

import { StatsOverview } from './components/StatsOverview';
import { TodoReminder } from './components/TodoReminder';
import QuickCreate from './components/QuickCreate';

export const KnowledgeBasePage: React.FC = () => {
  const { documents, categories, stats, todos, loading } = useKnowledgeBase();
  const documentList = useDocumentList(documents);
  const categoryFilter = useCategoryFilter(categories);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        {/* 欢迎横幅 */}
        <WelcomeBanner userName="张老师" className='flex-shrink-0' />
        {/* 快速创建 - 放在显眼位置 */}
        <QuickCreate
            className='mt-4 flex-shrink-0'
            onItemClick={(key) => {
            console.log('创建:', key);
            // 处理创建逻辑
            }}
        />
        {/* 主内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 flex-1 min-h-0 overflow-y-auto">
            {/* 左侧：主要内容 */}
            <div className="lg:col-span-2 space-y-4">
                {/* 文档列表 */}
                <DocumentList
                    documents={documentList.documents}
                    onDocumentClick={documentList.handleDocumentClick}
                    onDocumentEdit={documentList.handleDocumentEdit}
                />

                {/* 分类标签 */}
                <CategoryTags
                    categories={categoryFilter.categories}
                    onCategoryClick={(category) => {
                    categoryFilter.handleCategoryClick(category.id);
                    documentList.handleCategoryFilter(
                        categoryFilter.activeCategory === category.id ? null : category.id
                    );
                    }}
                    activeId={categoryFilter.activeCategory}
                />
            </div>
            {/* 右侧：侧边栏 */}
            <div className="space-y-4">
                {/* 统计概览 */}
                <StatsOverview stats={stats} />

                {/* 待办提醒 */}
                <TodoReminder
                    todos={todos}
                    onTodoClick={(todo) => console.log('点击待办:', todo)}
                />
            </div>
        </div>
    </div>
  );
};

export default KnowledgeBasePage;