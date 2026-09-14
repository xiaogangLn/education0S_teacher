import React from 'react';
import type { TeacherProfile } from '../types/teacher';

interface AchievementsProps {
  achievements: TeacherProfile['achievements'];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className='mt-4'>
      <div className="text-lg font-semibold text-gray-700 mb-3">🏆 教学成果</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {achievements.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1.5">{item.icon}</div>
            <div className="font-semibold text-[15px] text-gray-700">{item.title}</div>
            <div className="text-sm text-gray-600 mt-0.5">{item.description}</div>
            <div className="text-xs text-gray-400 mt-1.5">{item.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
};