// packages/shared/src/types/index.ts
// ============================================================
// 类型统一导出
// ============================================================

// 导出公共类型（只导出一次）
export * from './common';
export * from './user';
export *from './knowledge';
export * from './document';

// ============================================================
// 从 processing 导出（解决与 review 的命名冲突）
// ============================================================
export {
  // 主要类型（无冲突）
  LessonGenerationTask,
  LessonGenerationStatus,
  GenerationStage,
  GenerationProgress,
  Template,
  TemplateType,
  ProcessingHistoryParams,
  // 请求/响应类型（重命名避免冲突）
  CreateLessonTaskRequest,
  UpdateLessonTaskRequest,
  ProcessingSubmitForReviewRequest as ProcessingSubmitReviewRequest,
  ProcessingReviewActionRequest,
  // 快速生成类型
  QuickGenerateRequest,
  QuickGenerateResponse,
  SSEEvent,
  SSEEventType,
  ProgressEventData,
  ChunkEventData,
} from './processing';

// ============================================================
// 从 review 导出（保留原名）
// ============================================================
export {
  ReviewActionRequest,
  SubmitReviewRequest,
  ReviewItem,
  ReviewStatus,
  ReviewContent,
  ReviewComment,
  ReviewTimeline,
  ReviewDetail,
  ReviewStats,
  ReviewQueryParams,
} from './review';

// ============================================================
// 从 dashboard 导出
// ============================================================
export {
  GradeTrend,
  ClassDetail,
  DashboardStats,
  DashboardQueryParams,
  LeaderViewData,
  AlertItem,
} from './dashboard';

// ============================================================
// 从 export 导出
// ============================================================
export {
  ExportFormat,
  ExportScope,
  ExportOption,
  ExportTask,
  ExportRequest,
  ExportResponse,
} from './export';

// ============================================================
// 从 trend 导出
// ============================================================
export {
  TrendDataPoint,
  TrendPrediction,
  PredictionRequest,
  PredictionStep,
  SSEEvent as TrendSSEEvent,
  PredictionStats,
} from './trend';