// components/CoursewarePreview.tsx
import React from 'react';
import { Card, Button } from 'antd';
import type { Slide } from '../types';
import { SlideThumbnail } from './SlideThumbnail';

interface CoursewarePreviewProps {
  slides: Slide[];
  totalPages: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onSlideClick?: (slide: Slide) => void;
}

export const CoursewarePreview: React.FC<CoursewarePreviewProps> = ({
  slides,
  totalPages,
  expanded,
  onToggleExpand,
  onSlideClick,
}) => {
  const hasMore = totalPages > 6;

  return (
    <Card
      size="small"
      className="mb-4"
      title={
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span>📄 课件预览</span>
          <span className="text-sm text-gray-400 font-normal">
            共 {totalPages} 页 · 展示 {expanded ? '全部' : '前 6 页'}
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slides.map((slide) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            onClick={onSlideClick}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <Button
            type="text"
            className="text-blue-500 hover:text-blue-700"
            onClick={onToggleExpand}
          >
            {expanded ? '📥 收起' : '📥 展开全部'}
          </Button>
        </div>
      )}
    </Card>
  );
};