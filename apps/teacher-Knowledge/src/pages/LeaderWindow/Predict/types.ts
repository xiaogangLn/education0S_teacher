// types.ts
export interface ReportRecord {
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
  
  export interface ReportStats {
    totalRecords: number;
    averageMastery: number;
    maxMastery: number;
    minMastery: number;
    upTrendCount: number;
    downTrendCount: number;
  }