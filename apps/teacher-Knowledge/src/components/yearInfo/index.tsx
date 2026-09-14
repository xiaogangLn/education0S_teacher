import { Label } from '@ui';
import { Select, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { loadPersistedUser } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';
import { useOrgContext } from '@/hooks/useOrgContext';

interface CohortOption {
  year: string;
  label: string;
  student_count: number;
}

const YearInfo = () => {
  const storeUser = useAppSelector((state) => state.user.current);
  const schoolId = storeUser?.schoolId || loadPersistedUser()?.schoolId;
  const org = useOrgContext();
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    studentsService
      .getEnrollmentYears(schoolId ? { school_id: schoolId } : undefined)
      .then((res) => {
        if (cancelled) return;
        const payload = extractPayload<{ items: CohortOption[] }>(res);
        const items = (payload?.items || []).filter((item) => item.year);
        setCohorts(items);
      })
      .catch(() => {
        if (!cancelled) setCohorts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  useEffect(() => {
    if (!cohorts.length) return;
    const current = cohorts.find((item) => item.year === org.enrollmentYear);
    if (!current) {
      org.updateOrg({ enrollmentYear: cohorts[0].year });
    }
  }, [cohorts, org.enrollmentYear, org.updateOrg]);

  const options = useMemo(
    () => cohorts.map((item) => ({ label: item.label, value: item.year })),
    [cohorts],
  );
  const currentLabel = cohorts.find((item) => item.year === org.enrollmentYear)?.label || (org.enrollmentYear ? `${org.enrollmentYear}届` : '未选择');

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <Label>哪一届：</Label>
        <Select
          value={org.enrollmentYear}
          placeholder={loading ? '加载届别...' : '请选择届别'}
          loading={loading}
          style={{ width: 180, borderRadius: '20px' }}
          onChange={(value) => org.updateOrg({ enrollmentYear: value })}
          options={options}
        />
      </div>
      <div className="ml-[15px]">
        <Tag color="blue" style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '20px' }}>
          📚 当前：{currentLabel}
        </Tag>
      </div>
    </div>
  );
};

export { YearInfo };
