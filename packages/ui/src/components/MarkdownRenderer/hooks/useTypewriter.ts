// packages/ui/src/components/MarkdownRenderer/hooks/useTypewriter.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  showCursor?: boolean;
  autoStart?: boolean;
  onComplete?: () => void;
}

export const useTypewriter = (options: UseTypewriterOptions = {}) => {
  const {
    speed = 30,
    showCursor = true,
    autoStart = true,
    onComplete,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const fullTextRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 光标闪烁
  useEffect(() => {
    if (showCursor) {
      cursorTimerRef.current = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 500);
    }
    return () => {
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, [showCursor]);

  // 打字效果
  const startTyping = useCallback((text: string) => {
    // 清除之前的计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    fullTextRef.current = text;
    setDisplayText('');
    setIsTyping(true);
    setIsComplete(false);

    let index = 0;
    timerRef.current = setInterval(() => {
      if (index < text.length) {
        // 支持 emoji 和中文（按字符逐个显示）
        const char = text[index];
        setDisplayText((prev) => prev + char);
        index++;
      } else {
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, speed);
  }, [speed, onComplete]);

  // 停止打字
  const stopTyping = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // 立即显示完整内容
  const skipTyping = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayText(fullTextRef.current);
    setIsTyping(false);
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  // 重置
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayText('');
    setIsTyping(false);
    setIsComplete(false);
    fullTextRef.current = '';
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, []);

  return {
    displayText,
    isTyping,
    isComplete,
    cursorVisible,
    startTyping,
    stopTyping,
    skipTyping,
    reset,
    fullText: fullTextRef.current,
  };
};