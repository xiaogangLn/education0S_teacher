// packages/ui/src/components/MarkdownRenderer/TypewriterEffect.tsx
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTypewriter } from './hooks/useTypewriter';
import { defaultCustomComponents } from './CustomComponents';

interface TypewriterEffectProps {
  content: string;
  speed?: number;
  showCursor?: boolean;
  autoStart?: boolean;
  onComplete?: () => void;
  customComponents?: Record<string, React.ComponentType<any>>;
  className?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  content,
  speed = 30,
  showCursor = true,
  autoStart = true,
  onComplete,
  customComponents = {},
  className = '',
}) => {
  const { displayText, startTyping, isComplete, cursorVisible } = useTypewriter({
    speed,
    showCursor,
    autoStart,
    onComplete,
  });

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startTyping(content);
    }
  }, [autoStart, content, startTyping]);

  // 当内容变化时重新开始
  useEffect(() => {
    if (content && autoStart) {
      hasStartedRef.current = true;
      startTyping(content);
    }
  }, [content, autoStart, startTyping]);

  const components = { ...defaultCustomComponents, ...customComponents };

  return (
    <div className={`typewriter-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components as any}
      >
        {displayText}
      </ReactMarkdown>
      {showCursor && !isComplete && (
        <span className={`cursor ${cursorVisible ? 'visible' : 'hidden'}`}>|</span>
      )}
    </div>
  );
};