import { useState, useEffect, useCallback } from 'react';
import type { StudentPortrait } from '../types';

// 模拟数据
const mockPortraitData: StudentPortrait = {
  student: {
    id: '1',
    name: '张三',
    grade: '2026届',
    class: '九年级1班',
    studentNo: '001',
    status: 'good',
    rank: 12,
    totalStudents: 45,
  },
  transfers: [
    { date: '2026-08-15', fromClass: '九年级2班', toClass: '九年级1班' },
    { date: '2026-03-01', fromClass: '八年级3班', toClass: '九年级2班' },
  ],
  scores: [
    { subject: '数学', score: 85, classAverage: 78, rank: 8 },
    { subject: '物理', score: 82, classAverage: 76, rank: 10 },
    { subject: '语文', score: 76, classAverage: 72, rank: 15 },
    { subject: '英语', score: 62, classAverage: 70, rank: 28 },
    { subject: '化学', score: 58, classAverage: 65, rank: 32 },
  ],
  exams: [
    { name: '期末考试', subject: '数学', score: 92, classAverage: 80, rank: 8 },
    { name: '期中考试', subject: '数学', score: 85, classAverage: 78, rank: 12 },
    { name: '单元测试-函数', subject: '数学', score: 76, classAverage: 72, rank: 15 },
  ],
  wrongQuestions: [
    { name: '二次函数图像与性质', errorCount: 8, masteryRate: 45, level: 'critical' },
    { name: '一元二次方程求解', errorCount: 5, masteryRate: 60, level: 'warning' },
    { name: '三角形全等证明', errorCount: 3, masteryRate: 75, level: 'normal' },
  ],
  abilities: [
    { label: '计算力', value: 78 },
    { label: '逻辑推理', value: 62 },
    { label: '空间想象', value: 85 },
    { label: '应用能力', value: 70 },
  ],
  masteryRate: 78,
  masteryTrend: 12,
  midtermScore: 85,
  finalScore: 92,
  strengths: ['数学', '物理'],
  weaknesses: ['英语', '化学'],
};

export const useStudentPortrait = (studentId?: string) => {
  const [loading, setLoading] = useState(false);
  const [portrait, setPortrait] = useState<StudentPortrait | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [DrawerOpen, setDrawerOpen] = useState<boolean>(false);

  const fetchPortrait = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500));
      setPortrait(mockPortraitData);
    } catch (err) {
      setError('获取学生画像失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('导出报告:', portrait?.student.name);
      // 实际导出逻辑
    } finally {
      setLoading(false);
    }
  }, [portrait]);

  const generateStudyPlan = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDrawerOpen(true);
      console.log('生成学习计划:', portrait?.student.name);
      // 实际生成逻辑
    } finally {
      setLoading(false);
    }
  }, [portrait]);

  const sendToParent = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('发送给家长:', portrait?.student.name);
      // 实际发送逻辑
    } finally {
      setLoading(false);
    }
  }, [portrait]);

  useEffect(() => {
    if (studentId) {
      fetchPortrait();
    } else {
      setPortrait(mockPortraitData);
    }
  }, [studentId, fetchPortrait]);

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