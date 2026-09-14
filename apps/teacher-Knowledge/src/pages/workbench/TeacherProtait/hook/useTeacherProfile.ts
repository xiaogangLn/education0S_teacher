import { useState, useEffect, useCallback } from 'react';
import { portraitService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { loadPersistedUser } from '@/utils/currentUser';
import type { TeacherPortrait } from '@api/index';
import type { TeacherProfile } from '../types/teacher';

function mapPortrait(data: TeacherPortrait, fallbackName?: string): TeacherProfile {
  const name = data.teacher_name || fallbackName || '教师';
  const teaching = data.teaching || ({} as TeacherPortrait['teaching']);
  const research = data.research || ({} as TeacherPortrait['research']);
  const effectiveness = data.effectiveness || ({} as TeacherPortrait['effectiveness']);
  const growth = data.growth || ({} as TeacherPortrait['growth']);
  const overall = Number(data.overall_score || 0);
  return {
    id: data.teacher_id,
    name,
    title: [data.department, data.school_name].filter(Boolean).join(' · ') || '教师',
    avatar: name.charAt(0),
    tags: [data.school_name, data.department].filter(Boolean).map((item) => `🏫 ${item}`),
    stats: [
      { label: '教案质量', value: teaching.lesson_plan_quality || 0, color: 'blue' },
      { label: '课堂互动', value: teaching.classroom_interaction || 0, color: 'green' },
      { label: '创新评分', value: teaching.innovation_score || 0, color: 'purple' },
      { label: '学生进步', value: effectiveness.student_progress || 0, color: 'orange' },
    ],
    dimensions: [
      {
        label: '教学画像',
        score: teaching.lesson_plan_quality || 0,
        progress: Math.round((teaching.lesson_plan_quality || 0) * (teaching.lesson_plan_quality > 5 ? 1 : 20)),
        items: [
          { label: '教案质量', value: teaching.lesson_plan_quality || 0, badge: 'green' },
          { label: '课堂互动', value: teaching.classroom_interaction || 0, badge: 'green' },
          { label: '教学风格', value: teaching.teaching_style || '-', badge: 'blue' },
          { label: '创新评分', value: teaching.innovation_score || 0, badge: 'purple' },
        ],
      },
      {
        label: '教研画像',
        score: research.research_participation || 0,
        progress: Math.min(100, Number(research.research_participation || 0)),
        items: [
          { label: '教研参与', value: `${research.research_participation || 0}`, badge: 'green' },
          { label: '课题研究', value: `${research.projects_count || 0}项`, badge: 'blue' },
          { label: '培训学时', value: `${research.training_hours || 0}h`, badge: 'purple' },
          { label: '综合评分', value: overall, badge: 'gray' },
        ],
      },
      {
        label: '效果画像',
        score: effectiveness.satisfaction || 0,
        progress: Math.min(100, Number(effectiveness.satisfaction || 0) * (Number(effectiveness.satisfaction) > 5 ? 1 : 20)),
        items: [
          { label: '学生进步', value: `${effectiveness.student_progress || 0}`, badge: 'green' },
          { label: '满意度', value: `${effectiveness.satisfaction || 0}`, badge: 'green' },
          { label: '同行评价', value: `${effectiveness.peer_evaluation || 0}`, badge: 'green' },
          { label: '成长趋势', value: `${data.growth_trend || 0}`, badge: 'blue' },
        ],
      },
      {
        label: '成长画像',
        score: growth.capability_evolution || '稳步',
        progress: 80,
        items: [
          { label: '能力演化', value: growth.capability_evolution || '-', badge: 'green' },
          { label: '里程碑', value: growth.milestones?.[0]?.title || '-', badge: 'blue' },
          { label: '发展建议', value: growth.development_suggestions?.[0] || '-', badge: 'purple' },
          { label: '更新时间', value: String(data.updated_at || '').slice(0, 10), badge: 'gray' },
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
    todayClass: data.department ? `${data.department} · 教学安排` : '暂无课程安排',
    timeline: (growth.milestones || []).slice(0, 5).map((item) => ({
      date: String(item.date || '').slice(0, 10),
      title: item.title,
      description: item.title,
    })),
    achievements: (growth.development_suggestions || []).slice(0, 3).map((item, index) => ({
      icon: ['📈', '🏅', '📚'][index] || '📌',
      title: '发展建议',
      description: item,
      meta: data.school_name || '',
    })),
    radar: [
      { label: '教学设计', value: Math.round(Number(teaching.lesson_plan_quality || 0) * (Number(teaching.lesson_plan_quality) > 10 ? 1 : 20)), color: '#4f46e5' },
      { label: '课堂管理', value: Math.round(Number(teaching.classroom_interaction || 0) * (Number(teaching.classroom_interaction) > 10 ? 1 : 20)), color: '#10b981' },
      { label: '师生互动', value: Math.round(Number(effectiveness.satisfaction || 0) * (Number(effectiveness.satisfaction) > 10 ? 1 : 20)), color: '#8b5cf6' },
      { label: '教研创新', value: Math.round(Number(teaching.innovation_score || 0) * (Number(teaching.innovation_score) > 10 ? 1 : 20)), color: '#f59e0b' },
    ],
  };
}

export const useTeacherProfile = (teacherId?: string) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id?: string) => {
    const user = loadPersistedUser();
    const targetId = id || user?.id;
    setLoading(true);
    setError(null);
    try {
      if (!targetId) {
        throw new Error('未登录');
      }
      const payload = extractPayload<{ data?: TeacherPortrait } & TeacherPortrait>(
        await portraitService.getTeacher(targetId),
      );
      const data = (payload as any)?.data || payload;
      if (!data?.teacher_id && !data?.teacher_name) {
        throw new Error('画像数据为空');
      }
      setProfile(mapPortrait(data as TeacherPortrait, user?.realName));
    } catch (err: any) {
      setError(err?.message || '获取教师画像失败');
      setProfile(null);
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
