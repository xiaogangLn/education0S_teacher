// components/ReviewFilter.tsx
import React from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterState } from '../types';
import { subjectOptions, classOptions, sortOptions } from '../constants';

interface ReviewFilterProps {
  filter: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onBatch?: () => void;
  loading?: boolean;
}

export const ReviewFilter: React.FC<ReviewFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  onBatch,
  loading = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        placeholder="🔍 搜索教案标题、教师..."
        value={filter.keyword}
        onChange={(e) => onFilterChange('keyword', e.target.value)}
        className="flex-1 min-w-[160px] rounded-full"
        disabled={loading}
        allowClear
      />
      <Select
        value={filter.subject}
        onChange={(value) => onFilterChange('subject', value)}
        options={subjectOptions.map((opt) => ({ label: opt, value: opt }))}
        className="min-w-[120px]"
        disabled={loading}
      />
      <Select
        value={filter.class}
        onChange={(value) => onFilterChange('class', value)}
        options={classOptions.map((opt) => ({ label: opt, value: opt }))}
        className="min-w-[120px]"
        disabled={loading}
      />
      <Select
        value={filter.sortBy}
        onChange={(value) => onFilterChange('sortBy', value)}
        options={sortOptions.map((opt) => ({ label: opt, value: opt }))}
        className="min-w-[120px]"
        disabled={loading}
      />
      <Button type="primary" icon={<SearchOutlined />} className="rounded-full" disabled={loading}>
        筛选
      </Button>
      <Button onClick={onReset} className="rounded-full" disabled={loading}>
        重置
      </Button>
      {onBatch && (
        <Button className="rounded-full ml-auto" disabled={loading}>
          📋 批量操作
        </Button>
      )}
    </div>
  );
};