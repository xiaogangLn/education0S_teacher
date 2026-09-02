// components/CategoryTags.tsx
import React from 'react';
import type { Category } from '../types';

interface CategoryTagsProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
  activeId?: string | null;
}

export const CategoryTags: React.FC<CategoryTagsProps> = ({
  categories,
  onCategoryClick,
  activeId,
}) => {
  const categoryColors = [
    'text-blue-600',
    'text-green-600',
    'text-purple-600',
    'text-red-600',
    'text-yellow-600',
    'text-pink-600',
    'text-indigo-600',
    'text-orange-600',
    'text-teal-600',
    'text-rose-600',
    'text-cyan-600',
    'text-gray-600',
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">🏷️ 快速分类</h3>
        <span className="text-sm text-blue-500 cursor-default">管理 →</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <span
            key={category.id}
            className={`px-3 py-1 rounded-full text-sm cursor-default transition-colors ${
              activeId === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onCategoryClick?.(category)}
          >
            {category.name}
            <span className={`ml-1 text-xs ${activeId === category.id ? 'text-blue-200' : 'text-gray-400'}`}>
              {category.count}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};