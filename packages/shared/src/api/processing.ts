// packages/shared/src/api/processing.ts
// ============================================================
// 加工台 API - 修复类型错误
// ============================================================

import { httpClient } from './client';
import {
  LessonGenerationTask,
  CreateLessonTaskRequest,
  UpdateLessonTaskRequest,
  ProcessingSubmitReviewRequest,
  ProcessingReviewActionRequest,
  GenerationProgress,
  Template,
  TemplateType,
  ProcessingHistoryParams,
  QuickGenerateRequest,
  QuickGenerateResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const BASE_URL = '/processing';

export const processingApi = {
  // ============================================================
  // 一、教案生成（五阶段交互）
  // ============================================================

  /** 1. 初始化 - 创建教案任务 */
  createTask: (data: CreateLessonTaskRequest): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/init`, data);
  },

  /** 2. 学情分析 - SSE 流式获取 */
  getAnalysisStream: (taskId: string): EventSource => {
    return httpClient.createEventSource(`${BASE_URL}/lesson-plan/${taskId}/analysis/stream`);
  },

  /** 2.1 确认学情分析 */
  confirmAnalysis: (taskId: string, data: { adjustments?: string }): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/analysis/confirm`, data);
  },

  /** 3. 大纲生成 - SSE 流式获取 */
  generateOutlineStream: (taskId: string): EventSource => {
    return httpClient.createEventSource(`${BASE_URL}/lesson-plan/${taskId}/outline/stream`);
  },

  /** 3.1 调整大纲 */
  adjustOutline: (taskId: string, data: { outline: string }): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/outline/adjust`, data);
  },

  /** 4. 内容填充 - SSE 流式获取 */
  generateContentStream: (taskId: string): EventSource => {
    return httpClient.createEventSource(`${BASE_URL}/lesson-plan/${taskId}/content/stream`);
  },

  /** 4.1 更新内容 */
  updateContent: (taskId: string, data: { content: string }): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.put(`${BASE_URL}/lesson-plan/${taskId}/content/update`, data);
  },

  /** 5. 精修定稿 - SSE 流式获取 */
  refineLessonStream: (taskId: string): EventSource => {
    return httpClient.createEventSource(`${BASE_URL}/lesson-plan/${taskId}/refine/stream`);
  },

  /** 5.1 完成生成 */
  completeTask: (taskId: string): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/complete`);
  },

  // ============================================================
  // 二、快速生成（直接 SSE 流式返回结果）
  // ============================================================

  /**
   * 快速生成文档 - SSE 流式
   * 修复：所有可选参数都添加默认值
   */
  generateDocumentStream: (data: QuickGenerateRequest): EventSource => {
    const params = new URLSearchParams();
    params.append('type', data.type);
    params.append('topic', data.topic || '');  // 添加默认值
    params.append('context', data.context || '');
    if (data.templateId) {
      params.append('templateId', data.templateId);
    }
    if (data.format) {
      params.append('format', data.format);
    }
    if (data.includeOutline !== undefined) {
      params.append('includeOutline', String(data.includeOutline));
    }
    return httpClient.createEventSource(`${BASE_URL}/generate/document/stream?${params.toString()}`);
  },

  /**
   * 生成 PDF - SSE 流式
   */
  generatePdfStream: (data: QuickGenerateRequest): EventSource => {
    const params = new URLSearchParams();
    params.append('content', data.content || '');
    params.append('title', data.title || '文档');
    if (data.templateId) {
      params.append('templateId', data.templateId);
    }
    return httpClient.createEventSource(`${BASE_URL}/generate/pdf/stream?${params.toString()}`);
  },

  /**
   * 生成图片 - SSE 流式
   */
  generateImageStream: (data: QuickGenerateRequest): EventSource => {
    const params = new URLSearchParams();
    params.append('prompt', data.prompt || '');
    if (data.style) {
      params.append('style', data.style);
    }
    if (data.size) {
      params.append('size', data.size);
    }
    return httpClient.createEventSource(`${BASE_URL}/generate/image/stream?${params.toString()}`);
  },

  /**
   * 生成音频 - SSE 流式
   */
  generateAudioStream: (data: QuickGenerateRequest): EventSource => {
    const params = new URLSearchParams();
    params.append('text', data.text || '');
    if (data.voice) {
      params.append('voice', data.voice);
    }
    if (data.speed) {
      params.append('speed', data.speed);
    }
    return httpClient.createEventSource(`${BASE_URL}/generate/audio/stream?${params.toString()}`);
  },

  /**
   * 生成视频 - SSE 流式
   */
  generateVideoStream: (data: QuickGenerateRequest): EventSource => {
    const params = new URLSearchParams();
    params.append('description', data.description || '');
    if (data.duration) {
      params.append('duration', String(data.duration));
    }
    if (data.style) {
      params.append('style', data.style);
    }
    if (data.resolution) {
      params.append('resolution', data.resolution);
    }
    return httpClient.createEventSource(`${BASE_URL}/generate/video/stream?${params.toString()}`);
  },

  // ============================================================
  // 三、通用接口
  // ============================================================

  /** 获取任务详情 */
  getTask: (taskId: string): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.get(`${BASE_URL}/lesson-plan/${taskId}`);
  },

  /** 获取任务列表 */
  getTasks: (params: ProcessingHistoryParams): Promise<ApiResponse<PaginatedResponse<LessonGenerationTask>>> => {
    return httpClient.get(`${BASE_URL}/lesson-plan/list`, { params });
  },

  /** 获取生成进度（通用 SSE） */
  getGenerationProgress: (taskId: string): EventSource => {
    return httpClient.createEventSource(`${BASE_URL}/lesson-plan/${taskId}/progress`);
  },

  /** 保存草稿 */
  saveDraft: (taskId: string): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/draft`);
  },

  /** 提交审批 */
  submitForReview: (data: ProcessingSubmitReviewRequest): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/submit-review`, data);
  },

  /** 审批操作 */
  reviewAction: (data: ProcessingReviewActionRequest): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/review`, data);
  },

  /** 获取模板列表 */
  getTemplates: (type?: TemplateType): Promise<ApiResponse<Template[]>> => {
    return httpClient.get(`${BASE_URL}/templates`, { params: { type } });
  },

  /** 应用模板 */
  applyTemplate: (taskId: string, templateId: string): Promise<ApiResponse<LessonGenerationTask>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/templates/${templateId}/apply`);
  },

  /** AI 生成建议 */
  getAISuggestion: (taskId: string, prompt: string): Promise<ApiResponse<{ suggestion: string }>> => {
    return httpClient.post(`${BASE_URL}/lesson-plan/${taskId}/ai-suggest`, { prompt });
  },

  /** 取消生成任务 */
  cancelGeneration: (taskId: string): Promise<ApiResponse<void>> => {
    return httpClient.post(`${BASE_URL}/generate/${taskId}/cancel`);
  },
};