// index.tsx - 主页面
import React from 'react';
import { Spin, Alert, Empty } from 'antd';
import { useLessonPlanDetail } from './hooks/useLessonPlanDetail';
import { LessonPlanHeader } from './components/LessonPlanHeader';
import { LessonPlanTabs } from './components/LessonPlanTabs';
import { LessonPlanInfo } from './components/LessonPlanInfo';
import { LessonPlanContent } from './components/LessonPlanContent';
import { LessonPlanResources } from './components/LessonPlanResources';
import { LessonPlanStats } from './components/LessonPlanStats';
import { LessonPlanPreview } from './components/LessonPlanPreview';
import { LessonPlanThoughts } from './components/LessonPlanThoughts';
import { useSearchParams } from 'react-router-dom';

interface LessonPlanDetailPageProps {
  planId?: string;
}

export const LessonPlanDetailPage: React.FC<LessonPlanDetailPageProps> = ({
  planId: planIdProp,
}) => {
  const [searchParams] = useSearchParams();
  const planId = planIdProp || searchParams.get('id') || '';
  const {
    loading,
    generating,
    plan,
    assignment,
    error,
    generateError,
    activeTab,
    switchTab,
    generateAssignments,
    getThoughtTypeColor,
    tabs,
  } = useLessonPlanDetail(planId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载教案详情..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  if (!plan) {
    return <Empty description="未找到教案" />;
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* 页面头部 */}
      <LessonPlanHeader
        plan={plan}
      />

      {/* Tab 切换 */}
      <LessonPlanTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => switchTab(key as 'detail' | 'plan' | 'thoughts')}
      />

      {/* Tab 内容 */}
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {/* 教案详情 */}
        {activeTab === 'detail' && (
          <div className="space-y-4">
            <LessonPlanInfo plan={plan} />
            <LessonPlanContent content={plan.content} />
            <LessonPlanResources resources={plan.resources} />
          </div>
        )}

        {/* 作业计划 */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <LessonPlanStats stats={plan.stats} />
            <LessonPlanPreview
              title={plan.title}
              className={plan.className || assignment?.class_name}
              published={plan.status === 'published'}
              generating={generating}
              generateError={generateError}
              assignment={assignment}
              onGenerate={generateAssignments}
            />
          </div>
        )}

        {/* 个人思路 */}
        {activeTab === 'thoughts' && (
          <LessonPlanThoughts
            thoughts={plan.thoughts}
            getThoughtTypeColor={getThoughtTypeColor}
          />
        )}
      </div>

      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        EducationOS V8.0 · 教案详情 · 版本 v{plan.version}
      </div>
    </div>
  );
};

export default LessonPlanDetailPage;