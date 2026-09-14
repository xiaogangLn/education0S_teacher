export interface FileItem {
    id: string;
    name: string;
    type: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'image' | 'link' | 'folder' | 'word' | 'ppt';
    category: string;
    size?: string;
    updatedAt: string;
    creator: string;
    permission: 'school' | 'grade' | 'class' | 'personal';
  }
  
  export interface FileTypeIcon {
    icon: React.ReactNode;
    label: string;
    color: string;
  }
  
  export type FilePermission = 'school' | 'grade' | 'class' | 'personal';
  
  export interface LeftPanelProps {
    onFileSelect?: (selectedIds: string[]) => void;
    onFileClick?: (file: FileItem) => void;
    className?: string;
  }

  export interface LeftPanelProps {
    onFileSelect?: (selectedIds: string[]) => void;
    onFileClick?: (file: FileItem) => void;
    onSelectedFiles?: (files: FileItem[]) => void;  // 新增：选中文件回调
    initialPlannedFiles?: FileItem[];
    historyMode?: boolean;
    className?: string;
  }