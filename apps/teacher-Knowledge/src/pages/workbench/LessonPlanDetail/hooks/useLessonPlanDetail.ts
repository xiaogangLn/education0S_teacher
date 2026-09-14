import { useState, useEffect, useCallback } from 'react';
import { tabConfig } from '../constants';
import { learningService, processingService, type LessonAssignmentPayload } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import type { LessonPlanDetail, Thought, Resource } from '../types';
import { artifactDisplayName } from '@/utils/artifactName';

function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN');
}

function mapThoughts(task: any): Thought[] {
  const messages = Array.isArray(task.messages) ? task.messages : [];
  if (messages.length) {
    return messages.map((item: any, index: number) => ({
      id: String(item.id || `msg-${index}`),
      type: item.role === 'user' ? 'core' : item.role === 'system' ? 'note' : 'design',
      title: item.role === 'user' ? '教师指令' : item.role === 'system' ? '阶段确认' : `AI 生成${item.step != null ? ` · 第 ${item.step + 1} 步` : ''}`,
      content: String(item.content || '').replace(/<[^>]+>/g, ''),
      createdAt: item.timestamp || formatTime(task.updated_at),
      tags: item.role === 'user' ? ['对话'] : item.role === 'system' ? ['系统'] : ['AI生成'],
    }));
  }
  const thoughts: Thought[] = [];
  const idea = task.teacher_ideas?.teaching_approach;
  if (idea) {
    thoughts.push({
      id: 'idea',
      type: 'core',
      title: '教师指令',
      content: idea,
      createdAt: formatTime(task.created_at),
      tags: ['对话'],
    });
  }
  if (task.class_analysis?.zone_of_proximal_development) {
    thoughts.push({
      id: 'analysis',
      type: 'personalized',
      title: '学情分析',
      content: `掌握度 ${task.class_analysis.mastery_rate ?? 0}%；薄弱点：${(task.class_analysis.weak_points || []).join('、') || '暂无'}`,
      createdAt: formatTime(task.updated_at),
      tags: ['AI生成'],
    });
  }
  return thoughts;
}

function mapPlan(task: any): LessonPlanDetail {
  const outline = Array.isArray(task.outline) ? task.outline.map((item: any) => item.title).filter(Boolean) : [];
  const body = Array.isArray(task.refined_content) && task.refined_content.length
    ? task.refined_content
    : Array.isArray(task.content) ? task.content : [];
  const contentSections = body.map((item: any) => `${item.title}：${item.content || ''}`);
  const status = task.status === 'approved' || task.status === 'published' ? 'published' : task.status === 'pending_review' ? 'reviewing' : 'draft';
  const resources: Resource[] = (task.materials || []).map((item: any, index: number) => ({
    id: String(item.id || `res-${index}`),
    name: item.title || item.name || '素材',
    type: 'doc' as const,
  }));
  return {
    id: task.id,
    title: artifactDisplayName(task.title || task.topic, task.type),
    subject: task.subject,
    grade: '',
    className: '',
    课时: 1,
    status,
    createdAt: formatTime(task.created_at),
    updatedAt: formatTime(task.updated_at),
    version: task.version || 1,
    content: {
      objectives: [`围绕「${task.topic}」完成本课教学目标`],
      keyPoints: outline.length ? outline : ['打开加工台可继续完善大纲与正文'],
      difficulties: task.class_analysis?.weak_points || [],
      schedule: contentSections.length ? contentSections : ['当前仍在初始化/生成阶段，可点击继续进入加工台查看完整对话'],
      notes: task.teacher_ideas?.teaching_approach,
    },
    resources,
    thoughts: mapThoughts(task),
    stats: {
      totalStudents: 0,
      totalQuestions: 0,
      personalizedQuestions: 0,
      coverage: 0,
    },
  };
}

function applyAssignment(plan: LessonPlanDetail, assignment?: LessonAssignmentPayload | null): LessonPlanDetail {
  if (!assignment) return plan;
  return {
    ...plan,
    className: assignment.class_name || plan.className,
    stats: {
      totalStudents: assignment.stats?.totalStudents ?? 0,
      totalQuestions: assignment.stats?.totalQuestions ?? 0,
      personalizedQuestions: Number(assignment.stats?.personalizedQuestions ?? 0),
      coverage: assignment.stats?.coverage ?? 0,
    },
  };
}

export const useLessonPlanDetail = (planId: string) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<LessonPlanDetail | null>(null);
  const [assignment, setAssignment] = useState<LessonAssignmentPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'plan' | 'thoughts'>('detail');
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadAssignments = useCallback(async (id: string, published: boolean, autoGenerate = true) => {
    if (!id || !published) {
      setAssignment(null);
      return;
    }
    setGenerateError(null);
    try {
      let payload = extractPayload<LessonAssignmentPayload>(await learningService.getLessonAssignments(id));
      if (autoGenerate && payload && !payload.generated) {
        setGenerating(true);
        payload = extractPayload<LessonAssignmentPayload>(await learningService.generateFromLesson(id));
      }
      setAssignment(payload || null);
      setPlan((prev) => (prev ? applyAssignment(prev, payload) : prev));
    } catch (err: any) {
      setGenerateError(err?.message || '加载练习题失败');
    } finally {
      setGenerating(false);
    }
  }, []);

  const loadPlan = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = extractPayload<{ task: any }>(await processingService.getDetail(id));
      const mapped = mapPlan(payload?.task || payload);
      setPlan(mapped);
      setLoading(false);
      if (mapped.status === 'published') {
        loadAssignments(id, true, true);
      } else {
        setAssignment(null);
      }
      return;
    } catch {
      setError('加载教案详情失败');
    } finally {
      setLoading(false);
    }
  }, [loadAssignments]);

  const generateAssignments = useCallback(async () => {
    if (!planId) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const payload = extractPayload<LessonAssignmentPayload>(await learningService.generateFromLesson(planId, true));
      setAssignment(payload || null);
      setPlan((prev) => (prev ? applyAssignment(prev, payload) : prev));
    } catch (err: any) {
      setGenerateError(err?.message || '模型生成练习题失败');
    } finally {
      setGenerating(false);
    }
  }, [planId]);

  useEffect(() => {
    loadPlan(planId);
  }, [planId, loadPlan]);

  return {
    loading,
    generating,
    plan,
    assignment,
    error,
    generateError,
    activeTab,
    switchTab: setActiveTab,
    generateAssignments,
    getStatusBadge: (status: LessonPlanDetail['status']) => {
      const map = {
        draft: { color: 'default', label: '草稿' },
        reviewing: { color: 'processing', label: '审核中' },
        published: { color: 'success', label: '已发布' },
        archived: { color: 'default', label: '已归档' },
      };
      return map[status] || map.draft;
    },
    getThoughtTypeColor: () => 'blue',
    tabs: tabConfig,
    reload: () => loadPlan(planId),
  };
};
