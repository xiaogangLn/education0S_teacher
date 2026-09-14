import { useCallback, useEffect, useState } from 'react';
import { knowledgeService } from '@api/index';
import type { Document, StatsData } from '../types';
import { extractPayload, mapKnowledgeDocument } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';

const emptyStats: StatsData = {
  school: 0,
  grade: 0,
  class: 0,
  research: 0,
  personal: 0,
  total: 0,
};

export function useAllDocuments() {
  const org = useOrgContext();
  const user = loadPersistedUser();
  const commercial = isCommercialTenant(user);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<StatsData>(emptyStats);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, permRes] = await Promise.all([
        knowledgeService.getList({ page: 1, page_size: 100, grade_id: org.gradeId }),
        knowledgeService.getPermissions(),
      ]);
      const listPayload = extractPayload<{ items: any[]; total: number }>(listRes);
      const permPayload = extractPayload<{ items: Array<{ key: string; count: number }> }>(permRes);
      const items = (listPayload.items || []).map((item) => {
        const mapped = mapKnowledgeDocument(item);
        return {
          ...mapped,
          permission: mapped.permission as Document['permission'],
        };
      });
      const counts = Object.fromEntries((permPayload.items || []).map((item) => [item.key, item.count]));
      setDocuments(items);
      setStats({
        school: counts.school || 0,
        grade: counts.grade || 0,
        class: counts.class || 0,
        research: counts.research || 0,
        personal: counts.personal || 0,
        total: listPayload.total || items.length,
      });
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [org.gradeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { documents, stats, loading, refresh: fetchData, commercial };
}
