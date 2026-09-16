// packages/ui/src/components/MarkdownRenderer/index.tsx
import React from 'react';
import type { MarkdownRendererProps } from './types';
import { TypewriterEffect } from './TypewriterEffect';
import { defaultCustomComponents } from './CustomComponents';
import ReactMarkdown from 'react-markdown';
import { markdownRemarkPlugins, markdownRehypePlugins } from './markdownPlugins';

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
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={components as any}
      >
        {content}
      </ReactMarkdown>
      <style>{`
        .markdown-renderer {
          font-size: 17px;
          line-height: 1.85;
          color: #1f2937;
        }
        .markdown-renderer h1 { font-size: 24px; font-weight: 700; margin: 16px 0 10px; }
        .markdown-renderer h2 { font-size: 20px; font-weight: 650; margin: 14px 0 8px; }
        .markdown-renderer h3 { font-size: 18px; font-weight: 600; margin: 12px 0 6px; }
        .markdown-renderer p { margin: 10px 0; }
        .markdown-renderer ul, .markdown-renderer ol { padding-left: 26px; margin: 10px 0 14px; }
        /* Tailwind preflight 会全局隐藏列表序号/圆点，内容区必须恢复 */
        .markdown-renderer ul { list-style: disc outside; }
        .markdown-renderer ol { list-style: decimal outside; }
        .markdown-renderer li { margin: 8px 0; line-height: 1.85; }
        .markdown-renderer table { font-size: 16px; }
        .markdown-renderer .katex { font-size: 1.15em; }
      `}</style>
    </div>
  );
};

export { StepRenderer } from './StepRenderer';
export { StreamingMarkdown } from './StreamingMarkdown';
export { stabilizeStreamingMarkdown } from './stabilizeStreamingMarkdown';
export { defaultCustomComponents } from './CustomComponents';
export * from './types';
export * from './hooks/useTypewriter';
export * from './hooks/useStepRenderer';

export default MarkdownRenderer;