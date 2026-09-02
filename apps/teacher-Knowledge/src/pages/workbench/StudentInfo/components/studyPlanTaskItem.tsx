// components/StudyPlanTaskItem.tsx
import React from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { StudyPlanTask } from '../types/studyPlan';

interface StudyPlanTaskItemProps {
  task: StudyPlanTask;
  index: number;
}

const statusConfig = {
  completed: {
    icon: <CheckCircleOutlined className="text-green-500" />,
    badge: <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已完成</span>,
    dotColor: 'bg-green-500',
  },
  in_progress: {
    icon: <LoadingOutlined className="text-blue-500" />,
    badge: <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">进行中</span>,
    dotColor: 'bg-blue-500',
  },
  pending: {
    icon: <ClockCircleOutlined className="text-gray-400" />,
    badge: <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">待开始</span>,
    dotColor: 'bg-gray-300',
  },
};

export const StudyPlanTaskItem: React.FC<StudyPlanTaskItemProps> = ({ task, index }) => {
  const config = statusConfig[task.status];

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dotColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800">{task.title}</span>
          {config.badge}
        </div>
        {task.accuracy && (
          <div className="text-xs text-gray-500 mt-0.5">正确率 {task.accuracy}%</div>
        )}
        {task.progress !== undefined && task.status === 'in_progress' && (
          <div className="mt-1 w-full max-w-[180px]">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{task.progress}%</span>
            </div>
          </div>
        )}
        {task.targetKnowledge && (
          <div className="text-xs text-gray-400 mt-0.5">
            🎯 {task.status === 'completed' ? '针对错题' : task.status === 'in_progress' ? '针对薄弱' : '巩固'}：{task.targetKnowledge}
          </div>
        )}
      </div>
    </div>
  );
};