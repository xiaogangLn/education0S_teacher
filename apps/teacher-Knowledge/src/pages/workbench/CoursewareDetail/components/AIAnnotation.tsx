// components/AIAnnotation.tsx
import React from 'react';
import { Card } from 'antd';

interface AIAnnotationProps {
  isAIGenerated: boolean;
  prompt?: string;
}

export const AIAnnotation: React.FC<AIAnnotationProps> = ({
  isAIGenerated,
  prompt,
}) => {
  if (!isAIGenerated) return null;

  return (
    <Card
      size="small"
      className="border border-purple-200 bg-purple-50"
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl">🤖</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-purple-700">AI 生成课件</div>
          <div className="text-sm text-gray-600">
            {prompt || '本课件由 AI 根据教案自动生成'}
          </div>
        </div>
        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
          AI 生成
        </span>
      </div>
    </Card>
  );
};