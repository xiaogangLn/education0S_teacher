// packages/shared/src/api/services/processing.ts
import { httpClient } from '../client';

export interface TeacherIdeas {
  teaching_approach: string;
  key_points: string[];
  special_design: string;
  target_students: string;
}

export interface ClassAnalysis {
  mastery_rate: number;
  weak_points: string[];
  layers: { A: number; B: number; C: number };
  zone_of_proximal_development: string;
}

export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  children?: OutlineSection[];
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  ai_generated: boolean;
  teacher_modified: boolean;
  modifications?: string[];
}

export interface GenerationTask {
  id: string;
  type?: string;
  class_id: string;
  subject: string;
  topic: string;
  current_stage: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'complete';
  status: 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';
  teacher_ideas: TeacherIdeas;
  class_analysis: ClassAnalysis;
  outline: OutlineSection[];
  content: ContentSection[];
  refined_content: ContentSection[];
  generated_lesson_plan: string;
  ai_tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
}

function buildExamSpecQuery(spec: {
  level: 'easy' | 'medium' | 'hard';
  counts?: Record<string, number>;
  types?: Array<{ key: string; label: string }>;
  choice?: number;
  blank?: number;
  solve?: number;
  apply?: number;
  app?: number;
  reading?: number;
  cloze?: number;
  essay?: number;
}) {
  const params = new URLSearchParams();
  params.set('exam_level', spec.level);
  const counts = { ...(spec.counts || {}) };
  const legacy: Array<[string, number | undefined]> = [
    ['choice', spec.choice],
    ['blank', spec.blank],
    ['solve', spec.solve],
    ['apply', spec.apply ?? spec.app],
    ['reading', spec.reading],
    ['cloze', spec.cloze],
    ['essay', spec.essay],
  ];
  for (const [key, value] of legacy) {
    if (value != null && counts[key] == null) counts[key] = value;
  }
  const items = Object.entries(counts)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .map(([key, value]) => `${key}:${Math.max(0, Math.min(20, Math.round(Number(value) || 0)))}`);
  if (items.length) params.set('exam_items', items.join(','));
  if (spec.types?.length) {
    params.set('exam_types', spec.types.map((item) => `${item.key}:${item.label}`).join(','));
  }
  if (counts.choice != null) params.set('exam_choice', String(counts.choice));
  if (counts.blank != null) params.set('exam_blank', String(counts.blank));
  if (counts.solve != null || counts.apply != null) params.set('exam_solve', String(counts.solve ?? counts.apply ?? 0));
  if (counts.apply != null) params.set('exam_apply', String(counts.apply));
  if (counts.reading != null) params.set('exam_reading', String(counts.reading));
  if (counts.cloze != null) params.set('exam_cloze', String(counts.cloze));
  if (counts.essay != null) params.set('exam_essay', String(counts.essay));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const processingService = {
  // POST /api/v1/processing/tasks - 创建任务（阶段1：初始化）
  createResearch: (data: {
    topic: string;
    subject?: string;
    class_id?: string;
    grade_id?: string;
    messages?: Array<{ id?: string; role: string; content: string; timestamp?: string; type?: string }>;
  }) => {
    return httpClient.post<{ task_id: string; type: string; status: string; created_at: string }>(
      '/processing/tasks/research',
      data,
    );
  },

  create: (data: {
    class_id?: string;
    grade_id?: string;
    subject: string;
    topic: string;
    type?: string;
    teacher_ideas?: TeacherIdeas | Record<string, string>;
    template_id?: string;
    template?: Record<string, unknown>;
    material_ids?: string[];
    materials?: Array<{ id: string; title?: string; name?: string; type?: string }>;
  }) => {
    return httpClient.post<{
      task_id: string;
      status: string;
      current_stage: string;
      created_at: string;
    }>('/processing/tasks', data);
  },

  // GET /api/v1/processing/tasks/{id} - 获取任务详情
  getDetail: (id: string) => {
    return httpClient.get<{ task: GenerationTask }>(`/processing/tasks/${id}`);
  },

  // GET /api/v1/processing/tasks - 获取任务列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    subject?: string;
    created_by?: string;
    class_id?: string;
    grade_id?: string;
    type?: string;
  }) => {
    return httpClient.get<{ items: GenerationTask[]; total: number }>('/processing/tasks', { params });
  },

  // GET /api/v1/processing/tasks/{id}/analysis - 获取学情分析报告（阶段2）
  getAnalysis: (id: string, force = false) => {
    return httpClient.get<{ analysis: ClassAnalysis }>(`/processing/tasks/${id}/analysis`, {
      params: force ? { force: 1 } : undefined,
      timeout: 120000,
    });
  },

  // POST /api/v1/processing/tasks/{id}/analysis/confirm - 确认学情分析
  confirmAnalysis: (id: string, confirmed: boolean, adjustments?: string) => {
    return httpClient.post(`/processing/tasks/${id}/analysis/confirm`, { confirmed, adjustments });
  },

  // POST /api/v1/processing/tasks/{id}/outline/generate - 生成大纲（阶段3）
  generateOutline: (id: string, instruction?: string) => {
    return httpClient.post<{ outline: OutlineSection[] }>(`/processing/tasks/${id}/outline/generate`, {
      instruction,
    }, { timeout: 120000 });
  },

  // POST /api/v1/processing/tasks/{id}/outline/adjust - 调整大纲
  adjustOutline: (id: string, sections: OutlineSection[]) => {
    return httpClient.post(`/processing/tasks/${id}/outline/adjust`, { sections });
  },

  // POST /api/v1/processing/tasks/{id}/content/generate - 生成内容（阶段4）
  generateContent: (id: string, instruction?: string) => {
    return httpClient.post<{ content: ContentSection[] }>(`/processing/tasks/${id}/content/generate`, {
      instruction,
    }, { timeout: 120000 });
  },

  // PUT /api/v1/processing/tasks/{id}/content/update - 更新内容
  updateContent: (id: string, sections: ContentSection[]) => {
    return httpClient.put(`/processing/tasks/${id}/content/update`, { sections });
  },

  // POST /api/v1/processing/tasks/{id}/refine - 精修定稿（阶段5）
  refine: (id: string, instruction?: string) => {
    return httpClient.post<{ refined_content: ContentSection[] }>(`/processing/tasks/${id}/refine`, {
      instruction,
    }, { timeout: 120000 });
  },

  // POST /api/v1/processing/tasks/{id}/complete - 完成生成
  complete: (id: string) => {
    return httpClient.post<{ task_id: string; status: string; completed_at: string }>(
      `/processing/tasks/${id}/complete`
    );
  },

  // POST /api/v1/processing/tasks/{id}/adjust - 对话调整
  adjust: (id: string, data: {
    stage: 'analysis' | 'outline' | 'content' | 'refine';
    instruction: string;
    type: 'adjust' | 'regenerate' | 'refine';
    target?: string;
  }) => {
    return httpClient.post<{ task_id: string; stage: string; stream_url: string }>(
      `/processing/tasks/${id}/adjust`,
      data
    );
  },

  saveConversation: (id: string, messages: Array<Record<string, unknown>>) => {
    return httpClient.post(`/processing/tasks/${id}/conversation`, { messages });
  },

  streamStage: async (
    id: string,
    stage: string,
    handlers: {
      examSpec?: {
        level: 'easy' | 'medium' | 'hard';
        counts?: Record<string, number>;
        types?: Array<{ key: string; label: string }>;
        choice?: number;
        blank?: number;
        solve?: number;
        apply?: number;
        app?: number;
        reading?: number;
        cloze?: number;
        essay?: number;
      };
      onThinking?: (text: string) => void;
      onDelta?: (text: string) => void;
      onSnapshot?: (text: string) => void;
      onDone?: (payload: { stage: string; content: string; thinking: string; title?: string }) => void;
      onError?: (message: string) => void;
      feedback?: string;
    },
  ) => {
    const token = localStorage.getItem('accessToken') || '';
    const spec = handlers.examSpec;
    let query = spec ? buildExamSpecQuery(spec) : '';
    const feedback = String(handlers.feedback || '').trim().slice(0, 2000);
    if (feedback) {
      query = query
        ? `${query}&feedback=${encodeURIComponent(feedback)}`
        : `?feedback=${encodeURIComponent(feedback)}`;
    }
    const response = await fetch(`/api/v1/processing/tasks/${id}/stream/${stage}${query}`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok || !response.body) {
      throw new Error('加工阶段流式接口不可用');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let thinking = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        let event = 'message';
        const dataLines: string[] = [];
        for (const line of part.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        const raw = dataLines.join('\n');
        if (!raw) continue;
        let payload: any = raw;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = { text: raw };
        }
        if (event === 'thinking') {
          const text = String(payload.text || '');
          thinking += text;
          handlers.onThinking?.(text);
        } else if (event === 'snapshot') {
          content = String(payload.text || payload.content || '');
          handlers.onSnapshot?.(content);
        } else if (event === 'delta') {
          const text = String(payload.text || payload.content || '');
          content += text;
          handlers.onDelta?.(text);
        } else if (event === 'done') {
          handlers.onDone?.({
            stage: String(payload.stage || stage),
            content: String(payload.content || content),
            thinking: String(payload.thinking || thinking),
            title: payload.title ? String(payload.title) : undefined,
          });
        } else if (event === 'error') {
          handlers.onError?.(payload.message || '生成失败');
        }
      }
    }
  },

  // GET /api/v1/processing/tasks/{id}/stream/{stage} - SSE流式推送
  createStream: (id: string, stage: string): EventSource => {
    return httpClient.createEventSource(`/processing/tasks/${id}/stream/${stage}`);
  },

  // POST /api/v1/processing/tasks/{id}/submit - 提交审批
  submit: (id: string) => {
    return httpClient.post<{ task_id: string; status: string; submitted_at: string }>(
      `/processing/tasks/${id}/submit`
    );
  },

  // POST /api/v1/processing/tasks/{id}/draft - 存入草稿箱
  draft: (id: string) => {
    return httpClient.post<{ task_id: string; status: string; draft_saved_at: string }>(
      `/processing/tasks/${id}/draft`
    );
  },

  // GET /api/v1/processing/tasks/{id}/versions - 获取版本历史
  getVersions: (id: string) => {
    return httpClient.get<{
      items: Array<{
        version: number;
        content: string;
        saved_at: string;
        saved_by: string;
        changes: string;
      }>;
    }>(`/processing/tasks/${id}/versions`);
  },

  // POST /api/v1/processing/tasks/{id}/versions/{version}/restore - 恢复版本
  restoreVersion: (id: string, version: number) => {
    return httpClient.post<{ task_id: string; version: number; restored_at: string }>(
      `/processing/tasks/${id}/versions/${version}/restore`
    );
  },

  // GET /api/v1/processing/tasks/{id}/approval-status - 获取审批状态
  getApprovalStatus: (id: string) => {
    return httpClient.get<{
      status: string;
      approver: string;
      reviewed_at: string;
      comment: string;
    }>(`/processing/tasks/${id}/approval-status`);
  },
};