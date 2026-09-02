// packages/shared/src/api/knowledge.ts
// ============================================================
// 知识库 API
// ============================================================

import { httpClient } from './client';
import {
  KnowledgeItem,
  KnowledgeFolder,
  KnowledgeComment,
  KnowledgeVersion,
  CreateKnowledgeRequest,
  UpdateKnowledgeRequest,
  KnowledgeQueryParams,
  KnowledgeStats,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const BASE_URL = '/knowledge';

export const knowledgeApi = {
  // 获取知识项列表
  getList: (params: KnowledgeQueryParams): Promise<ApiResponse<PaginatedResponse<KnowledgeItem>>> => {
    return httpClient.get(BASE_URL, { params });
  },

  // 获取知识项详情
  getDetail: (id: string): Promise<ApiResponse<KnowledgeItem>> => {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // 创建知识项
  create: (data: CreateKnowledgeRequest): Promise<ApiResponse<KnowledgeItem>> => {
    return httpClient.post(BASE_URL, data);
  },

  // 更新知识项
  update: (id: string, data: UpdateKnowledgeRequest): Promise<ApiResponse<KnowledgeItem>> => {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // 删除知识项
  delete: (id: string): Promise<ApiResponse<void>> => {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },

  // 收藏/取消收藏
  toggleFavorite: (id: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return httpClient.post(`${BASE_URL}/${id}/favorite`);
  },

  // 获取统计信息
  getStats: (): Promise<ApiResponse<KnowledgeStats>> => {
    return httpClient.get(`${BASE_URL}/stats`);
  },

  // 获取文件夹列表
  getFolders: (parentId?: string): Promise<ApiResponse<KnowledgeFolder[]>> => {
    return httpClient.get(`${BASE_URL}/folders`, { params: { parentId } });
  },

  // 创建文件夹
  createFolder: (data: { name: string; parentId?: string; permission: string }): Promise<ApiResponse<KnowledgeFolder>> => {
    return httpClient.post(`${BASE_URL}/folders`, data);
  },

  // 获取评论列表
  getComments: (itemId: string): Promise<ApiResponse<KnowledgeComment[]>> => {
    return httpClient.get(`${BASE_URL}/${itemId}/comments`);
  },

  // 添加评论
  addComment: (itemId: string, content: string, parentId?: string): Promise<ApiResponse<KnowledgeComment>> => {
    return httpClient.post(`${BASE_URL}/${itemId}/comments`, { content, parentId });
  },

  // 获取版本历史
  getVersions: (itemId: string): Promise<ApiResponse<KnowledgeVersion[]>> => {
    return httpClient.get(`${BASE_URL}/${itemId}/versions`);
  },

  // 恢复到指定版本
  restoreVersion: (itemId: string, versionId: string): Promise<ApiResponse<KnowledgeItem>> => {
    return httpClient.post(`${BASE_URL}/${itemId}/versions/${versionId}/restore`);
  },

  // 上传文件
  uploadFile: (file: File, data: Partial<CreateKnowledgeRequest>): Promise<ApiResponse<KnowledgeItem>> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
    return httpClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};