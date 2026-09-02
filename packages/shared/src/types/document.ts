// packages/shared/src/types/document.ts
// ============================================================
// 文档相关类型定义
// ============================================================

import { PermissionLevel, FileType, PaginationParams, FilterParams } from './common';
import { User } from './user';

/** 文档 */
export interface Document {
  id: string;
  title: string;
  content: string;
  type: FileType;
  category: string;
  author: string;
  authorId: string;
  authorInfo?: User;
  permission: PermissionLevel;
  gradeId?: string;
  classId?: string;
  fileSize?: number;
  fileUrl?: string;
  updatedAt: string;
  createdAt: string;
  viewCount: number;
  downloadCount: number;
  isFavorite: boolean;
  status: 'draft' | 'published' | 'archived';
}

/** 创建文档请求 */
export interface CreateDocumentRequest {
  title: string;
  content: string;
  type: FileType;
  category: string;
  permission: PermissionLevel;
  gradeId?: string;
  classId?: string;
  fileUrl?: string;
}

/** 更新文档请求 */
export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  category?: string;
  permission?: PermissionLevel;
  gradeId?: string;
  classId?: string;
}

/** 文档查询参数 */
export interface DocumentQueryParams extends PaginationParams, FilterParams {
  type?: FileType;
  permission?: PermissionLevel;
  category?: string;
  authorId?: string;
  gradeId?: string;
  classId?: string;
  status?: 'draft' | 'published' | 'archived';
  isFavorite?: boolean;
}

/** 文档统计 */
export interface DocumentStats {
  total: number;
  byType: Record<FileType, number>;
  byPermission: Record<PermissionLevel, number>;
  myCreated: number;
  favorites: number;
}