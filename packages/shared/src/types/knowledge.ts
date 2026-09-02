// packages/shared/src/types/knowledge.ts
// ============================================================
// 知识库相关类型定义
// ============================================================

import { PermissionLevel, FileType, PaginationParams, FilterParams } from './common';
import { User } from './user';

/** 知识库文档 */
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: FileType;
  category: string;
  tags: string[];
  permission: PermissionLevel;
  creatorId: string;
  creator: User;
  schoolId?: string;
  gradeId?: string;
  classId?: string;
  fileSize?: number;
  fileUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isFavorite: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** 知识库文件夹 */
export interface KnowledgeFolder {
  id: string;
  name: string;
  parentId?: string;
  permission: PermissionLevel;
  creatorId: string;
  creator: User;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 知识库评论 */
export interface KnowledgeComment {
  id: string;
  itemId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

/** 知识库版本 */
export interface KnowledgeVersion {
  id: string;
  itemId: string;
  version: number;
  content: string;
  changeLog: string;
  authorId: string;
  author: User;
  createdAt: string;
}

/** 创建知识项请求 */
export interface CreateKnowledgeRequest {
  title: string;
  content: string;
  type: FileType;
  category: string;
  tags?: string[];
  permission: PermissionLevel;
  gradeId?: string;
  classId?: string;
  fileUrl?: string;
}

/** 更新知识项请求 */
export interface UpdateKnowledgeRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  permission?: PermissionLevel;
  gradeId?: string;
  classId?: string;
}

/** 知识库查询参数 */
export interface KnowledgeQueryParams extends PaginationParams, FilterParams {
  type?: FileType;
  permission?: PermissionLevel;
  category?: string;
  creatorId?: string;
  gradeId?: string;
  classId?: string;
  status?: 'draft' | 'published' | 'archived';
  isFavorite?: boolean;
}

/** 知识库统计 */
export interface KnowledgeStats {
  total: number;
  byType: Record<FileType, number>;
  byPermission: Record<PermissionLevel, number>;
  byCategory: Record<string, number>;
  myCreated: number;
  favorites: number;
  storageUsed: number;
  storageTotal: number;
}