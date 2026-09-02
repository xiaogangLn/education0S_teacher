// hooks/useSSEPrediction.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PredictionStep, PredictionParams } from '../types';
import { mockStepsData } from '../constants';

export const useSSEPrediction = (params: PredictionParams) => {
  const [steps, setSteps] = useState<PredictionStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<any | null>(null);

  const startPrediction = useCallback(() => {
    // 重置状态
    setSteps([]);
    setProgress(0);
    setError(null);
    setIsStreaming(true);

    // 模拟 SSE 流式数据（实际项目中使用 EventSource）
    let index = 0;
    const totalSteps = mockStepsData.length;

    intervalRef.current = setInterval(() => {
      if (index >= totalSteps) {
        clearInterval(intervalRef.current!);
        setIsStreaming(false);
        setProgress(100);
        return;
      }

      const stepData = mockStepsData[index];
      // 替换模板变量
      const content = stepData.content.replace(/{grade}/g, params.grade).replace(/{subject}/g, params.subject);

      const newStep: PredictionStep = {
        id: `step-${Date.now()}-${index}`,
        ...stepData,
        content,
        timestamp: new Date().toLocaleTimeString(),
        status: 'done',
      };

      setSteps((prev) => [...prev, newStep]);
      setProgress(((index + 1) / totalSteps) * 100);
      index++;
    }, 600);
  }, [params]);

  const stopPrediction = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // 真实 SSE 接口版本（注释掉，保留供参考）
  // const startPredictionReal = useCallback(() => {
  //   setSteps([]);
  //   setProgress(0);
  //   setError(null);
  //   setIsStreaming(true);
  //
  //   const url = `/api/predict/stream?grade=${encodeURIComponent(params.grade)}&subject=${encodeURIComponent(params.subject)}&weeks=${params.weeks}`;
  //   const eventSource = new EventSource(url);
  //   eventSourceRef.current = eventSource;
  //
  //   eventSource.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === 'step') {
  //         setSteps(prev => [...prev, {
  //           id: `step-${Date.now()}`,
  //           ...data.step,
  //           timestamp: new Date().toLocaleTimeString(),
  //           status: 'done',
  //         }]);
  //       } else if (data.type === 'progress') {
  //         setProgress(data.progress);
  //       } else if (data.type === 'complete') {
  //         setIsStreaming(false);
  //         eventSource.close();
  //       } else if (data.type === 'error') {
  //         setError(data.message);
  //         setIsStreaming(false);
  //         eventSource.close();
  //       }
  //     } catch (err) {
  //       console.error('解析 SSE 数据失败:', err);
  //     }
  //   };
  //
  //   eventSource.onerror = () => {
  //     setError('SSE 连接中断，请重试');
  //     setIsStreaming(false);
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close();
  //       eventSourceRef.current = null;
  //     }
  //   };
  // }, [params]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    steps,
    isStreaming,
    progress,
    error,
    startPrediction,
    stopPrediction,
  };
};