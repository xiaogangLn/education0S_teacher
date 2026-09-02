// packages/shared/src/types/processing.ts
// ============================================================
// 加工台相关类型定义
// ============================================================

import { PermissionLevel, PaginationParams } from './common';

// ============================================================
// 教案生成相关类型
// ============================================================

/** 教案生成任务 */
export interface LessonGenerationTask {
  id: string;
  classId: string;
  className: string;
  subject: string;
  topic: string;
  teacherIdeas: {
    teachingApproach: string;
    keyEmphasis: string[];
    specialDesign: string;
  };
  classAnalysis: {
    masteryRate: number;
    weakPoints: string[];
    distribution: {
      levelA: number;
      levelB: number;
      levelC: number;
    };
    recentDevelopment: string;
  };
  generatedLessonPlan: string;
  generatedCoursewarePath?: string;
  aiGeneratedAt?: string;
  aiTags: string[];
  status: LessonGenerationStatus;
  draftSavedAt?: string;
  submittedAt?: string;
  approverId?: string;
  approvalComment?: string;
  approvedAt?: string;
  knowledgeItemId?: string;
  publishedAt?: string;
  teacherEdits: {
    stage: 'init' | 'analysis' | 'outline' | 'content' | 'refine';
    content: string;
    timestamp: string;
  }[];
  editCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** 教案生成状态 */
export type LessonGenerationStatus =
  | 'generated'
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published';

/** 教案生成阶段 */
export type GenerationStage = 'init' | 'analysis' | 'outline' | 'content' | 'refine';

/** 创建教案任务请求 */
export interface CreateLessonTaskRequest {
  classId: string;
  subject: string;
  topic: string;
  teacherIdeas: {
    teachingApproach: string;
    keyEmphasis: string[];
    specialDesign: string;
  };
}

/** 更新教案任务请求 */
export interface UpdateLessonTaskRequest {
  teacherIdeas?: Partial<CreateLessonTaskRequest['teacherIdeas']>;
  generatedLessonPlan?: string;
  status?: LessonGenerationStatus;
  approvalComment?: string;
}

/** 提交审批请求（加工台） */
export interface ProcessingSubmitForReviewRequest {
  taskId: string;
  comment?: string;
}

/** 审批操作请求（加工台） */
export interface ProcessingReviewActionRequest {
  taskId: string;
  action: 'approve' | 'reject';
  comment: string;
}

/** 教案生成进度 */
export interface GenerationProgress {
  stage: GenerationStage;
  progress: number;
  message: string;
  data?: any;
}

/** 模板类型 */
export type TemplateType = 'lesson_plan' | 'courseware' | 'exam_paper';

/** 模板 */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  icon: string;
  category: 'school' | 'personal' | 'research';
  description: string;
  content: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** 加工台历史记录查询参数 */
export interface ProcessingHistoryParams extends PaginationParams {
  status?: LessonGenerationStatus;
  subject?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================
// 快速生成类型
// ============================================================

/** 快速生成请求 */
export interface QuickGenerateRequest {
  type: 'document' | 'pdf' | 'image' | 'audio' | 'video' | 'presentation' | 'spreadsheet';
  title?: string;
  topic?: string;
  context?: string;
  content?: string;
  templateId?: string;
  format?: 'docx' | 'pdf' | 'html' | 'markdown';
  includeOutline?: boolean;
  prompt?: string;
  style?: 'realistic' | 'cartoon' | 'sketch' | '3d';
  size?: '512x512' | '1024x1024' | '2048x2048';
  text?: string;
  voice?: 'male' | 'female' | 'child' | 'robot';
  speed?: 'slow' | 'normal' | 'fast';
  description?: string;
  duration?: number;
  resolution?: '720p' | '1080p' | '4k';
}

/** 快速生成响应 */
export interface QuickGenerateResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    url: string;
    fileSize: number;
    format: string;
  };
  error?: string;
}

/** SSE 流式事件类型 */
export type SSEEventType = 'start' | 'progress' | 'chunk' | 'complete' | 'error' | 'cancel';

/** SSE 事件 */
export interface SSEEvent<T = any> {
  type: SSEEventType;
  data: T;
  timestamp: string;
  taskId: string;
}

/** 进度事件数据 */
export interface ProgressEventData {
  stage: string;
  progress: number;
  message: string;
  detail?: string;
}

/** 块事件数据 */
export interface ChunkEventData {
  content: string;
  isComplete?: boolean;
}