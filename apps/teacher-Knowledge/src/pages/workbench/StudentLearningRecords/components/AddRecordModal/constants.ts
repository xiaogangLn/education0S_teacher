// constants.ts
import type { AddRecordFormData, LessonPlanOption } from './types';


export const mockLessonPlans: LessonPlanOption[] = [
  { id: 'lp-001', title: '导数的几何意义', subject: '数学' },
  { id: 'lp-002', title: '二次函数单元', subject: '数学' },
  { id: 'lp-003', title: '英语阅读理解', subject: '英语' },
  { id: 'lp-004', title: '三角函数', subject: '数学' },
];

export const initialFormData: AddRecordFormData = {
  selectedLessonPlan: '',
  uploadedFiles: [],
  documentTitle: '',
  exerciseType: 'upload',
  exerciseFiles: [],
  aiPrompt: '',
  aiGeneratedContent: '',
  aiGenerating: false,
  aiProgress: 0,
};