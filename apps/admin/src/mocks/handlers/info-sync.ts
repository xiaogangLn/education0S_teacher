// packages/shared/src/mocks/handlers/info-sync.ts
import { http, HttpResponse } from 'msw';
import { success, delay } from './index';

export const infoSyncHandlers = [
  http.get('/api/v1/info-sync/sources', async () => {
    await delay(200);
    return HttpResponse.json(success({
      items: [
        { id: 'is1', source_name: '西安教育发布', source_type: 'wechat', sync_frequency: 'daily', is_active: true, last_sync_at: new Date().toISOString() },
        { id: 'is2', source_name: '陕西省教育厅', source_type: 'website', sync_frequency: 'daily', is_active: true, last_sync_at: new Date().toISOString() },
      ],
    }));
  }),

  http.post('/api/v1/info-sync/sync', async () => {
    await delay(1000);
    return HttpResponse.json(success({
      task_id: `sync_${Date.now()}`,
      source_count: 2,
      synced_count: 8,
      started_at: new Date().toISOString(),
    }, '同步完成'));
  }),
];