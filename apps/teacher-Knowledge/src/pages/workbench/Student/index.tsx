import React, { useState } from 'react';
import { Result, message } from 'antd';
import type { StudentListProps } from './types';
import { useStudentList } from './hook/useStudentList';
import StudentHeader from './components/studentHeader';
import StudentStats from './components/studentStats';
import StudentFilter from './components/studentFilter';
import StudentTable from './components/studentTable';
import AddStudentModal from './components/AddStudentModal';
import TransferStudentModal from './components/TransferStudentModal';
import { studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { canManageStudents, canSelfAddStudent, isCommercialTenant } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';
import type { Student } from './types';

function csvCell(value: unknown) {
  const text = String(value ?? '');
  const prefixed = ['=', '+', '-', '@'].some((ch) => text.startsWith(ch));
  const safe = prefixed ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

const StudentList: React.FC<StudentListProps> = ({
  initialPageSize = 7,
  initialFilters = {},
  className = '',
}) => {
  const {
    students,
    pagination,
    filters,
    stats,
    loading,
    onStudentDateils,
    onViewPortrait,
    setFilters,
    resetFilters,
    onTableChange,
    handleCancel,
    refresh,
  } = useStudentList({
    initialPageSize,
    initialFilters,
  });
  const [addOpen, setAddOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const currentUser = useAppSelector((state) => state.user.current);
  const canAddStudent = canSelfAddStudent(currentUser);
  const manageStudents = canManageStudents(currentUser);
  const showTransfer = !isCommercialTenant(currentUser);

  const handleExport = async () => {
    try {
      const payload = extractPayload<{ items: any[] }>(
        await studentsService.getList({ page: 1, page_size: 10000 }),
      );
      const rows = payload?.items || [];
      const header = '学号,姓名,班级,掌握度';
      const csv = [
        header,
        ...rows.map((item) =>
          [csvCell(item.student_no), csvCell(item.name), csvCell(item.class_name || ''), csvCell(item.mastery_rate || 0)].join(','),
        ),
      ].join('\n');
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students.csv';
      link.click();
      URL.revokeObjectURL(url);
      message.success('已导出学生名单');
    } catch (error: any) {
      message.error(error?.message || '导出失败');
    }
  };

  if (!manageStudents) {
    return (
      <div className={`flex flex-col h-full items-center justify-center ${className}`}>
        <Result
          status="403"
          title="基础版不含学生管理"
          subTitle="体验期结束后不再开放学生管理。升级 Pro / Turbo 后可管理学生，并启用个性化作业与学生画像更新。"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <StudentHeader onExport={handleExport} onAddStudent={() => setAddOpen(true)} handleCancel={handleCancel} canAddStudent={canAddStudent} />
      <StudentStats stats={stats} showTransferStat={showTransfer} />
      <div className="flex-1 flex flex-col bg-white rounded-2xl py-4 min-h-0">
        <StudentFilter
          filters={filters}
          onFilterChange={setFilters}
          onReset={resetFilters}
          showTransferFilter={showTransfer}
        />
        <StudentTable
          students={students}
          pagination={pagination}
          loading={loading}
          onTableChange={onTableChange}
          onViewPortrait={onViewPortrait}
          onDateils={onStudentDateils}
          onTransfer={showTransfer ? setTransferStudent : undefined}
          showTransfer={showTransfer}
          total={pagination.total}
        />
      </div>
      {canAddStudent ? (
        <AddStudentModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => refresh()}
        />
      ) : null}
      {canAddStudent && showTransfer ? (
        <TransferStudentModal
          open={!!transferStudent}
          student={transferStudent}
          onClose={() => setTransferStudent(null)}
          onSuccess={() => refresh()}
        />
      ) : null}
    </div>
  );
};

export { StudentList };
