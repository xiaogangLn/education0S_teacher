import { Label } from '@ui';
import { Select, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { organizationsService, studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';
import { useOrgContext } from '@/hooks/useOrgContext';

function asList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || [];
}

const ClassInfo = () => {
  const { pathname } = useLocation();
  const user = loadPersistedUser();
  const org = useOrgContext();
  const commercial = isCommercialTenant(user);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; gradeId?: string; count?: number }>>([]);
  const selectDisabled = commercial || pathname === '/workbench/instrument';
  const assignedClassIds = useMemo(
    () => (user?.classIds?.length ? user.classIds : user?.classId ? [user.classId] : []),
    [user?.classIds, user?.classId],
  );
  const hasAssignedClasses = assignedClassIds.length > 0;
  const gradeLocked = Boolean(user?.gradeId);

  // 商业个人用户：清空年级/班级上下文，按名下学生计数
  useEffect(() => {
    if (!commercial) return;
    let cancelled = false;
    (async () => {
      let count = 0;
      try {
        const payload = extractPayload<{ total?: number; items?: any[] }>(
          await studentsService.getList({
            school_id: user?.schoolId,
            page: 1,
            page_size: 1,
            status: 'active',
          }),
        );
        count = Number(payload?.total ?? payload?.items?.length ?? 0) || 0;
      } catch {
        count = 0;
      }
      if (cancelled) return;
      org.updateOrg({
        gradeId: undefined,
        gradeName: undefined,
        classId: undefined,
        className: '我的学生',
        studentCount: count,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercial, user?.schoolId]);

  useEffect(() => {
    if (commercial) {
      setGrades([]);
      return;
    }
    organizationsService.getGrades({ school_id: user?.schoolId }).then((res) => {
      let items = asList(extractPayload(res)).map((item) => ({ id: String(item.id), name: item.name }));
      // 有任教年级时，顶部仅展示该年级
      if (user?.gradeId) {
        const assigned = items.find((item) => item.id === user.gradeId);
        items = assigned ? [assigned] : items;
      }
      setGrades(items);
      if (!org.gradeId && items.length) {
        const preferred = items.find((item) => item.id === user?.gradeId) || items[0];
        org.updateOrg({ gradeId: preferred.id, gradeName: preferred.name });
      } else if (user?.gradeId && org.gradeId !== user.gradeId) {
        const preferred = items.find((item) => item.id === user.gradeId);
        if (preferred) {
          org.updateOrg({ gradeId: preferred.id, gradeName: preferred.name, classId: undefined, className: undefined });
        }
      }
    }).catch(() => setGrades([]));
  }, [commercial, user?.schoolId, user?.gradeId]);

  useEffect(() => {
    if (commercial) {
      setClasses([]);
      return;
    }
    if (!org.gradeId) {
      setClasses([]);
      return;
    }
    organizationsService.getClasses({ school_id: user?.schoolId, grade_id: org.gradeId }).then((res) => {
      let items = asList(extractPayload(res)).map((item) => ({
        id: String(item.id),
        name: item.name,
        gradeId: item.gradeId || item.grade_id,
        count: item._count?.students ?? item.student_count ?? 0,
      }));
      // 有任教班级时，顶部仅展示分配的班级（最多 3 个）
      if (hasAssignedClasses) {
        const allowed = new Set(assignedClassIds);
        items = items.filter((item) => allowed.has(item.id));
      }
      setClasses(items);
      const preferredId = assignedClassIds.find((id) => items.some((item) => item.id === id));
      const current = items.find((item) => item.id === org.classId)
        || items.find((item) => item.id === preferredId)
        || items[0];
      if (current && current.id !== org.classId) {
        org.updateOrg({ classId: current.id, className: current.name, studentCount: current.count });
      } else if (current) {
        org.updateOrg({ className: current.name, studentCount: current.count });
      }
    }).catch(() => setClasses([]));
  }, [commercial, org.gradeId, user?.schoolId, hasAssignedClasses, assignedClassIds.join('|')]);

  const gradeOptions = useMemo(
    () => grades.map((item) => ({ label: item.name, value: item.id })),
    [grades],
  );
  const classOptions = useMemo(
    () => classes.map((item) => ({ label: item.name, value: item.id })),
    [classes],
  );

  if (commercial) {
    return (
      <div className="flex items-center">
        <div className="flex items-center opacity-50 pointer-events-none">
          <Label>年级：</Label>
          <Select disabled placeholder="商业版无需选择" style={{ width: 180, borderRadius: '20px' }} options={[]} />
        </div>
        <div className="flex items-center ml-[15px] opacity-50 pointer-events-none">
          <Label>班级：</Label>
          <Select disabled placeholder="商业版无需选择" style={{ width: 180, borderRadius: '20px' }} options={[]} />
        </div>
        <div className="ml-[15px]">
          <Tag color="blue" style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '20px' }}>
            📚 当前：我的学生 · {org.studentCount ?? 0}人
          </Tag>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <Label>年级：</Label>
        <Select
          disabled={selectDisabled || gradeLocked}
          value={org.gradeId}
          placeholder="请选择年级"
          style={{ width: 180, borderRadius: '20px' }}
          onChange={(value) => {
            const grade = grades.find((item) => item.id === value);
            org.updateOrg({ gradeId: value, gradeName: grade?.name, classId: undefined, className: undefined });
          }}
          options={gradeOptions}
        />
      </div>
      <div className="flex items-center ml-[15px]">
        <Label>班级：</Label>
        <Select
          disabled={selectDisabled}
          value={org.classId}
          options={classOptions}
          placeholder="请选择班级"
          style={{ width: 180, borderRadius: '20px' }}
          onChange={(value) => {
            const clazz = classes.find((item) => item.id === value);
            org.updateOrg({ classId: value, className: clazz?.name, studentCount: clazz?.count || 0 });
          }}
        />
      </div>
      <div className="ml-[15px]">
        <Tag color="blue" style={{ fontSize: '16px', padding: '5px 10px', borderRadius: '20px' }}>
          📚 当前：{org.className || org.gradeName || '未选择'} · {org.studentCount ?? 0}人
        </Tag>
      </div>
    </div>
  );
};

export { ClassInfo };
