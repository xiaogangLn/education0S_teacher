// packages/ui/src/components/MarkdownRenderer/index.tsx
import React from 'react';
import type { MarkdownRendererProps } from './types';
import { TypewriterEffect } from './TypewriterEffect';
import { defaultCustomComponents } from './CustomComponents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  typewriter = false,
  typingSpeed = 30,
  showCursor = true,
  autoStart = true,
  onComplete,
  customComponents = {},
  className = '',
}) => {
  const components = { ...defaultCustomComponents, ...customComponents };

  if (typewriter) {
    return (
      <TypewriterEffect
        content={content}
        speed={typingSpeed}
        showCursor={showCursor}
        autoStart={autoStart}
        onComplete={onComplete}
        customComponents={components}
        className={className}
      />
    );
  }

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// 导出 StepRenderer 用于教案生成场景
export { StepRenderer } from './StepRenderer';
export { defaultCustomComponents } from './CustomComponents';
export * from './types';
export * from './hooks/useTypewriter';
export * from './hooks/useStepRenderer';

export default MarkdownRenderer;