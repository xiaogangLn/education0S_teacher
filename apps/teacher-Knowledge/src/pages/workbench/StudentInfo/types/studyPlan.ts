export interface StudyPlanTask {
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'in_progress' | 'pending';
    progress?: number;
    accuracy?: number;
    targetKnowledge?: string;
  }
  
  export interface StudyPlanDay {
    date: string;
    dayOfWeek: string;
    tasks: StudyPlanTask[];
    status: 'completed' | 'in_progress' | 'pending';
  }
  
  export interface StudyPlan {
    studentName: string;
    studentClass: string;
    grade: string;
    overallProgress: number;
    completedCount: number;
    totalCount: number;
    estimatedDaysLeft: number;
    days: StudyPlanDay[];
  }