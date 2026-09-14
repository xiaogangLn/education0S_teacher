import { useEffect, useMemo, useState } from 'react';
import { organizationsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { loadPersistedUser } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';
import { useOrgContext } from '@/hooks/useOrgContext';

function asList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || [];
}

export interface SchoolGrade {
  id: string;
  name: string;
}

export function useSchoolGrades() {
  const storeUser = useAppSelector((state) => state.user.current);
  const persisted = loadPersistedUser();
  const schoolId = storeUser?.schoolId || persisted?.schoolId;
  const org = useOrgContext();
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    organizationsService
      .getGrades(schoolId ? { school_id: schoolId } : undefined)
      .then((res) => {
        if (cancelled) return;
        const items = asList(extractPayload(res)).map((item) => ({
          id: String(item.id),
          name: String(item.name || ''),
        })).filter((item) => item.id && item.name);
        setGrades(items);
      })
      .catch(() => {
        if (!cancelled) setGrades([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  useEffect(() => {
    if (!grades.length) return;
    const current = grades.find((item) => item.id === org.gradeId);
    if (!current) {
      org.updateOrg({
        gradeId: grades[0].id,
        gradeName: grades[0].name,
        classId: undefined,
        className: undefined,
      });
      return;
    }
    if (current.name !== org.gradeName) {
      org.updateOrg({ gradeName: current.name });
    }
  }, [grades, org.gradeId, org.gradeName, org.updateOrg]);

  const options = useMemo(
    () => grades.map((item) => ({ label: item.name, value: item.id })),
    [grades],
  );

  return { grades, options, loading, schoolId };
}
