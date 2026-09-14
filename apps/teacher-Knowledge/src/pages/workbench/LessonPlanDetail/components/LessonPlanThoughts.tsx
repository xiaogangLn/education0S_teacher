// components/LessonPlanThoughts.tsx
import React from 'react';
import { Card, Empty, Tag } from 'antd';
import type { Thought } from '../types';

interface LessonPlanThoughtsProps {
  thoughts: Thought[];
  onEdit?: () => void;
  onViewHistory?: () => void;
  getThoughtTypeColor: (type: Thought['type']) => string;
}

const getTagColor = (type: Thought['type']) => {
  const map = {
    core: 'blue',
    key: 'gold',
    design: 'green',
    personalized: 'purple',
    note: 'default',
  };
  return map[type] || 'default';
};

export const LessonPlanThoughts: React.FC<LessonPlanThoughtsProps> = ({
  thoughts,
  getThoughtTypeColor,
}) => {
  if (!thoughts.length) {
    return (
      <Card size="small">
        <Empty description="暂无对话记录，可返回加工台继续生成" />
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="space-y-3">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            className={`p-4 rounded-xl border-l-4 ${getThoughtTypeColor(thought.type)}`}
          >
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800">{thought.title}</span>
                {thought.tags && thought.tags.length > 0 && (
                  <Tag color={getTagColor(thought.type)}>{thought.tags[0]}</Tag>
                )}
              </div>
              <span className="text-xs text-gray-400">{thought.createdAt}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap leading-relaxed">
              {thought.content}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};