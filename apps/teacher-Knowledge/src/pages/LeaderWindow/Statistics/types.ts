// types.ts
export interface GradeTrend {
  grade: string;
  masteryRate: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ClassDetail {
  id: string;
  grade: string;
  className: string;
  subject: string;
  masteryRate: number;
  excellentRate: number;
  improvementRate: number;
  weekChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FilterState {
  grade: string;
  subject: string;
  dimension: string;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export type ExportFormat = 'excel' | 'pdf' | 'csv';