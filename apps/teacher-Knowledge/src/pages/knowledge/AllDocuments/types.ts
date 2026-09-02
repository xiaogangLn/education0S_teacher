// types.ts
export interface Document {
    id: string;
    title: string;
    type: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'link';
    category: string;
    author: string;
    updatedAt: string;
    permission: 'school' | 'grade' | 'class' | 'research' | 'personal';
    size?: string;
  }
  
  export interface StatsData {
    school: number;
    grade: number;
    class: number;
    research: number;
    personal: number;
    total: number;
  }
  
  export interface FilterState {
    keyword: string;
    permission: 'all' | 'school' | 'grade' | 'class' | 'research' | 'personal';
    viewMode: 'list' | 'grid';
  }
  
  export type PermissionType = 'school' | 'grade' | 'class' | 'research' | 'personal';
  
  export const PERMISSION_CONFIG: Record<PermissionType, { label: string; icon: string; badge: string; color: string }> = {
    school: { label: '学校', icon: '🏛️', badge: 'badge-school', color: 'bg-green-100 text-green-700' },
    grade: { label: '年级', icon: '📚', badge: 'badge-grade', color: 'bg-purple-100 text-purple-700' },
    class: { label: '班级', icon: '🏫', badge: 'badge-class', color: 'bg-blue-100 text-blue-700' },
    research: { label: '教研组', icon: '👥', badge: 'badge-research', color: 'bg-yellow-100 text-yellow-700' },
    personal: { label: '个人', icon: '👤', badge: 'badge-personal', color: 'bg-red-100 text-red-700' },
  };
  
  export const FILE_TYPE_ICONS: Record<Document['type'], string> = {
    document: '📄',
    sheet: '📊',
    video: '📹',
    audio: '🎵',
    pdf: '📎',
    link: '🔗',
  };
  
  export const FILE_TYPE_LABELS: Record<Document['type'], string> = {
    document: '文档',
    sheet: '表格',
    video: '视频',
    audio: '音频',
    pdf: 'PDF',
    link: '链接',
  };