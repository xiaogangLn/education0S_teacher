// constants.ts
import type { Document, Category, Activity, Stats, Todo } from './types';

export const mockDocuments: Document[] = [
  { id: '1', title: '2026届教学计划 · 数学', author: '张老师', updatedAt: '2026-08-30 14:20', type: 'document', category: '数学', permission: 'grade' },
  { id: '2', title: '月考成绩分析 · 九年级1班', author: '李老师', updatedAt: '2026-08-29 16:00', type: 'sheet', category: '数学', permission: 'class' },
  { id: '3', title: '二次函数教案 · 个人草稿', author: '张老师', updatedAt: '2026-08-28 22:10', type: 'document', category: '数学', permission: 'personal' },
  { id: '4', title: '函数图像动态演示 · 教学视频', author: '张老师', updatedAt: '2026-08-27 10:30', type: 'video', category: '数学', permission: 'school' },
];

export const mockCategories: Category[] = [
  { id: '1', name: '数学', count: 42 },
  { id: '2', name: '英语', count: 18 },
  { id: '3', name: '物理', count: 9 },
  { id: '4', name: '化学', count: 6 },
  { id: '5', name: '生物', count: 5 },
  { id: '6', name: '政治', count: 4 },
  { id: '7', name: '历史', count: 3 },
  { id: '8', name: '地理', count: 2 },
  { id: '9', name: '音乐', count: 1 },
  { id: '10', name: '美术', count: 1 },
  { id: '11', name: '体育', count: 1 },
  { id: '12', name: '其他', count: 1 },
];

export const mockActivities: Activity[] = [
  { id: '1', user: '张老师', action: '新建了文档', target: '导数的几何意义', time: '2026-08-30 14:35', type: 'create' },
  { id: '2', user: '李老师', action: '更新了成绩表', target: '月考分析', time: '2026-08-30 13:20', type: 'update' },
  { id: '3', user: '王老师', action: '更新了课程表', target: '新学期安排', time: '2026-08-30 11:00', type: 'update' },
  { id: '4', user: '系统', action: '自动同步了', target: '3条教育局信息', time: '2026-08-30 08:00', type: 'sync' },
];

export const mockStats: Stats = {
  total: 128,
  myCreated: 34,
  favorites: 12,
  pending: 8,
};

export const mockTodos: Todo[] = [
  { id: '1', title: '审批教案 · 导数的几何意义', type: 'approve', priority: 'high' },
  { id: '2', title: '确认拍照批改 · 李四', type: 'confirm', priority: 'medium' },
];

export const permissionLabels = {
  school: { label: '学校', color: 'bg-green-100 text-green-700' },
  grade: { label: '年级', color: 'bg-purple-100 text-purple-700' },
  class: { label: '班级', color: 'bg-blue-100 text-blue-700' },
  research: { label: '教研组', color: 'bg-yellow-100 text-yellow-700' },
  personal: { label: '个人', color: 'bg-red-100 text-red-700' },
};

export const permissionCounts = {
  school: 18,
  grade: 32,
  class: 46,
  personal: 32,
};