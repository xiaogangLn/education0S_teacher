// constants.ts
import type { DocumentMetadata } from './types';

export const DEFAULT_DOCUMENT: DocumentMetadata = {
  id: 'doc-001',
  title: '导数的几何意义与切线方程',
  author: '张老师',
  createdAt: '2026-09-02 14:35',
  updatedAt: '2026-09-02 14:35',
  source: '高二(3)班 · 数学',
  difficulty: 'medium',
  knowledgePoints: ['导数的几何意义', '切线方程', '极限思想'],
  permission: 'grade',
  status: 'draft',
  version: 3,
};

export const TOOLBAR_GROUPS = [
  {
    id: 'format',
    items: [
      { id: 'heading', label: 'H', shortcut: '⌘+H', icon: 'H' },
      { id: 'bold', label: '粗体', shortcut: '⌘+B', icon: 'B' },
      { id: 'italic', label: '斜体', shortcut: '⌘+I', icon: 'I' },
      { id: 'underline', label: '下划线', shortcut: '⌘+U', icon: 'U' },
      { id: 'strike', label: '删除线', shortcut: '⌘+Shift+S', icon: 'S' },
    ],
  },
  {
    id: 'list',
    items: [
      { id: 'bulletList', label: '列表', shortcut: '⌘+Shift+8', icon: '•' },
      { id: 'orderedList', label: '编号', shortcut: '⌘+Shift+7', icon: '1.' },
      { id: 'taskList', label: '任务', shortcut: '⌘+Shift+9', icon: '☑' },
    ],
  },
  {
    id: 'insert',
    items: [
      { id: 'image', label: '图片', shortcut: '', icon: '📷' },
      { id: 'link', label: '链接', shortcut: '⌘+K', icon: '🔗' },
      { id: 'math', label: '公式', shortcut: '', icon: '∑' },
    ],
  },
  {
    id: 'ai',
    items: [
      { id: 'aiGenerate', label: 'AI生成', shortcut: '', icon: '🤖' },
      { id: 'aiPolish', label: 'AI润色', shortcut: '', icon: '✨' },
    ],
  },
];