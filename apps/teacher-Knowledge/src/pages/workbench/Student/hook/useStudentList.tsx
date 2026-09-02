// hooks/useStudentList.ts

import { useState, useMemo, useCallback } from 'react';
import type {
  Student,
  FilterOptions,
  UseStudentListOptions,
  UseStudentListReturn,
} from '../types';
import type { TablePaginationConfig } from 'antd';
import { useNavigate } from 'react-router-dom';

/** 模拟数据（可移至独立文件） */
const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: '张三',
    studentNo: '001',
    currentClass: '九年级1班',
    avatarColor: '#4f46e5',
    mastery: 78,
    status: 'good',
    transferRecords: [
      { fromClass: '九年级2班', toClass: '九年级1班', date: '2026-08-15' },
      { fromClass: '八年级3班', toClass: '九年级2班', date: '2026-03-01' },
    ],
  },
  {
    id: '2',
    name: '李四',
    studentNo: '002',
    currentClass: '九年级1班',
    avatarColor: '#f59e0b',
    mastery: 45,
    status: 'pending',
    transferRecords: [],
  },
  {
    id: '3',
    name: '王五',
    studentNo: '003',
    currentClass: '九年级1班',
    avatarColor: '#8b5cf6',
    mastery: 92,
    status: 'excellent',
    transferRecords: [
      { fromClass: '八年级3班', toClass: '九年级1班', date: '2026-07-01' },
    ],
  },
  {
    id: '4',
    name: '赵六',
    studentNo: '004',
    currentClass: '九年级1班',
    avatarColor: '#ef4444',
    mastery: 32,
    status: 'remedial',
    transferRecords: [
      { fromClass: '九年级2班', toClass: '九年级1班', date: '2026-08-20' },
      { fromClass: '八年级3班', toClass: '九年级2班', date: '2026-06-15' },
      { fromClass: '八年级1班', toClass: '八年级3班', date: '2026-03-01' },
    ],
  },
  {
    id: '5',
    name: '孙七',
    studentNo: '005',
    currentClass: '九年级1班',
    avatarColor: '#10b981',
    mastery: 58,
    status: 'pending',
    transferRecords: [],
  },
  {
    id: '6',
    name: '周八',
    studentNo: '006',
    currentClass: '九年级1班',
    avatarColor: '#3b82f6',
    mastery: 84,
    status: 'good',
    transferRecords: [
      { fromClass: '八年级1班', toClass: '九年级1班', date: '2026-08-01' },
    ],
  },
  {
    id: '7',
    name: '吴九',
    studentNo: '007',
    currentClass: '九年级1班',
    avatarColor: '#ec4899',
    mastery: 38,
    status: 'remedial',
    transferRecords: [],
  },
  {
    id: '8',
    name: '郑十',
    studentNo: '008',
    currentClass: '九年级1班',
    avatarColor: '#14b8a6',
    mastery: 88,
    status: 'excellent',
    transferRecords: [],
  },
  {
    id: '9',
    name: '冯十一',
    studentNo: '009',
    currentClass: '九年级1班',
    avatarColor: '#f472b6',
    mastery: 52,
    status: 'pending',
    transferRecords: [
      { fromClass: '八年级2班', toClass: '九年级1班', date: '2026-08-10' },
    ],
  },
  {
    id: '10',
    name: '陈十二',
    studentNo: '010',
    currentClass: '九年级1班',
    avatarColor: '#a78bfa',
    mastery: 68,
    status: 'good',
    transferRecords: [],
  },
];

export function useStudentList(
  options: UseStudentListOptions = {}
): UseStudentListReturn {
    const navigate = useNavigate();
    const { initialPageSize = 7, initialFilters = {} } = options;

    const [filters, setFiltersState] = useState<FilterOptions>({
        classId: 'all',
        status: 'all',
        hasTransfer: 'all',
        keyword: '',
        ...initialFilters,
    });
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    // 筛选逻辑
    const filteredStudents = useMemo(() => {
        let result = MOCK_STUDENTS;

        if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        result = result.filter(
            (s) =>
            s.name.includes(keyword) ||
            s.studentNo.includes(keyword) ||
            s.currentClass.includes(keyword)
        );
        }

        if (filters.classId && filters.classId !== 'all') {
        result = result.filter((s) => s.currentClass === filters.classId);
        }

        if (filters.status && filters.status !== 'all') {
        result = result.filter((s) => s.status === filters.status);
        }

        if (filters.hasTransfer === 'has') {
        result = result.filter((s) => s.transferRecords.length > 0);
        } else if (filters.hasTransfer === 'none') {
        result = result.filter((s) => s.transferRecords.length === 0);
        }

        return result;
    }, [filters]);

    const total = filteredStudents.length;

    // 分页数据
    const paginatedStudents = useMemo(() => {
        const start = (current - 1) * pageSize;
        const end = start + pageSize;
        return filteredStudents.slice(start, end);
    }, [filteredStudents, current, pageSize]);

    const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
        setCurrent(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState({
        classId: 'all',
        status: 'all',
        hasTransfer: 'all',
        keyword: '',
        });
        setCurrent(1);
    }, []);

    const goToPage = useCallback(
        (page: number) => {
        const maxPage = Math.ceil(total / pageSize) || 1;
        if (page < 1 || page > maxPage) return;
        setCurrent(page);
        },
        [total, pageSize]
    );

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setCurrent(1);
    }, []);

    const onTableChange = useCallback(
        (pagination: TablePaginationConfig) => {
        setCurrent(pagination.current || 0);
        setPageSizeState(pagination.pageSize || 0);
        },
        []
    );

    // 计算统计数据
    const stats = useMemo(() => {
        const excellent = filteredStudents.filter((s) => s.status === 'excellent').length;
        const pending = filteredStudents.filter(
        (s) => s.status === 'pending' || s.status === 'remedial'
        ).length;
        const hasTransfer = filteredStudents.filter((s) => s.transferRecords.length > 0).length;
        const avgMastery =
        filteredStudents.length > 0
            ? Math.round(
                filteredStudents.reduce((acc, s) => acc + s.mastery, 0) / filteredStudents.length
            )
            : 0;
        return { total, excellent, pending, hasTransfer, avgMastery };
    }, [filteredStudents, total]);

    const handleCancel = () => {
        navigate('/workbench');
    };

    const onViewPortrait = () => {
      navigate('/workbench/studentPortrait')
    }

  return {
    students: paginatedStudents,
    total,
    pagination: { current, pageSize, total },
    filters,
    stats,
    setFilters,
    resetFilters,
    goToPage,
    setPageSize,
    onTableChange,
    handleCancel,
    onViewPortrait
  };
}