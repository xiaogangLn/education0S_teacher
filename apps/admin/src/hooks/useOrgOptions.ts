import { useCallback, useEffect, useState } from 'react';
import { organizationsService } from '@api/index';
import { asList, extractPayload } from '@/utils/api';

export interface SchoolOption {
  id: string;
  name: string;
  code: string;
  type: 'education' | 'commercial';
}

export interface GradeOption {
  id: string;
  school_id: string;
  name: string;
}

export interface ClassOption {
  id: string;
  school_id: string;
  grade_id: string;
  name: string;
}

function mapSchool(item: any): SchoolOption {
  return {
    id: String(item.id),
    name: item.name,
    code: item.code || '',
    type: item.type === 'commercial' ? 'commercial' : 'education',
  };
}

function mapGrade(item: any): GradeOption {
  return {
    id: String(item.id),
    school_id: String(item.school_id || item.schoolId || ''),
    name: item.name,
  };
}

function mapClass(item: any): ClassOption {
  return {
    id: String(item.id),
    school_id: String(item.school_id || item.schoolId || ''),
    grade_id: String(item.grade_id || item.gradeId || ''),
    name: item.name,
  };
}

export function useOrgOptions() {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);

  const loadSchools = useCallback(async () => {
    try {
      const res = await organizationsService.getSchools();
      setSchools(asList(extractPayload(res)).map(mapSchool));
    } catch {
      setSchools([]);
    }
  }, []);

  const loadGrades = useCallback(async (schoolId?: string) => {
    try {
      const res = await organizationsService.getGrades(schoolId ? { school_id: schoolId } : undefined);
      setGrades(asList(extractPayload(res)).map(mapGrade));
    } catch {
      setGrades([]);
    }
  }, []);

  const loadClasses = useCallback(async (params?: { school_id?: string; grade_id?: string }) => {
    try {
      const res = await organizationsService.getClasses(params);
      setClasses(asList(extractPayload(res)).map(mapClass));
    } catch {
      setClasses([]);
    }
  }, []);

  useEffect(() => {
    void loadSchools();
    void loadGrades();
    void loadClasses();
  }, [loadSchools, loadGrades, loadClasses]);

  return {
    schools,
    grades,
    classes,
    loadSchools,
    loadGrades,
    loadClasses,
  };
}
