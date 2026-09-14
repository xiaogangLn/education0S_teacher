// components/ExamQuestion.tsx
import React from 'react';
import { Tag } from 'antd';
import type { ExamQuestion as ExamQuestionType } from '../types';

interface ExamQuestionProps {
  question: ExamQuestionType;
  index: number;
  showAnswer?: boolean;
}

export const ExamQuestion: React.FC<ExamQuestionProps> = ({
  question,
  index,
  showAnswer = false,
}) => {
  const typeColors = {
    choice: 'blue',
    fill: 'purple',
    answer: 'orange',
  };

  const typeLabels = {
    choice: '选择题',
    fill: '填空题',
    answer: '解答题',
  };

  const getStatusClass = () => {
    if (question.isCorrect === undefined) return '';
    return question.isCorrect
      ? 'border-l-4 border-green-500 bg-green-50'
      : 'border-l-4 border-red-500 bg-red-50';
  };

  return (
    <div className={`p-3 rounded-lg mb-3 ${getStatusClass()} bg-gray-50`}>
      <div className="flex items-start gap-2">
        <span className="font-semibold text-gray-700 whitespace-nowrap">
          {question.number}.
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-800 whitespace-pre-wrap">{question.content}</span>
            <Tag color={typeColors[question.type]} className="text-xs">
              {typeLabels[question.type]}
            </Tag>
            <Tag className="text-xs">{question.score}分</Tag>
          </div>

          {question.options && (
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
              {question.options.map((opt, idx) => (
                <div key={idx} className="pl-4">{opt}</div>
              ))}
            </div>
          )}

          {showAnswer && question.answer && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">参考答案：</span>
              <span className="text-green-600 font-medium">{question.answer}</span>
            </div>
          )}

          {showAnswer && question.studentAnswer && (
            <div className="mt-1 text-sm">
              <span className="text-gray-500">学生答案：</span>
              <span className={question.isCorrect ? 'text-green-600' : 'text-red-500'}>
                {question.studentAnswer}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};