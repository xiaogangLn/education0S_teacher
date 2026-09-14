import { useState, useCallback } from 'react';
import type { LearningRecord } from '../types';
import { learningService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import type { RecordDetailMode } from '../components/RecordDetail';

function mapDetail(record: LearningRecord, detail: any): LearningRecord {
  return {
    ...record,
    title: detail.assignment_title || detail.title || record.title,
    images: detail.images || record.images,
    teacherFeedback: detail.teacher_feedback || record.teacherFeedback,
    aiResult: detail.ai_result || record.aiResult,
    classEvaluation: detail.class_evaluation || record.classEvaluation,
    section: detail.section || record.section,
    commonCount: detail.common_count ?? record.commonCount,
    personalizedCount: detail.personalized_count ?? record.personalizedCount,
    commonQuestions: detail.common_questions || record.commonQuestions || [],
    personalizedQuestions: detail.personalized_questions || record.personalizedQuestions || [],
    score: detail.score ?? record.score,
    totalScore: detail.total_score ?? record.totalScore,
  };
}

export const useRecordDetail = () => {
  const [selectedRecord, setSelectedRecord] = useState<LearningRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RecordDetailMode>('view');
  const [isAddHistory, setIsAddHistory] = useState<boolean>(false);

  const loadAndOpen = useCallback(async (record: LearningRecord, nextMode: RecordDetailMode) => {
    setLoading(true);
    try {
      const payload = extractPayload<{ record: any }>(await learningService.getDetail(record.id));
      const detail = payload?.record || record;
      setSelectedRecord(mapDetail(record, detail));
      setMode(nextMode);
      setDetailVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDetail = useCallback((record: LearningRecord) => loadAndOpen(record, 'view'), [loadAndOpen]);
  const openSubmit = useCallback((record: LearningRecord) => loadAndOpen(record, 'submit'), [loadAndOpen]);
  const openGrade = useCallback((record: LearningRecord) => loadAndOpen(record, 'grade'), [loadAndOpen]);
  const openImages = useCallback((record: LearningRecord) => loadAndOpen(record, 'images'), [loadAndOpen]);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedRecord(null);
  }, []);

  const confirmGrading = useCallback(async (recordId: string, data?: { score?: number; feedback?: string }) => {
    setLoading(true);
    try {
      await learningService.grade(recordId, {
        scores: {},
        teacher_score: data?.score,
        feedback: data?.feedback || '批改完成',
      });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitHomework = useCallback(async (recordId: string, data: { images: string[]; comment: string; rating: number }) => {
    setLoading(true);
    try {
      await learningService.submit(recordId, {
        images: data.images,
        answers: {},
        class_evaluation: data.comment ? { rating: data.rating || 0, comment: data.comment } : undefined,
      });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    selectedRecord,
    detailVisible,
    loading,
    mode,
    isAddHistory,
    setIsAddHistory,
    openDetail,
    openSubmit,
    openGrade,
    openImages,
    closeDetail,
    confirmGrading,
    submitHomework,
  };
};
