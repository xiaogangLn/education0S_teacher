// components/FilterBar.tsx
import React from 'react';
import { Select, Button, Space } from 'antd';
import type { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  gradeOptions: string[];
  subjectOptions: string[];
  dimensionOptions: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onReset,
  gradeOptions,
  subjectOptions,
  dimensionOptions,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4 flex flex-wrap items-center gap-3">
      <Select
        value={filter.grade}
        onChange={(value) => onFilterChange('grade', value)}
        options={gradeOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择年级"
      />
      <Select
        value={filter.subject}
        onChange={(value) => onFilterChange('subject', value)}
        options={subjectOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择学科"
      />
      <Select
        value={filter.dimension}
        onChange={(value) => onFilterChange('dimension', value)}
        options={dimensionOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择维度"
      />
      <Button type="primary" className="rounded-full">🔍 筛选</Button>
      <Button onClick={onReset} className="rounded-full">重置</Button>
      <Button className="rounded-full ml-auto">📥 导出当前报表</Button>
    </div>
  );
};