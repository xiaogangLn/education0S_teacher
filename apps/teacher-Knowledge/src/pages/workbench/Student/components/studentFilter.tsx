// components/StudentFilter.tsx

import React from 'react';
import { Button, Input, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import  { type StudentStatus, type FilterOptions } from '../types';

const { Option } = Select;

interface StudentFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onReset: () => void;
}

const StudentFilter: React.FC<StudentFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="flex-shrink-0 flex gap-3 items-center mb-4 px-4">
      <Input
        placeholder="搜索学生姓名、学号..."
        prefix={<SearchOutlined className="text-gray-400" />}
        className="w-[400px]"
        value={filters.keyword || ''}
        onChange={(e) => onFilterChange({ keyword: e.target.value })}
        allowClear
      />
      <Select
        className="w-32"
        value={filters.status || 'all'}
        onChange={(value) =>
          onFilterChange({ status: value as StudentStatus | 'all' })
        }
      >
        <Option value="all">全部状态</Option>
        <Option value="excellent">优秀</Option>
        <Option value="good">良好</Option>
        <Option value="pending">待巩固</Option>
        <Option value="remedial">需补习</Option>
      </Select>

      <Select
        className="w-36"
        value={filters.hasTransfer || 'all'}
        onChange={(value) =>
          onFilterChange({ hasTransfer: value as 'all' | 'has' | 'none' })
        }
      >
        <Option value="all">全部换班</Option>
        <Option value="has">有换班记录</Option>
        <Option value="none">无换班记录</Option>
      </Select>

      <Button type="primary" icon={<SearchOutlined />} onClick={() => onFilterChange({})}>
        筛选
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        重置
      </Button>
    </div>
  );
};

export default StudentFilter;