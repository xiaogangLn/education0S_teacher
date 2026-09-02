// hooks/useStudyPlan.ts
import { useState, useEffect, useCallback } from 'react';
import type { StudyPlan } from '../types/studyPlan';

// 模拟数据
const mockStudyPlan: StudyPlan = {
  studentName: '张三',
  studentClass: '九年级1班',
  grade: '2026届',
  overallProgress: 65,
  completedCount: 13,
  totalCount: 20,
  estimatedDaysLeft: 4,
  days: [
    {
      date: '2026-08-30',
      dayOfWeek: '周一',
      status: 'completed',
      tasks: [
        {
          id: '1',
          title: '二次函数图像与性质 · 微课学习',
          status: 'completed',
          progress: 100,
          accuracy: 83,
          targetKnowledge: '二次函数',
        },
        {
          id: '2',
          title: '变式练习 · 基础题 6 道',
          status: 'completed',
          progress: 100,
          accuracy: 83,
          targetKnowledge: '二次函数',
        },
      ],
    },
    {
      date: '2026-08-31',
      dayOfWeek: '周二',
      status: 'in_progress',
      tasks: [
        {
          id: '3',
          title: '顶点坐标计算 · 微课学习',
          status: 'in_progress',
          progress: 60,
          targetKnowledge: '一元二次方程求解',
        },
        {
          id: '4',
          title: '变式练习 · 中等题 8 道',
          status: 'pending',
          targetKnowledge: '一元二次方程求解',
        },
      ],
    },
    {
      date: '2026-09-01',
      dayOfWeek: '周三',
      status: 'pending',
      tasks: [
        {
          id: '5',
          title: '综合应用 · 微课学习',
          status: 'pending',
          targetKnowledge: '三角形全等证明',
        },
        {
          id: '6',
          title: '提高题 5 道',
          status: 'pending',
          targetKnowledge: '三角形全等证明',
        },
      ],
    },
  ],
};

export const useStudyPlan = (studentId?: string) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (id?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlan(mockStudyPlan);
    } catch (err) {
      setError('获取学习计划失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendToStudent = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('发送给学生:', plan?.studentName);
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const sendToParent = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('发送给家长:', plan?.studentName);
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const adjustPlan = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('调整计划:', plan?.studentName);
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const viewFullReport = useCallback(() => {
    console.log('查看完整报告:', plan?.studentName);
  }, [plan]);

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