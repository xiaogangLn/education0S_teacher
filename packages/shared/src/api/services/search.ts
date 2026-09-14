import { httpClient } from '../client';

export type ResearchSource = {
  id: string;
  title: string;
  kind: string;
  subject?: string;
  excerpt?: string;
  origin?: 'system' | 'ai';
};

export type ResearchStreamHandlers = {
  onSources?: (sources: ResearchSource[]) => void;
  onDelta?: (text: string) => void;
  onDone?: (payload: { answer: string; sources: ResearchSource[]; source?: string }) => void;
  onError?: (message: string) => void;
};

function parseSseBlock(block: string): { event: string; data: string } {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  return { event, data: dataLines.join('\n') };
}

export const searchService = {
  global: (keyword: string) => {
    return httpClient.get('/search/global', { params: { keyword } });
  },

  research: (data: { question: string; subject?: string; grade_id?: string }) => {
    return httpClient.post<{
      answer: string;
      sources: ResearchSource[];
      source: 'model' | 'search';
    }>('/search/research', data, { timeout: 60000 });
  },

  researchStream: async (
    data: { question: string; subject?: string; grade_id?: string },
    handlers: ResearchStreamHandlers,
  ) => {
    const token = localStorage.getItem('accessToken') || '';
    const params = new URLSearchParams();
    params.set('question', data.question);
    if (data.subject) params.set('subject', data.subject);
    if (data.grade_id) params.set('grade_id', data.grade_id);
    const response = await fetch(`/api/v1/search/research/stream?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok || !response.body) {
      throw new Error('查资料流式接口不可用');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const { event, data: raw } = parseSseBlock(part);
        if (!raw) continue;
        let payload: any = raw;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = { text: raw };
        }
        if (event === 'sources') handlers.onSources?.(payload.sources || []);
        else if (event === 'delta') handlers.onDelta?.(String(payload.text || ''));
        else if (event === 'done') {
          handlers.onDone?.({
            answer: String(payload.answer || ''),
            sources: payload.sources || [],
            source: payload.source,
          });
        } else if (event === 'error') {
          handlers.onError?.(payload.message || '查询失败');
        }
      }
    }
  },
};
