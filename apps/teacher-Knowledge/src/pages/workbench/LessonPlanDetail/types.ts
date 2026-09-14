// types.ts
export interface LessonPlanDetail {
    id: string;
    title: string;
    subject: string;
    grade: string;
    className: string;
   课时: number;
    status: 'draft' | 'reviewing' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    version: number;
    content: {
      objectives: string[];
      keyPoints: string[];
      difficulties: string[];
      schedule: string[];
      notes?: string;
    };
    resources: Resource[];
    thoughts: Thought[];
    stats: {
      totalStudents: number;
      totalQuestions: number;
      personalizedQuestions: number;
      coverage: number;
    };
  }
  
  export interface Resource {
    id: string;
    name: string;
    type: 'ppt' | 'video' | 'pdf' | 'doc' | 'link';
    url?: string;
    size?: string;
  }
  
  export interface Thought {
    id: string;
    type: 'core' | 'key' | 'design' | 'personalized' | 'note';
    title: string;
    content: string;
    createdAt: string;
    tags?: string[];
  }
  
  export interface TabType {
    key: 'detail' | 'plan' | 'thoughts';
    label: string;
    icon?: React.ReactNode;
  }