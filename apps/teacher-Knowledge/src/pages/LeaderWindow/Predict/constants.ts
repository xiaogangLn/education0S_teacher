// constants.ts
import type { ReportRecord, FilterState } from './types';

export const mockReportData: ReportRecord[] = [
  { id: '1', grade: '七年级', className: '七年级1班', subject: '数学', masteryRate: 84, excellentRate: 36, improvementRate: 8, weekChange: 2.1, trend: 'up' },
  { id: '2', grade: '七年级', className: '七年级2班', subject: '数学', masteryRate: 80, excellentRate: 30, improvementRate: 10, weekChange: 1.5, trend: 'up' },
  { id: '3', grade: '七年级', className: '七年级3班', subject: '数学', masteryRate: 76, excellentRate: 28, improvementRate: 14, weekChange: 0.8, trend: 'up' },
  { id: '4', grade: '七年级', className: '七年级4班', subject: '数学', masteryRate: 70, excellentRate: 22, improvementRate: 18, weekChange: -0.5, trend: 'down' },
  { id: '5', grade: '八年级', className: '八年级1班', subject: '数学', masteryRate: 72, excellentRate: 24, improvementRate: 16, weekChange: -0.8, trend: 'down' },
  { id: '6', grade: '八年级', className: '八年级2班', subject: '数学', masteryRate: 78, excellentRate: 28, improvementRate: 12, weekChange: 1.2, trend: 'up' },
  { id: '7', grade: '八年级', className: '八年级3班', subject: '数学', masteryRate: 74, excellentRate: 26, improvementRate: 14, weekChange: 0.3, trend: 'stable' },
  { id: '8', grade: '八年级', className: '八年级4班', subject: '数学', masteryRate: 68, excellentRate: 20, improvementRate: 20, weekChange: -1.2, trend: 'down' },
  { id: '9', grade: '九年级', className: '九年级1班', subject: '数学', masteryRate: 78, excellentRate: 32, improvementRate: 12, weekChange: 3.2, trend: 'up' },
  { id: '10', grade: '九年级', className: '九年级2班', subject: '数学', masteryRate: 65, excellentRate: 24, improvementRate: 18, weekChange: 0.5, trend: 'stable' },
  { id: '11', grade: '九年级', className: '九年级3班', subject: '数学', masteryRate: 82, excellentRate: 38, improvementRate: 8, weekChange: 4.0, trend: 'up' },
  { id: '12', grade: '九年级', className: '九年级4班', subject: '数学', masteryRate: 58, excellentRate: 16, improvementRate: 28, weekChange: -2.5, trend: 'down' },
  { id: '13', grade: '七年级', className: '七年级1班', subject: '语文', masteryRate: 82, excellentRate: 34, improvementRate: 10, weekChange: 1.8, trend: 'up' },
  { id: '14', grade: '七年级', className: '七年级2班', subject: '语文', masteryRate: 78, excellentRate: 30, improvementRate: 12, weekChange: 1.2, trend: 'up' },
  { id: '15', grade: '八年级', className: '八年级1班', subject: '语文', masteryRate: 76, excellentRate: 28, improvementRate: 14, weekChange: -0.3, trend: 'down' },
  { id: '16', grade: '八年级', className: '八年级2班', subject: '语文', masteryRate: 80, excellentRate: 32, improvementRate: 10, weekChange: 0.6, trend: 'up' },
  { id: '17', grade: '九年级', className: '九年级1班', subject: '语文', masteryRate: 75, excellentRate: 30, improvementRate: 14, weekChange: 2.0, trend: 'up' },
  { id: '18', grade: '九年级', className: '九年级2班', subject: '语文', masteryRate: 62, excellentRate: 22, improvementRate: 20, weekChange: -1.0, trend: 'down' },
  { id: '19', grade: '七年级', className: '七年级1班', subject: '英语', masteryRate: 80, excellentRate: 32, improvementRate: 12, weekChange: 1.5, trend: 'up' },
  { id: '20', grade: '七年级', className: '七年级2班', subject: '英语', masteryRate: 76, excellentRate: 28, improvementRate: 14, weekChange: 0.8, trend: 'up' },
  { id: '21', grade: '八年级', className: '八年级1班', subject: '英语', masteryRate: 70, excellentRate: 24, improvementRate: 18, weekChange: -0.5, trend: 'down' },
  { id: '22', grade: '八年级', className: '八年级2班', subject: '英语', masteryRate: 74, excellentRate: 26, improvementRate: 16, weekChange: 0.3, trend: 'stable' },
  { id: '23', grade: '九年级', className: '九年级1班', subject: '英语', masteryRate: 72, excellentRate: 28, improvementRate: 16, weekChange: 1.8, trend: 'up' },
  { id: '24', grade: '九年级', className: '九年级2班', subject: '英语', masteryRate: 60, excellentRate: 20, improvementRate: 22, weekChange: -1.5, trend: 'down' },
];

export const gradeOptions = ['全部班级', '七年级', '八年级', '九年级'];
export const subjectOptions = ['全部学科', '数学', '语文', '英语', '物理', '化学'];
export const dimensionOptions = ['全部维度', '掌握度', '优秀率', '待提升率'];

export const PAGE_SIZE = 8;