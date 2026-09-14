// types.ts
export interface LearningRecord {
    id: string;
    title: string;
    subject: string;
    className: string;
    lessonPlanId: string;
    lessonPlanTitle: string;
    status: 'pending' | 'submitted' | 'graded';
    createdAt: string;
    submittedAt?: string;
    gradedAt?: string;
    score?: number;
    totalScore?: number;
    masteryRate?: number;
    timeSpent?: number;
    images?: string[];
    teacherFeedback?: string;
    aiResult?: AIResult;
    classEvaluation?: ClassEvaluation;
    section?: 'in_class' | 'homework';
    commonCount?: number;
    personalizedCount?: number;
    commonQuestions?: LearningQuestion[];
    personalizedQuestions?: LearningQuestion[];
  }

  export interface LearningQuestion {
    id: string;
    content: string;
    type?: 'choice' | 'fill' | 'answer';
    score?: number;
    options?: string[];
    answer?: string;
    knowledge_point?: string;
  }
  
  export interface AIResult {
    score: number;
    totalScore: number;
    level: string;
    basicScore: number;
    basicTotal: number;
    basicAccuracy: number;
    advancedScore: number;
    advancedTotal: number;
    advancedAccuracy: number;
    errors: { question: string; reason: string }[];
  }
  
  export interface ClassEvaluation {
    rating: number;
    comment: string;
    teacher: string;
    createdAt: string;
    type: string;
  }
  
  export interface GradeRecord {
    id: string;
    name: string;
    subject: string;
    score: number;
    totalScore: number;
    date: string;
    images: string[];
    createdAt: string;
  }
  
  export interface GradeStats {
    total: number;
    average: number;
    improvement: number;
    uploadedImages: number;
  }