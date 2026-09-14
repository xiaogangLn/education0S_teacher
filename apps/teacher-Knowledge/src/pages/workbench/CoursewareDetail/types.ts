// types.ts
export interface Slide {
    id: string;
    page: number;
    title: string;
    icon: string;
    content?: string;
  }
  
  export interface CoursewareDetail {
    id: string;
    name: string;
    lessonPlanId: string;
    lessonPlanTitle: string;
    grade: string;
    className: string;
    subject: string;
    totalPages: number;
    fileSize: string;
    format: 'pptx' | 'pdf' | 'keynote';
    status: 'draft' | 'reviewing' | 'published' | 'archived';
    version: number;
    createdAt: string;
    updatedAt: string;
    slides: Slide[];
    isAIGenerated: boolean;
    aiPrompt?: string;
  }