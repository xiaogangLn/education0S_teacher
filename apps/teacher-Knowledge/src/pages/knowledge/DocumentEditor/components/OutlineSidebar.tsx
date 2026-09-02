// components/OutlineSidebar.tsx
import React from 'react';
import type { OutlineItem } from '../types';

interface OutlineSidebarProps {
  items: OutlineItem[];
  onItemClick?: (item: OutlineItem) => void;
  activeId?: string;
}

export const OutlineSidebar: React.FC<OutlineSidebarProps> = ({
  items,
  onItemClick,
  activeId,
}) => {
  if (items.length === 0) {
    return (
      <div className="w-12 bg-white rounded-xl border border-gray-200 p-2 flex flex-col items-center gap-2">
        <div className="w-4 h-1 rounded bg-gray-300"></div>
        <div className="w-4 h-1 rounded bg-gray-200"></div>
        <div className="w-4 h-1 rounded bg-gray-200"></div>
      </div>
    );
  }

  const getIndent = (level: number) => {
    const margins = { 1: 0, 2: 8, 3: 16 };
    return margins[level as 1 | 2 | 3] || 0;
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-white rounded-xl border border-gray-200 p-3 shadow-md z-40 hidden lg:block">
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`h-1.5 rounded transition-all cursor-pointer ${
              item.id === activeId ? 'bg-blue-500 w-6' : 'bg-gray-300 w-4 hover:bg-gray-400'
            }`}
            style={{ marginLeft: getIndent(item.level) }}
            onClick={() => onItemClick?.(item)}
            title={item.text}
          />
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 text-center">
        <span className="text-[10px] text-gray-400">{items.length}节</span>
      </div>
    </div>
  );
};