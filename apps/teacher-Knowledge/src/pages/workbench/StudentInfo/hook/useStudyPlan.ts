import { useState, useEffect, useCallback } from 'react';
import type { StudyPlan } from '../types/studyPlan';
import { portraitService, studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const useStudyPlan = (studentId?: string) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [detailRes, recRes] = await Promise.all([
        studentsService.getDetail(id),
        portraitService.getRecommendations(id),
      ]);
      const detail = extractPayload<any>(detailRes)?.student || extractPayload<any>(detailRes);
      const recPayload = extractPayload<{ recommendations?: string[] }>(recRes);
      const recommendations = recPayload?.recommendations || [];
      const today = new Date();
      const days = recommendations.slice(0, 6).map((text, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return {
          date: date.toISOString().slice(0, 10),
          dayOfWeek: WEEKDAYS[date.getDay()],
          status: index === 0 ? 'in_progress' : 'pending',
          tasks: [
            {
              id: `${id}-${index}`,
              title: text,
              status: index === 0 ? 'in_progress' : 'pending',
              progress: index === 0 ? 40 : 0,
              targetKnowledge: detail?.weaknesses?.[0] || '综合复习',
            },
          ],
        } as const;
      });
      const totalCount = days.reduce((sum, day) => sum + day.tasks.length, 0);
      setPlan({
        studentName: detail?.name || '学生',
        studentClass: detail?.class_name || '',
        grade: detail?.grade_name || '',
        overallProgress: Math.round(Number(detail?.mastery_rate || 0)),
        completedCount: 0,
        totalCount,
        estimatedDaysLeft: Math.max(days.length, 1),
        days: days as unknown as StudyPlan['days'],
      });
    } catch {
      setError('获取学习计划失败');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendToStudent = useCallback(async () => {}, []);
  const sendToParent = useCallback(async () => {}, []);
  const adjustPlan = useCallback(async () => {}, []);
  const viewFullReport = useCallback(() => {}, []);

  useEffect(() => {
    fetchPlan(studentId);
  }, [studentId, fetchPlan]);

  return {
    loading,
    plan,
    error,
    fetchPlan,
    sendToStudent,
    sendToParent,
    adjustPlan,
    viewFullReport,
  };
};
