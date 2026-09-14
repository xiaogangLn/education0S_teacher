// components/LessonPlanContent.tsx
import React from 'react';
import { Card, Divider } from 'antd';

interface LessonPlanContentProps {
  content: {
    objectives: string[];
    keyPoints: string[];
    difficulties: string[];
    schedule: string[];
    notes?: string;
  };
}

export const LessonPlanContent: React.FC<LessonPlanContentProps> = ({ content }) => {
  return (
    <Card size="small" className="mb-4" title="📝 教案内容">
      <div className="space-y-3 text-sm leading-relaxed">
        <div>
          <div className="font-semibold text-gray-700">📌 教学目标</div>
          {content.objectives.map((item, i) => (
            <div key={i} className="text-gray-600 ml-4">{i + 1}. {item}</div>
          ))}
        </div>

        <Divider className="my-2" />

        <div>
          <div className="font-semibold text-gray-700">📌 教学重点</div>
          {content.keyPoints.map((item, i) => (
            <div key={i} className="text-gray-600 ml-4">• {item}</div>
          ))}
        </div>

        <Divider className="my-2" />

        <div>
          <div className="font-semibold text-gray-700">📌 教学难点</div>
          {content.difficulties.map((item, i) => (
            <div key={i} className="text-gray-600 ml-4">• {item}</div>
          ))}
        </div>

        <Divider className="my-2" />

        <div>
          <div className="font-semibold text-gray-700">📌 课时安排</div>
          {content.schedule.map((item, i) => (
            <div key={i} className="text-gray-600 ml-4">{item}</div>
          ))}
        </div>

        {content.notes && (
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded mt-2 border border-gray-100">
            {content.notes}
          </div>
        )}
      </div>
    </Card>
  );
};