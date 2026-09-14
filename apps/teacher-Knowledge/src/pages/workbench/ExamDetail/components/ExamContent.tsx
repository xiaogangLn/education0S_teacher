// components/ExamContent.tsx
import React from 'react';
import { Card, Tabs, Tag } from 'antd';
import type { ExamDetail } from '../types';
import { ExamQuestion } from './ExamQuestion';

interface ExamContentProps {
  exam: ExamDetail;
  showAnswer?: boolean;
}

export const ExamContent: React.FC<ExamContentProps> = ({
  exam,
  showAnswer = false,
}) => {
  const getQuestionsByType = (type: string) => {
    return exam.questions.filter(q => q.type === type);
  };

  const typeMap = {
    choice: { label: '选择题', icon: '📝' },
    fill: { label: '填空题', icon: '✏️' },
    answer: { label: '解答题', icon: '📋' },
  };

  const items = [
    {
      key: 'choice',
      label: (
        <span className="flex items-center gap-1">
          📝 选择题 <span className="text-xs text-gray-400">({getQuestionsByType('choice').length}题)</span>
        </span>
      ),
      children: getQuestionsByType('choice').map((q, idx) => (
        <ExamQuestion key={q.id} question={q} index={idx} showAnswer={showAnswer} />
      )),
    },
    {
      key: 'fill',
      label: (
        <span className="flex items-center gap-1">
          ✏️ 填空题 <span className="text-xs text-gray-400">({getQuestionsByType('fill').length}题)</span>
        </span>
      ),
      children: getQuestionsByType('fill').map((q, idx) => (
        <ExamQuestion key={q.id} question={q} index={idx} showAnswer={showAnswer} />
      )),
    },
    {
      key: 'answer',
      label: (
        <span className="flex items-center gap-1">
          📋 解答题 <span className="text-xs text-gray-400">({getQuestionsByType('answer').length}题)</span>
        </span>
      ),
      children: getQuestionsByType('answer').map((q, idx) => (
        <ExamQuestion key={q.id} question={q} index={idx} showAnswer={showAnswer} />
      )),
    },
  ];

  return (
    <Card
      size="small"
      className="mb-4"
      title={
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span>📝 试卷内容</span>
          <div className="flex gap-2 flex-wrap">
            {exam.questionTypes.map(t => (
              <Tag key={t.type} color="blue" className="text-xs">
                {t.type} {t.count}题 · {t.score}分
              </Tag>
            ))}
          </div>
        </div>
      }
    >
      <Tabs items={items} defaultActiveKey="choice" />
    </Card>
  );
};