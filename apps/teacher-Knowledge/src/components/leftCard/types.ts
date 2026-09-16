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
    onUploadedFilesChange?: (files: FileItem[]) => void; // 上传文件变化回调（含未勾选，用于任务归属）
    initialPlannedFiles?: FileItem[];
    initialUploadedFiles?: FileItem[]; // 历史任务期间上传的素材：回显但默认不勾选
    taskId?: string; // 当前加工任务 id，上传文件据此关联
    historyMode?: boolean;
    className?: string;
  }