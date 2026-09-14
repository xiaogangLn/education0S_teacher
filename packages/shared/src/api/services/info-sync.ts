// packages/shared/src/api/services/info-sync.ts
import { httpClient } from '../client';

export const infoSyncService = {
  // GET /api/v1/info-sync/sources - 获取信息源列表
  getSources: () => {
    return httpClient.get<{
      items: Array<{
        id: string;
        source_name: string;
        source_type: 'wechat' | 'website' | 'rss';
        source_url: string;
        sync_frequency: string;
        sync_time: string;
        tags: string[];
        is_active: boolean;
        last_sync_at: string;
      }>;
    }>('/info-sync/sources');
  },

  // POST /api/v1/info-sync/sources - 创建信息源
  createSource: (data: {
    source_name: string;
    source_type: 'wechat' | 'website' | 'rss';
    source_url: string;
    feed_url?: string;
    sync_frequency?: 'daily' | 'hourly' | 'weekly';
    sync_time?: string;
    tags?: string[];
  }) => {
    return httpClient.post('/info-sync/sources', data);
  },

  // PUT /api/v1/info-sync/sources/{id} - 更新信息源
  updateSource: (id: string, data: Partial<{ source_name: string; source_url: string; feed_url: string; sync_frequency: string; sync_time: string; tags: string[]; is_active: boolean }>) => {
    return httpClient.put(`/info-sync/sources/${id}`, data);
  },

  // POST /api/v1/info-sync/sync - 手动触发同步
  syncNow: () => {
    return httpClient.post<{
      task_id: string;
      source_count: number;
      synced_count: number;
      started_at: string;
    }>('/info-sync/sync');
  },

  // GET /api/v1/info-sync/records - 获取同步记录
  getSyncRecords: (params?: { page?: number; page_size?: number; source_id?: string; status?: 'success' | 'failed' | 'partial' }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        source_name: string;
        status: string;
        synced_count: number;
        started_at: string;
        completed_at: string;
      }>;
      total: number;
    }>('/info-sync/records', { params });
  },

  // GET /api/v1/info-sync/items - 获取同步内容
  getItems: (params?: { page?: number; page_size?: number; type?: 'policy' | 'notice' | 'insight'; keyword?: string }) => {
    return httpClient.get<{
      items: Array<{
        id: string;
        title: string;
        type: 'policy' | 'notice' | 'insight';
        content: string;
        source: string;
        published_at: string;
        tags: string[];
      }>;
      total: number;
    }>('/info-sync/items', { params });
  },

  // GET /api/v1/info-sync/insights - 获取洞察报告
  getInsights: () => {
    return httpClient.get<{
      insights: Array<{
        id: string;
        title: string;
        summary: string;
        content: string;
        generated_at: string;
        tags: string[];
      }>;
    }>('/info-sync/insights');
  },
};