// components/StudyPlanDayCard.tsx
import React from 'react';
import type { StudyPlanDay } from '../types/studyPlan';
import { StudyPlanTaskItem } from './studyPlanTaskItem';

interface StudyPlanDayCardProps {
  day: StudyPlanDay;
}

const dayStatusConfig = {
  completed: {
    borderColor: 'border-green-500',
    badge: <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ 已完成</span>,
  },
  in_progress: {
    borderColor: 'border-blue-500',
    badge: <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">⏳ 进行中</span>,
  },
  pending: {
    borderColor: 'border-gray-300',
    badge: <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">📌 待开始</span>,
  },
};

export const StudyPlanDayCard: React.FC<StudyPlanDayCardProps> = ({ day }) => {
  const config = dayStatusConfig[day.status];

  return (
    <div className={`bg-gray-50 rounded-xl p-4 mb-3 border-l-4 ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">
          📆 {day.dayOfWeek} · {day.date}
        </span>
        {config.badge}
      </div>
      <div className="space-y-0.5">
        {day.tasks.map((task, index) => (
          <StudyPlanTaskItem key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
};