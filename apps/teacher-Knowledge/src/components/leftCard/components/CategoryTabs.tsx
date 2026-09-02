import React from 'react';
import { categoryConfig } from '../constants';

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
  getCategoryCount: (category: string) => number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onCategoryClick,
  getCategoryCount,
}) => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
      {Object.entries(categoryConfig).map(([key, config]) => (
        <span
          key={key}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-pointer whitespace-nowrap transition-all flex-shrink-0 ${
            selectedCategory === key
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => onCategoryClick(key)}
        >
          {config.label}
          <span className={`text-xs ml-0.5 ${selectedCategory === key ? 'text-blue-200' : 'text-gray-400'}`}>
            ({getCategoryCount(key)})
          </span>
        </span>
      ))}
    </div>
  );
};