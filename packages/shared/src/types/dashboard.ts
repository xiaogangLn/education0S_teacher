// packages/shared/src/types/dashboard.ts
// ============================================================
// 仪表盘/领导视图相关类型定义
// ============================================================

/** 年级趋势数据 */
export interface GradeTrend {
    grade: string;
    masteryRate: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }
  
  /** 班级学情数据 */
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
  
  /** 仪表盘统计数据 */
  export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    averageMastery: number;
    pendingReviews: number;
    completionRate: number;
  }
  
  /** 仪表盘查询参数 */
  export interface DashboardQueryParams {
    grade?: string;
    subject?: string;
    timeRange?: 'week' | 'month' | 'semester';
    startDate?: string;
    endDate?: string;
  }
  
  /** 领导视图数据 */
  export interface LeaderViewData {
    stats: DashboardStats;
    gradeTrends: GradeTrend[];
    classDetails: ClassDetail[];
    alerts: AlertItem[];
  }
  
  /** 预警项 */
  export interface AlertItem {
    id: string;
    type: 'warning' | 'danger' | 'info';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    source: string;
    createdAt: string;
    resolved: boolean;
  }