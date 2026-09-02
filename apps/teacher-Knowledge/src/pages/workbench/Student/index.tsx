// index.tsx

import React from 'react';

import type { StudentListProps } from './types';
import { useStudentList } from './hook/useStudentList';
import StudentHeader from './components/studentHeader';
import StudentStats from './components/studentStats';
import StudentFilter from './components/studentFilter';
import StudentTable from './components/studentTable';

const StudentList: React.FC<StudentListProps> = ({
  initialPageSize = 7,
  initialFilters = {},
  onEdit,
  onExport,
  onAddStudent,
  className = '',
}) => {
  const { students, pagination, filters, stats, onViewPortrait, setFilters, resetFilters, onTableChange, handleCancel } =
    useStudentList({
      initialPageSize,
      initialFilters,
    });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* ===== 标题栏 ===== */}
      <StudentHeader onExport={onExport} onAddStudent={onAddStudent} handleCancel={handleCancel} />

      {/* ===== 统计栏 ===== */}
      <StudentStats stats={stats} />

      {/* ===== 表格区域 ===== */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl py-4 min-h-0">
        {/* 筛选栏 */}
        <StudentFilter filters={filters} onFilterChange={setFilters} onReset={resetFilters} />

        {/* 表格 */}
        <StudentTable
            students={students}
            pagination={pagination}
            onTableChange={onTableChange}
            onViewPortrait={onViewPortrait}
            onEdit={onEdit} total={0}        
        />
      </div>
    </div>
  );
};

export {
    StudentList
};