// components/WrongQuestions.tsx
import React from 'react';
import { Tag } from 'antd';
import type { WrongQuestion } from '../types';

interface WrongQuestionsProps {
  questions: WrongQuestion[];
}

const levelMap = {
  critical: { color: 'error', text: '需重点巩固', bg: 'bg-red-50 border-red-400' },
  warning: { color: 'warning', text: '需加强练习', bg: 'bg-yellow-50 border-yellow-400' },
  normal: { color: 'processing', text: '需巩固', bg: 'bg-blue-50 border-blue-400' },
  good: { color: 'success', text: '基本掌握', bg: 'bg-green-50 border-green-400' },
};

export const WrongQuestions: React.FC<WrongQuestionsProps> = ({ questions }) => {
  return (
    <div className="mb-4">
      <div className="font-semibold text-sm mb-2">🔍 错题归因分析</div>
      <div className="grid grid-cols-2 gap-3">
        {questions.map((q, index) => {
          const level = levelMap[q.level] || levelMap.normal;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl border-l-4 ${level.bg}`}
            >
              <div className="font-medium text-sm">{q.name}</div>
              <div className="text-xs text-gray-500">
                错误 {q.errorCount} 次 · 掌握度 {q.masteryRate}%
              </div>
              <Tag color={level.color} className="mt-1 text-xs">
                {level.text}
              </Tag>
            </div>
          );
        })}
      </div>
    </div>
  );
};