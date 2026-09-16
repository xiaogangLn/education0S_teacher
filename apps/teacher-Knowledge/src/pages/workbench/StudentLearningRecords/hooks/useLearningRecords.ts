import { useState, useEffect, useCallback } from 'react';
import type { LearningRecord } from '../types';
import { learningService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

function mapRecord(item: any): LearningRecord {
  return {
    id: item.id,
    title: item.assignment_title || item.title,
    subject: item.subject || '',
    className: item.class_name || '',
    lessonPlanId: item.lesson_plan_id,
    lessonPlanTitle: item.lesson_plan_title,
    status: item.status,
    createdAt: item.created_at,
    submittedAt: item.submitted_at,
    gradedAt: item.graded_at,
    score: item.score,
    totalScore: item.total_score,
    masteryRate: item.mastery_rate,
    images: item.images || [],
    teacherFeedback: item.teacher_feedback,
    aiResult: item.ai_result,
    classEvaluation: item.class_evaluation,
    section: item.section,
    commonCount: item.common_count,
    personalizedCount: item.personalized_count,
    commonQuestions: item.common_questions,
    personalizedQuestions: item.personalized_questions,
  };
}

// 并发生成可能写入重复记录（同一教案+同一标题多条），列表按 教案+标题 去重，保留最新一条
function dedupeRecords(items: LearningRecord[]): LearningRecord[] {
  const seen = new Set<string>();
  const result: LearningRecord[] = [];
  for (const item of items) {
    const key = item.lessonPlanId && item.title ? `${item.lessonPlanId}|${item.title}` : item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export const useLearningRecords = (studentId?: string) => {
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');

  const loadRecords = useCallback(async () => {
    if (!studentId) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      const payload = extractPayload<{ items: any[] }>(await learningService.getList({ student_id: studentId, page: 1, page_size: 50 }));
      setRecords(dedupeRecords((payload?.items || []).map(mapRecord)));
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const filteredRecords = records.filter((record) => {
    if (filter === 'all') return true;
    if (filter === 'graded') return record.status === 'graded';
    return record.status === 'pending' || record.status === 'submitted';
  });

  const stats = {
    total: records.length,
    graded: records.filter((r) => r.status === 'graded').length,
    pending: records.filter((r) => r.status === 'pending' || r.status === 'submitted').length,
  };

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records: filteredRecords,
    allRecords: records,
    stats,
    loading,
    filter,
    setFilter,
    refresh: loadRecords,
  };
};
