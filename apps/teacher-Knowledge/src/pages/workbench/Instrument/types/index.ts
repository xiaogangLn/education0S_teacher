// types/index.ts
export type TemplateType = '教案模板' | '课件模板' | '试卷模板' | 'PDF' | 'Doc' | 'Excel' | 'Mp3' | 'Mp4';

export interface TemplateItem {
  title: TemplateType;
  icon: React.ReactNode;
  tag: '校本资源' | '个人文件' | '教研组';
  hasSteps: boolean; // 是否有五阶段步骤
}

export interface StepData {
  id: string;
  title: string;
  type: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'confirm';
  content: string;
  status: 'pending' | 'processing' | 'completed';
  confirmable?: boolean;
  confirmText?: string;
}