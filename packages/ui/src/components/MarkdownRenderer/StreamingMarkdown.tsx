import React, { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { defaultCustomComponents } from './CustomComponents';
import { markdownRemarkPlugins, markdownRehypePlugins } from './markdownPlugins';
import { stabilizeStreamingMarkdown } from './stabilizeStreamingMarkdown';

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  customComponents?: Record<string, React.ComponentType<any>>;
  className?: string;
  /** 流式时自动滚到底 */
  autoScroll?: boolean;
}

/** ChatGPT 风格流式 Markdown：稳定半截语法 + 末尾光标 + 可选自动滚动 */
export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming = false,
  customComponents = {},
  className = '',
  autoScroll = true,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const components = useMemo(
    () => ({ ...defaultCustomComponents, ...customComponents }),
    [customComponents],
  );

  const safeContent = useMemo(
    () => stabilizeStreamingMarkdown(content, isStreaming),
    [content, isStreaming],
  );

  useEffect(() => {
    if (!isStreaming || !autoScroll) return;
    endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [safeContent, isStreaming, autoScroll]);

  if (!safeContent.trim() && isStreaming) {
    return (
      <div className={`streaming-markdown ${className}`}>
        <span className="stream-caret" aria-hidden />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`streaming-markdown${isStreaming ? ' is-streaming' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={components as any}
      >
        {safeContent}
      </ReactMarkdown>
      {isStreaming ? <span className="stream-caret" aria-hidden /> : null}
      <div ref={endRef} />
    </div>
  );
};
