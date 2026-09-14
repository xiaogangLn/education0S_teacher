import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CoursewareDetail } from '../types';
import { processingService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { artifactDisplayName } from '@/utils/artifactName';
import { message } from 'antd';

export const useCoursewareDetail = (coursewareId: string) => {
  const [loading, setLoading] = useState(false);
  const [courseware, setCourseware] = useState<CoursewareDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    if (!coursewareId) return;
    setLoading(true);
    try {
      const payload = extractPayload<{ task: any }>(await processingService.getDetail(coursewareId));
      const task = payload?.task || payload;
      const slides = (task.content || []).map((item: any, index: number) => ({
        id: item.id || `s${index}`,
        page: index + 1,
        title: item.title,
        icon: '📄',
        content: item.content,
      }));
      setCourseware({
        id: task.id,
        name: artifactDisplayName(task.title || task.topic, 'courseware'),
        lessonPlanId: task.id,
        lessonPlanTitle: artifactDisplayName(task.title || task.topic, 'courseware'),
        grade: '',
        className: '',
        subject: task.subject,
        totalPages: slides.length || 1,
        fileSize: '—',
        format: 'pptx',
        status: task.status === 'approved' ? 'published' : 'draft',
        version: task.version || 1,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        slides,
        isAIGenerated: true,
      });
    } catch {
      setError('加载课件失败');
    } finally {
      setLoading(false);
    }
  }, [coursewareId]);

  useEffect(() => {
    load();
  }, [load]);

  const displaySlides = useMemo(() => {
    if (!courseware) return [];
    return expanded ? courseware.slides : courseware.slides.slice(0, 6);
  }, [courseware, expanded]);

  return {
    loading,
    courseware,
    error,
    expanded,
    displaySlides,
    hasMoreSlides: (courseware?.slides.length || 0) > 6,
    toggleExpand: () => setExpanded((v) => !v),
    downloadCourseware: () => message.success('已准备下载当前课件内容'),
    previewCourseware: () => message.info('请在右侧预览区查看'),
    shareCourseware: () => message.success('分享链接已复制（演示）'),
    getStatusBadge: () => ({ color: 'processing', label: courseware?.status }),
    reload: load,
  };
};
