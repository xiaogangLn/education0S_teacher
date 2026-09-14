import { useState, useEffect, useCallback } from 'react';
import type { StudentPortrait } from '../types';
import { studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { message } from 'antd';

function mapPortrait(detail: any, portrait: any, scores: any[]): StudentPortrait {
  const student = detail?.student || detail || {};
  const academic = portrait?.academic || student.portraits?.academic || {};
  const subjects = academic.subjects || {};
  const scoreRows = Object.keys(subjects).length
    ? Object.entries(subjects).map(([subject, value]: [string, any]) => ({
        subject,
        score: Number(value.score || 0),
        classAverage: Number(value.class_average || value.score || 0),
        rank: Number(value.rank || 0),
      }))
    : scores.map((item) => ({
        subject: item.subject || '综合',
        score: Number(item.score || 0),
        classAverage: Number(item.score || 0),
        rank: 0,
      }));
  const exams = scores.map((item) => ({
    name: item.title || item.name,
    subject: item.subject,
    score: Number(item.score || 0),
    classAverage: Number(item.total_score || 100),
    rank: 0,
  }));
  const abilitiesSource = portrait?.abilities || student.abilities || {};
  const abilities = Array.isArray(abilitiesSource)
    ? abilitiesSource.map((item: any) => ({ label: item.label || item.name, value: Number(item.value || 0) }))
    : Object.entries(abilitiesSource).map(([label, value]) => ({ label, value: Number(value || 0) }));
  const hotErrors = Array.isArray(portrait?.hot_errors) ? portrait.hot_errors : [];
  return {
    student: {
      id: student.id,
      name: student.name || portrait?.student_name,
      grade: student.grade_name || '',
      class: student.class_name || portrait?.class_name || '',
      studentNo: student.student_no,
      status: (student.mastery_rate || 0) >= 85 ? 'excellent' : (student.mastery_rate || 0) >= 70 ? 'good' : 'warning',
      rank: student.rank || 0,
      totalStudents: student.total_students || 0,
    },
    transfers: (student.transfer_history || []).map((item: any) => ({
      date: String(item.transfer_date || '').slice(0, 10),
      fromClass: item.from_class,
      toClass: item.to_class,
    })),
    scores: scoreRows,
    exams,
    wrongQuestions: hotErrors.map((item: any) => ({
      name: item.name || item.title || '错题',
      errorCount: item.errorCount || item.count || 0,
      masteryRate: item.masteryRate || item.mastery || 0,
      level: item.level || 'normal',
    })),
    abilities,
    masteryRate: Math.round(Number(portrait?.overall_mastery || student.mastery_rate || 0)),
    masteryTrend: Number(academic.trend === 'up' ? 8 : academic.trend === 'down' ? -6 : 0),
    midtermScore: scoreRows[0]?.score || 0,
    finalScore: scoreRows[1]?.score || scoreRows[0]?.score || 0,
    strengths: student.strengths || academic.strengths || [],
    weaknesses: student.weaknesses || academic.weaknesses || [],
  };
}

export const useStudentPortrait = (studentId?: string) => {
  const [loading, setLoading] = useState(!!studentId);
  const [portrait, setPortrait] = useState<StudentPortrait | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [DrawerOpen, setDrawerOpen] = useState<boolean>(false);

  const fetchPortrait = useCallback(async () => {
    if (!studentId) {
      setError('未指定学生');
      setPortrait(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detailRes, portraitRes, scoreRes] = await Promise.all([
        studentsService.getDetail(studentId),
        studentsService.getPortrait(studentId).catch(() => ({ data: {} })),
        studentsService.getScores(studentId).catch(() => ({ data: { items: [] } })),
      ]);
      const detail = extractPayload<any>(detailRes);
      const portraitData = extractPayload<any>(portraitRes);
      const scores = extractPayload<{ items: any[] }>(scoreRes)?.items || [];
      setPortrait(mapPortrait(detail, portraitData, scores));
    } catch {
      setError('获取学生画像失败');
      setPortrait(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const exportReport = useCallback(async () => {
    if (!portrait) return;
    const blob = new Blob([JSON.stringify(portrait, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `学情报告-${portrait.student.name || studentId}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    message.success(`已导出 ${portrait.student.name} 的学情报告`);
  }, [portrait, studentId]);

  const generateStudyPlan = useCallback(async () => {
    setDrawerOpen(true);
  }, []);

  const sendToParent = useCallback(async () => {
    if (!portrait) return;
    const text = [
      `${portrait.student.name} 学情摘要`,
      `班级：${portrait.student.class || '-'}`,
      `掌握度：${portrait.masteryRate}%`,
      `优势：${(portrait.strengths || []).join('、') || '暂无'}`,
      `薄弱：${(portrait.weaknesses || []).join('、') || '暂无'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      message.success('学情摘要已复制，可粘贴发给家长');
    } catch {
      message.info(text);
    }
  }, [portrait]);

  useEffect(() => {
    fetchPortrait();
  }, [fetchPortrait]);

  return {
    loading,
    portrait,
    error,
    DrawerOpen,
    setDrawerOpen,
    fetchPortrait,
    exportReport,
    generateStudyPlan,
    sendToParent,
  };
};
