import React from 'react';
import type { Category } from '../types';

interface CategoryTagsProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
  onManage?: () => void;
  activeId?: string | null;
}

export const CategoryTags: React.FC<CategoryTagsProps> = ({
  categories,
  onCategoryClick,
  onManage,
  activeId,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">🏷️ 快速分类</h3>
        <span className="text-sm text-blue-500 cursor-pointer" onClick={onManage}>管理 →</span>
      </div>
      {categories.length === 0 ? (
        <div className="text-sm text-gray-400 py-4 text-center">暂无分类，创建文档后会按学科汇总</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeId === category.id || activeId === category.name;
            return (
              <span
                key={category.id}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  active
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => onCategoryClick?.(category)}
              >
                {category.name}
                <span className={`ml-1 text-xs ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                  {category.count}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
