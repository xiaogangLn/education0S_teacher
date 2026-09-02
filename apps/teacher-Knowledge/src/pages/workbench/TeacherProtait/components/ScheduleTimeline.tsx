import React from 'react';
import { Tag } from 'antd';
import type { TeacherProfile } from '../types/teacher';

interface ScheduleTimelineProps {
  schedule: TeacherProfile['schedule'];
  todayClass?: string;
  timeline: TeacherProfile['timeline'];
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  schedule,
  todayClass,
  timeline,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* 课程表 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-[15px] text-gray-700">📅 本周课程表</span>
          <Tag className="text-xs">2026-09-01 ~ 2026-09-07</Tag>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {schedule.map((day, idx) => (
            <div
              key={idx}
              className={`
                text-center py-2 px-1 rounded-lg text-xs
                ${day.isToday ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-gray-50'}
                ${day.periods === 0 ? 'text-gray-400' : ''}
              `}
            >
              <div className="font-medium text-gray-700 text-[13px]">{day.day}</div>
              <div className="text-gray-500 text-[11px] mt-0.5">
                {day.periods > 0 ? `${day.periods}节` : '—'}
              </div>
            </div>
          ))}
        </div>
        {todayClass && (
          <div className="mt-3 p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
            <Tag color="blue" className="text-xs">📌 今日课程</Tag>
            <span className="text-sm text-gray-700 ml-1.5">{todayClass}</span>
          </div>
        )}
      </div>

      {/* 近期动态 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-[15px] text-gray-700">📋 近期动态</span>
          <Tag className="text-xs">最新 3 条</Tag>
        </div>
        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-xs text-gray-400 min-w-[80px] pt-0.5">{item.date}</div>
              <div>
                <div className="font-medium text-sm text-indigo-600">{item.title}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};