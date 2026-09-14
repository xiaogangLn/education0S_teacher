// components/SlideThumbnail.tsx
import React from 'react';
import type { Slide } from '../types';

interface SlideThumbnailProps {
  slide: Slide;
  onClick?: (slide: Slide) => void;
}

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ slide, onClick }) => {
  const icons: Record<string, string> = {
    '📄': 'bg-blue-50',
    '📊': 'bg-green-50',
    '📈': 'bg-purple-50',
    '📉': 'bg-yellow-50',
    '📋': 'bg-gray-50',
    '💬': 'bg-pink-50',
    '📝': 'bg-orange-50',
    '🔍': 'bg-cyan-50',
    '✏️': 'bg-red-50',
    '📚': 'bg-indigo-50',
    '✅': 'bg-green-50',
    '💡': 'bg-yellow-50',
    '📖': 'bg-blue-50',
    '🎯': 'bg-purple-50',
  };

  const bgColor = icons[slide.icon] || 'bg-gray-50';

  return (
    <div
      className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-center group"
      onClick={() => onClick?.(slide)}
    >
      <div className={`${bgColor} rounded-xl h-20 flex items-center justify-center text-4xl transition-transform group-hover:scale-105`}>
        {slide.icon}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-700">{slide.title}</div>
      <div className="text-xs text-gray-400">第 {slide.page} 页</div>
    </div>
  );
};