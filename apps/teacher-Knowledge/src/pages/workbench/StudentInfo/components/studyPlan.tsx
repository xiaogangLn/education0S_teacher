import React from 'react';
import { Spin, Alert, Button } from 'antd';
import { useStudyPlan } from '../hook/useStudyPlan';
import { StudyPlanDayCard } from './studyPlanDayCard';

interface StudyPlanProps {
  studentId?: string;
  className?: string;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({
  studentId,
  className = '',
}) => {
  const {
    loading,
    plan,
    error,
    sendToStudent,
    sendToParent,
    adjustPlan,
    viewFullReport,
  } = useStudyPlan(studentId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spin size="large" tip="加载学习计划..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  if (!plan) {
    return <Alert message="未找到学习计划" type="warning" showIcon />;
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold">📚 个性化学习计划 · {plan.studentName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🟢 进行中</span>
            <span className="text-xs text-gray-400">{plan.grade} · {plan.studentClass}</span>
          </div>
        </div>
      </div>

      {/* 整体进度 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-sm font-medium text-gray-700">📊 整体完成进度</span>
            <span className="text-2xl font-bold text-blue-500 ml-2">{plan.overallProgress}%</span>
          </div>
          <div className="text-sm text-gray-400">
            已完成 {plan.completedCount}/{plan.totalCount} 项 · 预计剩余 {plan.estimatedDaysLeft} 天
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${plan.overallProgress}%` }}
          />
        </div>
      </div>

      {/* 本周计划标题 */}
      <div className="font-semibold text-sm text-gray-700 mb-3">📌 本周计划（基于画像生成）</div>

      {/* 每日计划列表 */}
      <div className="space-y-0">
        {plan.days.map((day) => (
          <StudyPlanDayCard key={day.date} day={day} />
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        <Button
          type="primary"
          onClick={sendToStudent}
          loading={loading}
          className="flex-1 min-w-[100px]"
        >
          📤 发送给学生
        </Button>
        <Button
          onClick={sendToParent}
          loading={loading}
          className="flex-1 min-w-[100px]"
        >
          📤 发送给家长
        </Button>
        <Button
          onClick={adjustPlan}
          loading={loading}
          className="flex-1 min-w-[100px]"
        >
          ✏️ 调整计划
        </Button>
        <Button
          onClick={viewFullReport}
          className="flex-1 min-w-[100px]"
        >
          📊 查看完整报告
        </Button>
      </div>
    </div>
  );
};