// constants.ts
import type { GradeTrend, ClassDetail } from './types';

export const mockGradeTrends: GradeTrend[] = [
  { grade: '七年级', masteryRate: 82, change: 4.2, trend: 'up' },
  { grade: '八年级', masteryRate: 75, change: 2.1, trend: 'up' },
  { grade: '九年级', masteryRate: 78.5, change: 3.2, trend: 'up' },
];

export const mockClassDetails: ClassDetail[] = [
  { id: '1', grade: '七年级', className: '七年级1班', subject: '数学', masteryRate: 84, excellentRate: 36, improvementRate: 8, weekChange: 2.1, trend: 'up' },
  { id: '2', grade: '七年级', className: '七年级2班', subject: '数学', masteryRate: 80, excellentRate: 30, improvementRate: 10, weekChange: 1.5, trend: 'up' },
  { id: '3', grade: '八年级', className: '八年级1班', subject: '数学', masteryRate: 72, excellentRate: 24, improvementRate: 16, weekChange: -0.8, trend: 'down' },
  { id: '4', grade: '八年级', className: '八年级2班', subject: '数学', masteryRate: 78, excellentRate: 28, improvementRate: 12, weekChange: 1.2, trend: 'up' },
  { id: '5', grade: '九年级', className: '九年级1班', subject: '数学', masteryRate: 78, excellentRate: 32, improvementRate: 12, weekChange: 3.2, trend: 'up' },
  { id: '6', grade: '九年级', className: '九年级2班', subject: '数学', masteryRate: 65, excellentRate: 24, improvementRate: 18, weekChange: 0.5, trend: 'stable' },
  { id: '7', grade: '九年级', className: '九年级3班', subject: '数学', masteryRate: 82, excellentRate: 38, improvementRate: 8, weekChange: 4.0, trend: 'up' },
  { id: '8', grade: '九年级', className: '九年级4班', subject: '数学', masteryRate: 58, excellentRate: 16, improvementRate: 28, weekChange: -2.5, trend: 'down' },
];

export const gradeOptions = ['全部年级', '七年级', '八年级', '九年级'];
export const subjectOptions = ['全部学科', '数学', '语文', '英语', '物理', '化学'];
export const dimensionOptions = ['全部维度', '掌握度', '优秀率', '待提升率'];

export const PAGE_SIZE = 8;