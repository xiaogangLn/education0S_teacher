// components/ReportFilter.tsx
import React from 'react';
import { Select, Button, Space } from 'antd';
import type { FilterState } from '../types';

interface ReportFilterProps {
  filter: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onExport?: () => void;
  gradeOptions: string[];
  subjectOptions: string[];
  dimensionOptions: string[];
  loading?: boolean;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  onExport,
  gradeOptions,
  subjectOptions,
  dimensionOptions,
  loading = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
      <Select
        value={filter.grade}
        onChange={(value) => onFilterChange('grade', value)}
        options={gradeOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择年级"
        disabled={loading}
      />
      <Select
        value={filter.subject}
        onChange={(value) => onFilterChange('subject', value)}
        options={subjectOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择学科"
        disabled={loading}
      />
      <Select
        value={filter.dimension}
        onChange={(value) => onFilterChange('dimension', value)}
        options={dimensionOptions.map(opt => ({ label: opt, value: opt }))}
        className="min-w-[140px]"
        placeholder="选择维度"
        disabled={loading}
      />
      <Button
        type="primary"
        className="rounded-full"
        disabled={loading}
      >
        🔍 筛选
      </Button>
      <Button
        onClick={onReset}
        className="rounded-full"
        disabled={loading}
      >
        重置
      </Button>
      {onExport && (
        <Button
          className="rounded-full ml-auto"
          onClick={onExport}
          disabled={loading}
        >
          📥 导出当前报表
        </Button>
      )}
    </div>
  );
};