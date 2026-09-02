// constants.ts
import type { ExportScope, ExportFormatOption, TimeRangeOption, ExportOption } from './types';

export const defaultScopes: ExportScope[] = [
  { id: 'academic', label: '全年级学情数据', checked: true, description: '各班级掌握度、优秀率、趋势' },
  { id: 'teacher', label: '教师教学数据', checked: true, description: '教学计划、教师画像' },
  { id: 'student', label: '学生详细信息', checked: false, description: '成绩、画像、成长轨迹' },
  { id: 'plan', label: '教学计划审核记录', checked: false, description: '审核历史、批注记录' },
];

export const formatOptions: ExportFormatOption[] = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: '📊', extension: 'xlsx' },
  { id: 'pdf', label: 'PDF', icon: '📄', extension: 'pdf' },
  { id: 'csv', label: 'CSV', icon: '📋', extension: 'csv' },
  { id: 'json', label: 'JSON', icon: '📦', extension: 'json' },
];

export const timeRangeOptions: TimeRangeOption[] = [
  { id: '1month', label: '近1个月', value: '30' },
  { id: '3months', label: '近3个月', value: '90' },
  { id: '6months', label: '近6个月', value: '180' },
  { id: '1year', label: '近1年', value: '365' },
];

export const exportOptions: ExportOption[] = [
  { id: 'summary', title: '学情汇总', description: '全年级掌握度', icon: '📊', enabled: true },
  { id: 'teacherData', title: '教师数据', description: '教学计划/画像', icon: '👨‍🏫', enabled: true },
  { id: 'studentData', title: '学生数据', description: '成绩/画像/轨迹', icon: '🧑‍🎓', enabled: true },
  { id: 'trendReport', title: '趋势报告', description: '6周趋势分析', icon: '📈', enabled: true },
];

export const EXPORT_COLORS = {
  excel: 'bg-green-50 border-green-200 hover:border-green-400',
  pdf: 'bg-red-50 border-red-200 hover:border-red-400',
  csv: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  json: 'bg-purple-50 border-purple-200 hover:border-purple-400',
};