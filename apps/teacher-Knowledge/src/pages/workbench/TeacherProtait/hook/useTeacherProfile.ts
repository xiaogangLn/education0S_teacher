import { useState, useEffect, useCallback } from 'react';
import type { TeacherProfile } from '../types/teacher';

// 模拟数据
const mockProfile: TeacherProfile = {
  id: '1',
  name: '张老师',
  title: '数学教师 · 九年级 · 教龄 8 年',
  avatar: '张',
  tags: ['🏫 九年级1班 班主任', '📚 数学教研组组长', '✅ 认证教师', '📅 2026届'],
  stats: [
    { label: '教案质量', value: 4.5, color: 'blue' },
    { label: '课堂互动', value: 4.2, color: 'green' },
    { label: '创新评分', value: 88, color: 'purple' },
    { label: '学生进步', value: 6, color: 'orange' },
  ],
  dimensions: [
    {
      label: '教学画像',
      score: 4.3,
      progress: 86,
      items: [
        { label: '教案质量', value: 4.5, badge: 'green' },
        { label: '课堂互动', value: 4.2, badge: 'green' },
        { label: '教学风格', value: '启发式', badge: 'blue' },
        { label: '创新评分', value: 88, badge: 'purple' },
      ],
    },
    {
      label: '教研画像',
      score: 4.0,
      progress: 80,
      items: [
        { label: '教研参与', value: '4次/月', badge: 'green' },
        { label: '课题研究', value: '1项', badge: 'blue' },
        { label: '培训学时', value: '12h', badge: 'purple' },
        { label: '论文发表', value: '2篇', badge: 'gray' },
      ],
    },
    {
      label: '效果画像',
      score: 4.3,
      progress: 86,
      items: [
        { label: '学生进步', value: '+6%', badge: 'green' },
        { label: '满意度', value: '4.6/5', badge: 'green' },
        { label: '同行评价', value: '4.3/5', badge: 'green' },
        { label: '升学率', value: '92%', badge: 'blue' },
      ],
    },
    {
      label: '成长画像',
      score: '稳步',
      progress: 85,
      items: [
        { label: '能力演化', value: '稳步提升', badge: 'green' },
        { label: '里程碑', value: '校级公开课', badge: 'blue' },
        { label: '发展建议', value: '跨学科融合', badge: 'purple' },
        { label: '成长指数', value: '85%', badge: 'gray' },
      ],
    },
  ],
  schedule: [
    { day: '周一', periods: 2 },
    { day: '周二', periods: 3, isToday: true },
    { day: '周三', periods: 2 },
    { day: '周四', periods: 1 },
    { day: '周五', periods: 3 },
    { day: '周六', periods: 0 },
    { day: '周日', periods: 0 },
  ],
  todayClass: '九年级1班 · 数学 · 第1-2节 · 导数复习',
  timeline: [
    { date: '2026-09-01', title: '📝 教案审核通过', description: '《导数的几何意义》已发布到知识库' },
    { date: '2026-08-30', title: '📊 教研组会议', description: '参与数学教研组月度研讨会' },
    { date: '2026-08-28', title: '🏆 公开课', description: '校级公开课《二次函数》获优秀评价' },
  ],
  achievements: [
    {
      icon: '📈',
      title: '学生成绩提升',
      description: '所带班级数学平均分提升 <strong style="color:#10b981;">+12%</strong>',
      meta: '2026届 · 九年级1班',
    },
    {
      icon: '🏅',
      title: '教学竞赛获奖',
      description: '市级教学能手大赛 <strong style="color:#8b5cf6;">一等奖</strong>',
      meta: '2026-05 · 西安市',
    },
    {
      icon: '📚',
      title: '教研成果',
      description: '发表论文 <strong style="color:#4f46e5;">2篇</strong> · 课题 <strong style="color:#4f46e5;">1项</strong>',
      meta: '省级课题《AI辅助数学教学研究》',
    },
  ],
  radar: [
    { label: '教学设计', value: 92, color: '#4f46e5' },
    { label: '课堂管理', value: 85, color: '#10b981' },
    { label: '师生互动', value: 78, color: '#8b5cf6' },
    { label: '教研创新', value: 82, color: '#f59e0b' },
  ],
};

export const useTeacherProfile = (teacherId?: string) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 模拟 API 请求
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProfile(mockProfile);
    } catch (err) {
      setError('获取教师画像失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(teacherId);
  }, [teacherId, fetchProfile]);

  const refresh = useCallback(() => {
    fetchProfile(teacherId);
  }, [teacherId, fetchProfile]);

  return { profile, loading, error, refresh };
};