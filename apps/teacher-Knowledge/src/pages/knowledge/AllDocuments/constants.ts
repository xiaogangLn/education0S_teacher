// constants.ts
import type { Document, StatsData } from './types';

export const mockDocuments: Document[] = [
  { id: '1', title: '校本课程纲要 · 2026版', type: 'pdf', category: '校本课程', author: '教务处', updatedAt: '2026-08-25 09:00', permission: 'school' },
  { id: '2', title: '开学第一课 · 校长致辞', type: 'video', category: '德育', author: '校长室', updatedAt: '2026-08-24 14:30', permission: 'school' },
  { id: '3', title: '2026届教学计划 · 数学', type: 'document', category: '教学计划', author: '张老师', updatedAt: '2026-08-30 14:20', permission: 'grade' },
  { id: '4', title: '英语听力训练 · 高二年级', type: 'audio', category: '英语', author: '赵老师', updatedAt: '2026-08-26 15:40', permission: 'grade' },
  { id: '5', title: '月考成绩分析 · 九年级1班', type: 'sheet', category: '成绩', author: '李老师', updatedAt: '2026-08-29 16:00', permission: 'class' },
  { id: '6', title: '班级通知 · 家长会安排', type: 'document', category: '通知', author: '王老师', updatedAt: '2026-08-28 11:00', permission: 'class' },
  { id: '7', title: '数学教研组 · 集体备课记录', type: 'document', category: '教研', author: '教研组长', updatedAt: '2026-08-27 10:30', permission: 'research' },
  { id: '8', title: '教研组共享 · 教学资源导航', type: 'link', category: '资源', author: '王老师', updatedAt: '2026-08-24 11:20', permission: 'research' },
  { id: '9', title: '二次函数教案 · 个人草稿', type: 'document', category: '教案', author: '张老师', updatedAt: '2026-08-28 22:10', permission: 'personal' },
  { id: '10', title: '个人教学录像 · 导数概念', type: 'video', category: '教学录像', author: '张老师', updatedAt: '2026-08-21 16:20', permission: 'personal' },
  { id: '11', title: '学校年度工作计划', type: 'document', category: '计划', author: '校办', updatedAt: '2026-08-20 09:00', permission: 'school' },
  { id: '12', title: '年级月考安排表', type: 'sheet', category: '考试', author: '年级组', updatedAt: '2026-08-19 14:00', permission: 'grade' },
];

export const mockStats: StatsData = {
  school: 18,
  grade: 32,
  class: 46,
  research: 12,
  personal: 20,
  total: 128,
};

export const PAGE_SIZE = 8;