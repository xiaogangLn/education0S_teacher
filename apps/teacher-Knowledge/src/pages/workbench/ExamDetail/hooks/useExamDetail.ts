import { useState, useEffect, useCallback } from 'react';
import type { ExamDetail } from '../types';
import { processingService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { artifactDisplayName } from '@/utils/artifactName';
import { message } from 'antd';

export const useExamDetail = (examId: string) => {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const payload = extractPayload<{ task: any }>(await processingService.getDetail(examId));
      const task = payload?.task || payload;
      const questions = (task.content || []).map((item: any, index: number) => ({
        id: item.id || `q${index}`,
        number: index + 1,
        type: 'answer' as const,
        content: item.content || item.title,
        score: 10,
      }));
      setExam({
        id: task.id,
        name: artifactDisplayName(task.title || task.topic, 'exam'),
        lessonPlanId: task.id,
        lessonPlanTitle: artifactDisplayName(task.title || task.topic, 'exam'),
        grade: '',
        className: '',
        subject: task.subject,
        totalScore: questions.reduce((sum, q) => sum + q.score, 0) || 100,
        questionTypes: [{ type: '解答', count: questions.length, score: questions.length * 10 }],
        version: task.version || 1,
        status: task.status === 'approved' ? 'published' : 'draft',
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        estimatedTime: 45,
        questions,
        isAIGenerated: true,
      });
    } catch {
      setError('加载试卷失败');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    exam,
    error,
    downloadExam: () => message.success('已准备下载当前试卷内容'),
    previewExam: () => message.info('请在页面中预览题目'),
    shareExam: () => message.success('分享链接已复制（演示）'),
    getStatusBadge: () => ({ color: 'processing', label: exam?.status }),
    reload: load,
  };
};
