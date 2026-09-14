import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { knowledgeService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { loadPersistedUser } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';
import type { TemplateType } from '@/pages/workbench/Instrument/types';

export interface WorkbenchTemplate {
  id: string;
  title: string;
  kind: string;
  scope: 'personal' | 'school' | 'system';
  source_label: string;
  subject: string;
  builtin_type: TemplateType;
  has_steps?: boolean;
  content?: string;
}

function resolveTeacherSubjects(user?: { subjects?: string[] } | null): string[] {
  const list = (user?.subjects || []).map((item) => String(item).trim()).filter(Boolean);
  return list.length ? list : ['数学'];
}

export function useSchoolTemplates() {
  const org = useOrgContext();
  const currentUser = useAppSelector((state) => state.user.current);
  const teacherSubjects = useMemo(
    () => resolveTeacherSubjects(currentUser || loadPersistedUser()),
    [currentUser],
  );
  const subject = teacherSubjects[0] || '数学';
  const [commonTemplates, setCommonTemplates] = useState<WorkbenchTemplate[]>([]);
  const [schoolTemplates, setSchoolTemplates] = useState<WorkbenchTemplate[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const payload = extractPayload<{ items?: any[]; school_templates?: any[] }>(
        await knowledgeService.getTemplates({
          subject,
          grade_id: org.gradeId,
          school_id: currentUser?.schoolId || loadPersistedUser()?.schoolId,
        }),
      );
      const mapItem = (item: any): WorkbenchTemplate => ({
        id: String(item.id),
        title: item.title,
        kind: item.kind,
        scope: item.scope,
        source_label: item.source_label,
        subject: item.subject || subject,
        builtin_type: item.builtin_type as TemplateType,
        has_steps: item.has_steps,
        content: item.content || '',
      });
      setCommonTemplates(
        (payload?.items || [])
          .map(mapItem)
          .filter((item) => ['lesson_plan', 'courseware', 'exam'].includes(item.kind)),
      );
      setSchoolTemplates(
        (payload?.school_templates || [])
          .map(mapItem)
          .filter((item) => ['lesson_plan', 'courseware', 'exam'].includes(item.kind)),
      );
    } catch {
      setCommonTemplates([]);
      setSchoolTemplates([]);
    }
  }, [org.gradeId, subject, currentUser?.schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadTemplate = useCallback(async (file: File, kind: string, scope: 'school' | 'personal' = 'school') => {
    setUploading(true);
    try {
      let content = '';
      try {
        content = await file.text();
      } catch {
        content = '';
      }
      const user = currentUser || loadPersistedUser();
      await knowledgeService.create({
        title: file.name.replace(/\.[^.]+$/, ''),
        type: 'template',
        content: content.slice(0, 80000),
        permission: scope === 'personal' ? 'personal' : 'school',
        subject,
        grade_id: org.gradeId,
        tags: ['template', kind],
        file_size: file.size,
        metadata: {
          kind,
          scope,
          schoolId: user?.schoolId,
        },
      });
      message.success(scope === 'personal' ? '个人模板已上传，未上传前将使用系统默认模板' : '模板已上传到本校资源');
      await load();
    } catch (error: any) {
      message.error(error?.message || '模板上传失败');
    } finally {
      setUploading(false);
    }
  }, [load, org.gradeId, subject, currentUser]);

  const toBuiltinType = (kind: string): TemplateType => {
    if (kind === 'courseware') return '课件模板';
    if (kind === 'exam') return '试卷模板';
    return '教案模板';
  };

  return {
    commonTemplates,
    schoolTemplates,
    uploading,
    subject,
    uploadTemplate,
    reload: load,
    toBuiltinType,
  };
}
