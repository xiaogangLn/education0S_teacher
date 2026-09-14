import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  Student,
  FilterOptions,
  StudentStatus,
  UseStudentListOptions,
  UseStudentListReturn,
} from '../types';
import type { TablePaginationConfig } from 'antd';
import { useNavigate } from 'react-router-dom';
import { studentsService, type StudentItem } from '@api/index';
import { useOrgContext } from '@/hooks/useOrgContext';

const AVATAR_COLORS = ['#4f46e5', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#14b8a6'];

function masteryToStatus(mastery: number): StudentStatus {
  if (mastery >= 85) return 'excellent';
  if (mastery >= 70) return 'good';
  if (mastery >= 50) return 'pending';
  return 'remedial';
}

function mapStudent(item: StudentItem): Student {
  const mastery = Math.round(Number(item.mastery_rate || 0));
  return {
    id: item.id,
    name: item.name,
    studentNo: item.student_no,
    classId: item.class_id,
    currentClass: item.class_name || '',
    avatarColor: AVATAR_COLORS[Math.abs(item.id.charCodeAt(0)) % AVATAR_COLORS.length],
    mastery,
    status: masteryToStatus(mastery),
    transferRecords: (item.transfer_history || []).map((t) => ({
      fromClass: t.from_class,
      toClass: t.to_class,
      date: t.transfer_date ? String(t.transfer_date).slice(0, 10) : '',
    })),
  };
}

export function useStudentList(
  options: UseStudentListOptions = {}
): UseStudentListReturn {
  const navigate = useNavigate();
  const org = useOrgContext();
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
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentsService.getList({
        page: current,
        page_size: pageSize,
        keyword: filters.keyword || undefined,
        class_id: filters.classId !== 'all' ? filters.classId : org.classId,
        grade_id: org.gradeId,
      });
      const items = (response.data?.items || []).map(mapStudent);
      let next = items;
      if (filters.status && filters.status !== 'all') {
        next = next.filter((s) => s.status === filters.status);
      }
      if (filters.hasTransfer === 'has') {
        next = next.filter((s) => s.transferRecords.length > 0);
      } else if (filters.hasTransfer === 'none') {
        next = next.filter((s) => s.transferRecords.length === 0);
      }
      setStudents(next);
      setTotal(response.data?.total ?? next.length);
    } catch {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, filters.keyword, filters.classId, filters.status, filters.hasTransfer, org.classId, org.gradeId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const onTableChange = useCallback((pagination: TablePaginationConfig) => {
    setCurrent(pagination.current || 1);
    setPageSizeState(pagination.pageSize || 7);
  }, []);

  const stats = useMemo(() => {
    const excellent = students.filter((s) => s.status === 'excellent').length;
    const pending = students.filter((s) => s.status === 'pending' || s.status === 'remedial').length;
    const hasTransfer = students.filter((s) => s.transferRecords.length > 0).length;
    const avgMastery =
      students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + s.mastery, 0) / students.length)
        : 0;
    return { total, excellent, pending, hasTransfer, avgMastery };
  }, [students, total]);

  const handleCancel = () => {
    navigate('/workbench');
  };

  const onViewPortrait = (student: Student) => {
    navigate(`/workbench/studentPortrait?id=${student.id}`);
  };

  const onStudentDateils = (student: Student) => {
    navigate(`/workbench/studentLearningRecords?id=${student.id}`);
  };

  return {
    students,
    total,
    pagination: { current, pageSize, total },
    filters,
    stats,
    loading,
    setFilters,
    resetFilters,
    goToPage,
    setPageSize,
    onTableChange,
    handleCancel,
    onViewPortrait,
    onStudentDateils,
    refresh: fetchStudents,
  };
}
