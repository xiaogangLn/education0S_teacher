// packages/ui/src/components/MarkdownRenderer/types.ts
export interface MarkdownRendererProps {
    /** Markdown 内容 */
    content: string;
    /** 是否启用打字机效果 */
    typewriter?: boolean;
    /** 打字速度 (ms/字符) */
    typingSpeed?: number;
    /** 是否显示光标 */
    showCursor?: boolean;
    /** 是否自动开始 */
    autoStart?: boolean;
    /** 完成回调 */
    onComplete?: () => void;
    /** 每步完成回调 */
    onStepComplete?: (step: number) => void;
    /** 自定义组件映射 */
    customComponents?: Record<string, React.ComponentType<any>>;
    /** 额外类名 */
    className?: string;
  }
  
  export interface StepRendererProps {
    /** 步骤数据 */
    steps: StepData[];
    /** 当前步骤索引 */
    currentStep: number;
    /** 步骤完成回调 */
    onStepComplete: (stepIndex: number) => void;
    /** 是否启用打字机效果 */
    typewriter?: boolean;
    /** 打字速度 */
    typingSpeed?: number;
    /** 自定义组件 */
    customComponents?: Record<string, React.ComponentType<any>>;
  }
  
  export interface StepData {
    /** 步骤ID */
    id: string;
    /** 步骤标题 */
    title: string;
    /** 步骤类型 */
    type: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'confirm';
    /** 步骤内容 (Markdown) */
    content: string;
    /** 步骤状态 */
    status: 'pending' | 'processing' | 'completed';
    /** 是否可确认 */
    confirmable?: boolean;
    /** 确认按钮文本 */
    confirmText?: string;
    /** 额外操作 */
    actions?: StepAction[];
  }
  
  export interface StepAction {
    key: string;
    label: string;
    type: 'primary' | 'default' | 'success' | 'warning' | 'danger';
    icon?: React.ReactNode;
    onClick: (step: StepData) => void;
  }
  
  export interface TypewriterOptions {
    /** 打字速度 (ms/字符) */
    speed?: number;
    /** 是否显示光标 */
    showCursor?: boolean;
    /** 是否自动开始 */
    autoStart?: boolean;
    /** 完成回调 */
    onComplete?: () => void;
  }