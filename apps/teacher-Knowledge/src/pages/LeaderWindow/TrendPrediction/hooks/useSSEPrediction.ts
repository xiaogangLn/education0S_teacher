import { useState, useRef, useCallback } from 'react';
import type { PredictionStep, PredictionParams } from '../types';
import { predictionService } from '@api/index';

function mapType(type?: string): PredictionStep['type'] {
  if (type === 'alert' || type === 'warning') return 'warning';
  if (type === 'advice' || type === 'suggestion') return 'suggestion';
  if (type === 'compute' || type === 'calculation') return 'calculation';
  if (type === 'analysis') return 'analysis';
  return 'info';
}

function toStep(data: any, index: number): PredictionStep {
  return {
    id: `${Date.now()}-${index}`,
    type: mapType(data?.type),
    title: String(data?.title || '步骤'),
    content: String(data?.content || ''),
    timestamp: new Date().toLocaleTimeString(),
    status: 'done',
  };
}

async function loadReportFallback(params: PredictionParams): Promise<PredictionStep[]> {
  const report: any = await predictionService.getReport({
    grade: params.grade,
    subject: params.subject,
    weeks: params.weeks as 4 | 8 | 12,
    enrollment_year: params.enrollment_year,
  });
  const summary = report?.data?.summary || report?.summary || {};
  return [
    {
      id: 'analysis',
      type: 'analysis',
      title: '学情扫描',
      content: `已汇总 ${summary.cohort_label || params.grade} ${summary.subject || params.subject}：${summary.student_count || 0} 名学生，平均掌握度 ${summary.avg_mastery ?? '--'}%。`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'done',
    },
    {
      id: 'compute',
      type: 'calculation',
      title: '趋势计算',
      content: summary.student_count
        ? `预计 ${summary.weeks || params.weeks} 周后掌握度约 ${summary.forecast_mastery ?? '--'}%。优秀 ${summary.excellent_count ?? 0} 人，薄弱 ${summary.weak_count ?? 0} 人。`
        : '缺少掌握度样本，无法计算趋势。',
      timestamp: new Date().toLocaleTimeString(),
      status: 'done',
    },
    {
      id: 'alert',
      type: 'warning',
      title: '预警',
      content: Array.isArray(summary.alerts) && summary.alerts.length
        ? summary.alerts.map((item: string) => `- ${item}`).join('\n')
        : '当前届别未发现高危预警。',
      timestamp: new Date().toLocaleTimeString(),
      status: 'done',
    },
    {
      id: 'advice',
      type: 'suggestion',
      title: '建议',
      content: summary.advice || '暂无建议',
      timestamp: new Date().toLocaleTimeString(),
      status: 'done',
    },
  ];
}

export const useSSEPrediction = (params: PredictionParams) => {
  const [steps, setSteps] = useState<PredictionStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopPrediction = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const startPrediction = useCallback(async () => {
    setSteps([]);
    setProgress(0);
    setError(null);
    setIsStreaming(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const token = localStorage.getItem('accessToken');
      const query = new URLSearchParams({
        grade: params.grade,
        subject: params.subject,
        weeks: String(params.weeks),
        ...(params.enrollment_year ? { enrollment_year: params.enrollment_year } : {}),
      }).toString();
      const response = await fetch(`/api/v1/predict/stream?${query}`, {
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortRef.current.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      const isEventStream = contentType.includes('text/event-stream');

      if (!response.ok || !response.body || !isEventStream) {
        const fallback = await loadReportFallback(params);
        setSteps(fallback);
        setProgress(100);
        if (!response.ok) {
          setError(`流式接口不可用（${response.status}），已改用报告接口`);
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let stepIndex = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          const eventLine = chunk.split('\n').find((line) => line.startsWith('event:'));
          const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
          if (!dataLine) continue;
          const eventName = eventLine?.replace(/^event:\s*/, '').trim() || 'step';
          let data: any;
          try {
            data = JSON.parse(dataLine.replace(/^data:\s*/, ''));
          } catch {
            continue;
          }
          if (eventName === 'error') {
            throw new Error(data?.message || '预测流错误');
          }
          if (eventName === 'done') {
            if (typeof data?.progress === 'number') setProgress(data.progress);
            continue;
          }
          setSteps((prev) => [...prev, toStep(data, stepIndex++)]);
          if (typeof data.progress === 'number') setProgress(data.progress);
        }
      }
      setProgress(100);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      try {
        const fallback = await loadReportFallback(params);
        setSteps(fallback);
        setProgress(100);
        setError(`${err?.message || '流式预测失败'}，已改用报告接口`);
      } catch (fallbackErr: any) {
        setError(fallbackErr?.message || err?.message || '预测失败');
      }
    } finally {
      setIsStreaming(false);
    }
  }, [params.grade, params.subject, params.weeks, params.enrollment_year]);

  return { steps, isStreaming, progress, error, startPrediction, stopPrediction };
};
