import { useState, useEffect, useCallback } from 'react';
import type { GradeRecord, GradeStats } from '../types';
import { examService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

export const useGradeRecords = (studentId?: string, classId?: string) => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [stats, setStats] = useState<GradeStats>({ total: 0, average: 0, improvement: 0, uploadedImages: 0 });
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    score: '',
    subject: '数学',
    date: new Date().toISOString().slice(0, 10),
    images: [] as string[],
  });

  const loadGrades = useCallback(async () => {
    if (!studentId) {
      setGrades([]);
      return;
    }
    setLoading(true);
    try {
      const payload = extractPayload<{ items: any[] }>(await examService.getStudent(studentId));
      const items = (payload?.items || []).map((item) => ({
        id: item.id,
        name: item.title || item.name,
        subject: item.subject,
        score: Number(item.score || 0),
        totalScore: Number(item.total_score || 100),
        date: String(item.exam_date || item.date || '').slice(0, 10),
        images: [],
        createdAt: item.created_at,
      }));
      setGrades(items);
    } catch {
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const submitGrade = useCallback(async (data: typeof formData) => {
    if (!studentId) return false;
    setLoading(true);
    try {
      const [score, total] = String(data.score).split('/').map((v) => Number(v));
      await examService.create({
        student_id: studentId,
        class_id: classId,
        subject: data.subject,
        title: data.name,
        score: score || Number(data.score) || 0,
        total_score: total || 100,
        exam_date: data.date,
      });
      setFormVisible(false);
      setFormData({
        name: '',
        score: '',
        subject: '数学',
        date: new Date().toISOString().slice(0, 10),
        images: [],
      });
      await loadGrades();
      return true;
    } finally {
      setLoading(false);
    }
  }, [studentId, classId, loadGrades]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const totalCount = grades.length;
  const averageScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.totalScore) * 100, 0) / grades.length)
    : 0;

  return {
    grades,
    stats: { ...stats, total: totalCount, average: averageScore },
    loading,
    formVisible,
    formData,
    setFormData,
    setFormVisible,
    submitGrade,
    refresh: loadGrades,
  };
};
