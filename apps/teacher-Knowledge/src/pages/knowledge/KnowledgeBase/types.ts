// types.ts
export interface Document {
    id: string;
    title: string;
    author: string;
    updatedAt: string;
    type: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'link';
    category: string;
    permission: 'school' | 'grade' | 'class' | 'personal' | 'research';
  }
  
  export interface Category {
    id: string;
    name: string;
    count: number;
    icon?: string;
  }
  
  export interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    type: 'create' | 'update' | 'approve' | 'sync';
  }
  
  export interface Stats {
    total: number;
    myCreated: number;
    favorites: number;
    pending: number;
    storageUsed: number;
    storageLimit: number;
  }
  
  export interface Todo {
    id: string;
    title: string;
    type: 'approve' | 'confirm' | 'import';
    priority: 'high' | 'medium' | 'low';
    href?: string;
  }