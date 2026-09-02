// types.ts
export interface DocumentMetadata {
    id: string;
    title: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    difficulty: 'easy' | 'medium' | 'hard';
    knowledgePoints: string[];
    permission: 'school' | 'grade' | 'class' | 'personal';
    status: 'draft' | 'reviewing' | 'published';
    version: number;
  }
  
  export interface DocumentContent {
    json: any;
    html: string;
    text: string;
    wordCount: number;
    knowledgePointCount: number;
  }
  
  export interface EditorState {
    content: DocumentContent;
    metadata: DocumentMetadata;
    isSaving: boolean;
    lastSavedAt: string | null;
    collaborators: string[];
    outline: OutlineItem[];
  }
  
  export interface OutlineItem {
    id: string;
    level: 1 | 2 | 3;
    text: string;
    children?: OutlineItem[];
  }
  
  export type PermissionType = 'school' | 'grade' | 'class' | 'personal';
  
  export const PERMISSION_CONFIG: Record<PermissionType, { label: string; icon: string; desc: string }> = {
    school: { label: '学校级', icon: '🏛️', desc: '全校师生可见' },
    grade: { label: '年级级', icon: '📚', desc: '本年级师生可见' },
    class: { label: '班级级', icon: '🏫', desc: '本班级师生可见' },
    personal: { label: '个人级', icon: '👤', desc: '仅本人可见' },
  };