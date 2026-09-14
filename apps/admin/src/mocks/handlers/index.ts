// packages/shared/src/mocks/handlers/index.ts
import { authHandlers } from './auth';
import { usersHandlers } from './users';
import { studentsHandlers } from './students';
import { knowledgeHandlers } from './knowledge';
import { processingHandlers } from './processing';
import { learningHandlers } from './learning';
import { reviewHandlers } from './review';
import { portraitHandlers } from './portrait';
import { predictionHandlers } from './prediction';
import { dashboardHandlers } from './dashboard';
import { assignmentHandlers } from './assignment';
import { classroomHandlers } from './classroom';
import { infoSyncHandlers } from './info-sync';

// 统一延迟模拟
export const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 分页工具
export const paginate = <T>(items: T[], page: number = 1, pageSize: number = 20) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    page_size: pageSize,
  };
};

// 成功响应
export const success = <T>(data: T, message: string = 'success') => ({
  code: 0,
  message,
  data,
  timestamp: new Date().toISOString(),
});

// 错误响应
export const error = (code: number, message: string) => ({
  code,
  message,
  data: null,
  timestamp: new Date().toISOString(),
});

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...studentsHandlers,
  ...knowledgeHandlers,
  ...processingHandlers,
  ...learningHandlers,
  ...reviewHandlers,
  ...portraitHandlers,
  ...predictionHandlers,
  ...dashboardHandlers,
  ...assignmentHandlers,
  ...classroomHandlers,
  ...infoSyncHandlers,
];