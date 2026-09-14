// types.ts
export interface ExamQuestion {
    id: string;
    number: number;
    type: 'choice' | 'fill' | 'answer';
    content: string;
    options?: string[];
    score: number;
    answer?: string;
    studentAnswer?: string;
    isCorrect?: boolean;
  }
  
  export interface ExamDetail {
    id: string;
    name: string;
    lessonPlanId: string;
    lessonPlanTitle: string;
    grade: string;
    className: string;
    subject: string;
    totalScore: number;
    questionTypes: {
      type: string;
      count: number;
      score: number;
    }[];
    version: number;
    status: 'draft' | 'reviewing' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    estimatedTime: number;
    questions: ExamQuestion[];
    isAIGenerated: boolean;
  }