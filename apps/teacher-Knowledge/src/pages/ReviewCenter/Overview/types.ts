// types.ts
export interface ReviewItem {
    id: string;
    title: string;
    author: string;
    grade: string;
    className: string;
    subject: string;
   课时: number;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'modified';
    submittedAt: string;
    description: string;
    rejectReason?: string;
    aiGenerated: boolean;
  }
  
  export interface ReviewStats {
    pending: number;
    approved: number;
    rejected: number;
    reviewing: number;
    passRate: number;
    avgDuration: number;
  }
  
  export interface FilterState {
    keyword: string;
    subject: string;
    class: string;
    sortBy: string;
  }
  
  export interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    type: 'approve' | 'suggestion' | 'reject' | 'system';
  }
  
  export interface ReviewDetail extends ReviewItem {
    content: {
      objectives: string[];
      keyPoints: string[];
      schedule: string[];
      notes?: string;
    };
    comments: Comment[];
    timeline: TimelineItem[];
  }
  
  export interface TimelineItem {
    id: string;
    type: 'submit' | 'approve' | 'suggestion' | 'reject' | 'modify';
    author: string;
    content: string;
    createdAt: string;
  }