// constants/index.ts

import {type StudentStatus } from '../types';

/** 状态映射 */
export const STATUS_MAP: Record<StudentStatus, { label: string; color: string }> = {
  excellent: { label: '优秀', color: 'purple' },
  good: { label: '良好', color: 'green' },
  pending: { label: '待巩固', color: 'gold' },
  remedial: { label: '需补习', color: 'red' },
};

/** 掌握度等级 */
export const getMasteryLevel = (value: number): 'success' | 'normal' | 'exception' => {
  if (value >= 70) return 'success';
  if (value >= 50) return 'normal';
  return 'exception';
};

/** 掌握度颜色 */
export const getMasteryColor = (value: number): string => {
  if (value >= 70) return '#10b981';
  if (value >= 50) return '#f59e0b';
  return '#ef4444';
};

/** 掌握度文字颜色 */
export const getMasteryTextColor = (value: number): string => {
  if (value >= 70) return 'text-green-600';
  if (value >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

/** 换班记录 Tag 颜色 */
export const getTransferTagColor = (count: number): 'red' | 'gold' | 'default' => {
  if (count >= 3) return 'red';
  if (count >= 2) return 'gold';
  return 'default';
};