import type { Document } from '@/pages/knowledge/KnowledgeBase/types';

const DOC_TYPES = ['document', 'sheet', 'video', 'audio', 'pdf', 'link'] as const;

export function formatDateTime(value?: string | Date) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 16);
}

export function normalizePermission(permission?: string): Document['permission'] {
  if (permission === 'private') return 'personal';
  if (permission === 'public') return 'school';
  if (permission === 'school' || permission === 'grade' || permission === 'class' || permission === 'personal' || permission === 'research') {
    return permission;
  }
  return 'personal';
}

export function mapKnowledgeDocument(item: any): Document {
  const type = DOC_TYPES.includes(item?.type) ? item.type : 'document';
  return {
    id: item.id,
    title: item.title || '未命名文档',
    author: item.creator_name || item.creator?.name || item.author || '',
    updatedAt: formatDateTime(item.updated_at || item.updatedAt || item.created_at || item.createdAt),
    type,
    category: item.category || item.subject || '其他',
    permission: normalizePermission(item.permission),
  };
}

export function extractPayload<T = any>(response: any): T {
  return (response?.data ?? response) as T;
}
