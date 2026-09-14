// components/LessonPlanTabs.tsx
import React from 'react';

interface TabItem {
  key: string;
  label: string;
}

interface LessonPlanTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const LessonPlanTabs: React.FC<LessonPlanTabsProps> = ({
  tabs,
  activeKey,
  onChange,
}) => {
  return (
    <div className="flex-shrink-0 flex gap-1 border-b border-gray-200 bg-gray-50 rounded-t-xl px-1 pt-1 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`px-5 py-2.5 rounded-t-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-all border-b-2 ${
            activeKey === tab.key
              ? 'bg-white text-blue-600 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100'
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};