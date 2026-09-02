// packages/ui/src/components/MarkdownRenderer/CustomComponents.tsx
import React from 'react';
import { Tag, Alert } from 'antd';
import { CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';


// 自定义代码块组件
export const CodeBlock: React.FC<{ language?: string; children: string }> = ({ language, children }) => {
  return (
    <div className="code-block">
      {language && (
        <div className="code-block-header">
          <span className="code-block-language">{language}</span>
        </div>
      )}
      <pre className="code-block-content">
        <code>{children}</code>
      </pre>
    </div>
  );
};

// AI 生成标注组件
export const AIAnnotation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="ai-annotation">
      <Tag color="purple" icon={<InfoCircleOutlined />}>
        🤖 AI 生成
      </Tag>
      <div className="ai-annotation-content">{children}</div>
    </div>
  );
};

// 教师修改标注组件
export const TeacherEdit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="teacher-edit">
      <Tag color="orange" icon={<InfoCircleOutlined />}>
        ✏️ 教师修改
      </Tag>
      <div className="teacher-edit-content">{children}</div>
    </div>
  );
};

// 确认标注组件
export const ConfirmTag: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Tag color="success" icon={<CheckCircleOutlined />}>
      {children || '✅ 已确认'}
    </Tag>
  );
};

// 提示框组件
export const Callout: React.FC<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}> = ({ type = 'info', title, children }) => {
  const typeMap = {
    info: { color: 'blue', icon: <InfoCircleOutlined /> },
    success: { color: 'green', icon: <CheckCircleOutlined /> },
    warning: { color: 'gold', icon: <WarningOutlined /> },
    error: { color: 'red', icon: <WarningOutlined /> },
  };
  const config = typeMap[type];
  
  return (
    <Alert
      message={title}
      description={children}
      type={type}
      icon={config.icon}
      showIcon
      className="my-2"
    />
  );
};

// 步骤确认组件
export const StepConfirm: React.FC<{
  onConfirm: () => void;
  onModify?: () => void;
  onRegenerate?: () => void;
  confirmText?: string;
}> = ({ onConfirm, onRegenerate, confirmText = '确认进入下一阶段' }) => {
  return (
    <div className="step-actions">
      <button className="btn btn-primary" onClick={onConfirm}>
        ✅ {confirmText}
      </button>
      <button className="btn btn-outline" onClick={onRegenerate}>
        🔄 重新生成
      </button>
      <p className='desc'>不满意可以继续对话调整</p>
    </div>
  );
};

// 自定义组件映射
export const defaultCustomComponents = {
  code: CodeBlock,
  ai: AIAnnotation,
  teacher: TeacherEdit,
  confirm: ConfirmTag,
  callout: Callout,
  stepConfirm: StepConfirm,
};