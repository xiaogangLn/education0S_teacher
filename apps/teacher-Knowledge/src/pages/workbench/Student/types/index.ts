// types/index.ts

import type { TablePaginationConfig } from "antd";

/** 学生状态 */
export type StudentStatus = 'excellent' | 'good' | 'pending' | 'remedial';

/** 换班记录 */
export interface TransferRecord {
  fromClass: string;
  toClass: string;
  date: string;
}

/** 学生数据 */
export interface Student {
  id: string;
  name: string;
  studentNo: string;
  currentClass: string;
  avatarColor?: string;
  mastery: number; // 0-100
  status: StudentStatus;
  transferRecords: TransferRecord[];
}

/** 筛选条件 */
export interface FilterOptions {
  classId?: string;
  status?: StudentStatus | 'all';
  hasTransfer?: 'all' | 'has' | 'none';
  keyword?: string;
}

/** 统计数据 */
export interface StudentStats {
    total: number;
    avgMastery: number;
    excellent: number;
    pending: number;
    hasTransfer: number;
}

/** useStudentList Hook 参数 */
export interface UseStudentListOptions {
  initialPageSize?: number;
  initialFilters?: Partial<FilterOptions>;
}

/** useStudentList Hook 返回值 */
export interface UseStudentListReturn {
    students: Student[];
    total: number;
    pagination: { current: number; pageSize: number; total: number };
    filters: FilterOptions;
    stats: StudentStats;  // 👈 添加这一行
    setFilters: (filters: Partial<FilterOptions>) => void;
    resetFilters: () => void;
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    onTableChange: (pagination: TablePaginationConfig) => void;
    handleCancel: () => void;
    onViewPortrait: () => void;
}

/** 组件 Props */
export interface StudentListProps {
  data?: Student[];
  initialPageSize?: number;
  initialFilters?: Partial<FilterOptions>;
  onViewPortrait?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onExport?: () => void;
  onAddStudent?: () => void;
  className?: string;
}