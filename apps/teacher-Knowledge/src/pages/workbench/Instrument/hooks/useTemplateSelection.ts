import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { processingService } from '@api/index';
import type { TemplateType, StepData } from '../types';
import { getMarkdownStepsByTemplate, hasStepsByTemplate } from '@/utils/markdownSteps';
import { extractPayload } from '@/utils/knowledgeMapper';
import { assertGenerationQuota, isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';
import { useRefreshSession } from '@/hooks/useRefreshSession';
import { useOrgContext } from '@/hooks/useOrgContext';
import type { FileItem } from '@/components/leftCard/types';
import { useSchoolTemplates, type WorkbenchTemplate } from '@/components/rightCard/useSchoolTemplates';
import { DEFAULT_EXAM_SPEC, defaultExamSpecForSubject, examTypesForSubject, formatExamSpecMarkdown, normalizeExamSpec, pickExamVisibleMarkdown, splitExamMarkdown, type ExamSpec, type ExamTypeDef } from '../components/ExamSpecBar';
import { cleanExportMarkdown } from '@/utils/exportByTemplate';
import { artifactDisplayName } from '@/utils/artifactName';
import { localizeThinkingText } from '@/utils/localizeThinking';

export interface GenerationContext {
  template?: WorkbenchTemplate | null;
  materials?: FileItem[];
}

export interface ResearchSource {
  id: string;
  title: string;
  kind: string;
  subject?: string;
  excerpt?: string;
  origin?: 'system' | 'ai';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  step?: number;
  type?: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'confirm' | 'message' | 'system';
  sources?: ResearchSource[];
  reasoning?: string;
}

const stepNames: Record<string, string> = {
  init: '📝 初始化',
  analysis: '📊 学情分析',
  outline: '📌 大纲生成',
  content: '📄 内容填充',
  refine: '✨ 精修定稿',
  confirm: '✅ 确认完成',
};

const STAGE_ORDER = ['init', 'analysis', 'outline', 'content', 'refine'] as const;

function extractLessonTitle(markdown: string) {
  const field = String(markdown || '').match(/(?:^|\n)\s*[-*]?\s*\*\*(?:课题|试卷名称)\*\*\s*[:：]\s*([^\n]+)/);
  const value = (field?.[1] || '').replace(/[*`「」"']/g, '').trim();
  if (!value || value.length < 2) return '';
  if (/帮我生成|请帮我|生成一份|生成教案|生成课件|生成试卷|写一份|出一份|未命名/.test(value)) return '';
  if (/^(高中)?[\u4e00-\u9fa5]{0,8}(教案|课件|试卷)([（(]校本[）)])?$/.test(value)) return '';
  return value.slice(0, 40);
}

function mapTaskMaterial(item: any, index: number): FileItem {
  const rawType = String(item.type || 'document');
  const allowed: FileItem['type'][] = ['document', 'sheet', 'video', 'audio', 'pdf', 'image', 'link', 'folder', 'word', 'ppt'];
  const type = (allowed.includes(rawType as FileItem['type']) ? rawType : 'document') as FileItem['type'];
  return {
    id: String(item.id || `material-${index}`),
    name: item.title || item.name || '未命名素材',
    type,
    category: 'material',
    size: '',
    updatedAt: '',
    creator: '',
    permission: 'school',
  };
}

function templateToType(template: TemplateType) {
  if (template === '课件模板') return 'courseware';
  if (template === '试卷模板') return 'exam';
  return 'lesson_plan';
}

function typeToTemplate(type?: string): TemplateType {
  if (type === 'courseware') return '课件模板';
  if (type === 'exam') return '试卷模板';
  return '教案模板';
}

function typeFromQuery(type?: string | null): TemplateType | null {
  if (type === 'lesson_plan') return '教案模板';
  if (type === 'courseware') return '课件模板';
  if (type === 'exam') return '试卷模板';
  return null;
}

function matchTemplateByType(
  template: TemplateType,
  kind: string | null,
  commonTemplates: WorkbenchTemplate[],
  schoolTemplates: WorkbenchTemplate[],
): WorkbenchTemplate | undefined {
  return (
    commonTemplates.find((item) => item.kind === kind) ||
    commonTemplates.find((item) => item.builtin_type === template) ||
    schoolTemplates.find((item) => item.kind === kind) ||
    schoolTemplates.find((item) => item.builtin_type === template)
  );
}

function formatAnalysis(analysis: any, topic: string) {
  const layers = analysis?.layers || {};
  const weak = (analysis?.weak_points || []).join('、') || '暂无';
  const materials = (analysis?.material_titles || []).join('、') || '未选择';
  return `## 📊 班级学情分析

<callout type="info" title="系统自动读取">
基于班级画像、选用模板与素材库资源为课题「${topic}」生成学情分析
</callout>

### 数据概览
- **掌握度**: ${analysis?.mastery_rate ?? 0}%
- **薄弱点**: ${weak}
- **分层**: A层${layers.A ?? 0}人 · B层${layers.B ?? 0}人 · C层${layers.C ?? 0}人
- **最近发展区**: ${analysis?.zone_of_proximal_development || '—'}
- **参照模板**: ${analysis?.template_title || '系统默认'}
- **选用素材**: ${materials}
`;
}

function formatOutline(outline: any[], topic: string, template?: TemplateType) {
  const lines = (outline || []).map((item, index) => `${index + 1}. **${item.title}**`).join('\n');
  if (template === '课件模板') {
    return `## 📌 框架设计

<ai>
根据内容分析决定怎么教，页面结构服务于教学决策
</ai>

### 页面结构
${lines || '暂无框架'}
`;
  }
  return `## 📌 教学大纲

<ai>
围绕「${topic}」生成的教学大纲，教师可根据需要进行调整
</ai>

### 教学流程
${lines || '暂无大纲'}
`;
}

function formatContent(sections: any[], topic: string) {
  const body = (sections || [])
    .filter((section) => {
      const title = String(section.title || '');
      const content = String(section.content || '').trim();
      if (!content) return false;
      if (/^围绕[「『"].+?[」』"]展开/.test(content)) return false;
      if (/本阶段结果|学科\s*\/\s*班级|选用模板|素材库|班级画像|教学落点/.test(title)) return false;
      return true;
    })
    .map((section) => `### ${section.title}\n\n${section.content || ''}`)
    .join('\n\n');
  return `## 📄 教学内容

课题：${topic}

${body || '暂无内容'}
`;
}

function formatInit(template: TemplateType, topic: string, extra: {
  subject?: string;
  className?: string;
  templateTitle?: string;
  materials?: string[];
}) {
  return `# 📝 ${template} · 初始化\n\n## 基本信息\n- **课题**: ${topic}\n- **班级**: ${extra.className || '当前班级'}\n- **学科**: ${extra.subject || '数学'}\n- **模板**: ${extra.templateTitle || template}\n- **素材**: ${(extra.materials || []).filter(Boolean).join('、') || '未选择'}\n`;
}

function hasAnalysis(analysis: any) {
  return Boolean(analysis && (analysis.mastery_rate != null || analysis.content || (analysis.weak_points || []).length));
}

function normalizeChatMessage(msg: any, index: number): ChatMessage {
  const stepNum = Number(msg.step);
  return {
    id: String(msg.id || `hist-${index}`),
    role: msg.role === 'user' || msg.role === 'system' ? msg.role : 'assistant',
    content: String(msg.content || ''),
    timestamp: msg.timestamp || '',
    step: Number.isFinite(stepNum) ? stepNum : undefined,
    type: msg.type,
    reasoning: msg.reasoning ? localizeThinkingText(String(msg.reasoning)) : undefined,
  };
}

const STAGE_TYPES = ['init', 'analysis', 'outline', 'content', 'refine'] as const;

function inferMessageStep(msg: ChatMessage): number | undefined {
  if (typeof msg.step === 'number' && Number.isFinite(msg.step)) return msg.step;
  if (msg.type && STAGE_TYPES.includes(msg.type as any)) {
    return STAGE_TYPES.indexOf(msg.type as typeof STAGE_TYPES[number]);
  }
  return undefined;
}

/** 恢复会话时补齐 step，并确保当前阶段有可点「进入下一步」的助手消息 */
function buildChatFromTask(task: any, _template: TemplateType, stepData: StepData[], stageIndex: number): ChatMessage[] {
  const topic = task.topic || task.title || '未命名课题';
  const idea = task.teacher_ideas?.teaching_approach || topic;
  const created = task.created_at ? new Date(task.created_at).toLocaleTimeString('zh-CN') : '';
  const updated = task.updated_at ? new Date(task.updated_at).toLocaleTimeString('zh-CN') : created;

  let messages: ChatMessage[] = [];
  if (Array.isArray(task.messages) && task.messages.length) {
    messages = task.messages.map((item: any, index: number) => {
      const normalized = normalizeChatMessage(item, index);
      const inferred = inferMessageStep(normalized);
      return inferred === undefined ? normalized : { ...normalized, step: inferred };
    });
  } else {
    messages = [
      { id: `${task.id}-user`, role: 'user', content: idea, timestamp: created, type: 'message' },
    ];
    if (stepData[0]) {
      messages.push({
        id: `${task.id}-init`,
        role: 'assistant',
        content: stepData[0].content,
        timestamp: created,
        type: 'init',
        step: 0,
      });
    }
    for (let index = 1; index <= stageIndex && index < stepData.length; index += 1) {
      const step = stepData[index];
      const ready =
        (index === 1 && hasAnalysis(task.class_analysis)) ||
        (index === 2 && (task.outline_markdown || (Array.isArray(task.outline) && task.outline.length))) ||
        (index === 3 && Array.isArray(task.content) && task.content.length) ||
        (index === 4 && Array.isArray(task.refined_content) && task.refined_content.length) ||
        index === stageIndex;
      if (!ready) continue;
      messages.push({
        id: `${task.id}-sys-${index}`,
        role: 'system',
        content: `✅ 已进入「${step.title}」`,
        timestamp: updated,
        type: 'confirm',
      });
      messages.push({
        id: `${task.id}-step-${index}`,
        role: 'assistant',
        content: step.content,
        timestamp: updated,
        type: step.type,
        step: index,
        reasoning: undefined,
      });
    }
  }

  // 当前未完成阶段：必须有一条带 step 的助手消息，否则二次进入会丢确认按钮
  const current = stepData[stageIndex];
  if (current && current.status !== 'completed') {
    const hasCurrentAssistant = messages.some(
      (msg) => msg.role === 'assistant' && msg.step === stageIndex,
    );
    if (!hasCurrentAssistant) {
      messages.push({
        id: `${task.id}-step-${stageIndex}-restore`,
        role: 'assistant',
        content: current.content || '',
        timestamp: updated,
        type: current.type,
        step: stageIndex,
      });
    } else {
      messages = messages.map((msg) => {
        if (msg.role === 'assistant' && msg.step === stageIndex && !String(msg.content || '').trim() && current.content) {
          return { ...msg, content: current.content };
        }
        return msg;
      });
    }
  }

  return messages;
}

function currentExamCatalog(): ExamTypeDef[] {
  return loadPersistedUser()?.examTypes || [];
}

export const useTemplateSelection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const org = useOrgContext();
  const refreshSession = useRefreshSession();
  const { commonTemplates, schoolTemplates } = useSchoolTemplates();
  const taskIdRef = useRef(searchParams.get('id') || '');
  const loadedIdRef = useRef('');
  const topicRef = useRef('');
  const stepsRef = useRef<StepData[]>([]);
  const currentStepIndexRef = useRef(0);
  const sessionStartedRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingRef = useRef(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(() => {
    if (searchParams.get('id') || searchParams.get('mode') === 'research') return null;
    return typeFromQuery(searchParams.get('type'));
  });
  const [selectedTemplateMeta, setSelectedTemplateMeta] = useState<WorkbenchTemplate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [historyMaterials, setHistoryMaterials] = useState<FileItem[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState(searchParams.get('id') || '');
  const [topic, setTopic] = useState('');
  const [examSpec, setExamSpec] = useState<ExamSpec>(DEFAULT_EXAM_SPEC);
  const [examSubject, setExamSubject] = useState('数学');
  const [examSpecOpen, setExamSpecOpen] = useState(false);
  const examSpecRef = useRef<ExamSpec>(DEFAULT_EXAM_SPEC);
  const examSubjectRef = useRef('数学');
  const selectedTemplateRef = useRef(selectedTemplate);

  stepsRef.current = steps;
  currentStepIndexRef.current = currentStepIndex;
  sessionStartedRef.current = sessionStarted;
  examSpecRef.current = examSpec;
  examSubjectRef.current = examSubject;
  selectedTemplateRef.current = selectedTemplate;

  const hasSteps = useMemo(() => {
    if (!selectedTemplate) return false;
    return hasStepsByTemplate(selectedTemplate);
  }, [selectedTemplate]);

  const appendMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string }) => {
    const id = msg.id || `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setChatMessages((prev) => [
      ...prev,
      {
        ...msg,
        id,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    return id;
  }, []);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setChatMessages((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const applyTask = useCallback((task: any, template: TemplateType) => {
    const topic = artifactDisplayName(task.title || task.topic, task.type);
    topicRef.current = topic;
    setTopic(topic);
    const subject = task.subject || '数学';
    setExamSubject(subject);
    const catalog = examTypesForSubject(subject, currentExamCatalog());
    setExamSpec(task.exam_spec ? normalizeExamSpec(task.exam_spec, catalog) : defaultExamSpecForSubject(subject, catalog));
    setCurrentTaskId(task.id || '');
    const stepData = getMarkdownStepsByTemplate(template).map((step) => ({ ...step }));
    const materials = (task.materials || []).map((item: any) => item.title || item.name).filter(Boolean);
    if (stepData[0]) {
      stepData[0].content = formatInit(template, topic, {
        subject: task.subject,
        templateTitle: task.template?.title || template,
        materials,
      });
    }
    if (hasAnalysis(task.class_analysis) && stepData[1]) {
      stepData[1].content = task.class_analysis.content || formatAnalysis(task.class_analysis, topic);
    }
    if (task.outline_markdown && stepData[2]) {
      stepData[2].content = task.outline_markdown;
    } else if (Array.isArray(task.outline) && task.outline.length && stepData[2]) {
      stepData[2].content = formatOutline(task.outline, topic, template);
    }
    if (Array.isArray(task.content) && task.content.length && stepData[3]) {
      stepData[3].content = formatContent(task.content, topic);
    }
    if (Array.isArray(task.refined_content) && task.refined_content.length && stepData[4]) {
      stepData[4].content = formatContent(task.refined_content, topic);
    }
    const stage = task.current_stage === 'complete' ? 'refine' : String(task.current_stage || 'init');
    const index = Math.max(0, STAGE_ORDER.findIndex((item) => item === stage));
    const allDone = task.current_stage === 'complete';
    stepData.forEach((step, stepIndex) => {
      if (allDone || stepIndex < index) step.status = 'completed';
      else if (stepIndex === index) step.status = 'processing';
      else step.status = 'pending';
    });
    const restored = buildChatFromTask(task, template, stepData, allDone ? stepData.length - 1 : index);
    restored.forEach((msg) => {
      if (typeof msg.step === 'number' && stepData[msg.step] && msg.content) {
        stepData[msg.step].content = msg.content;
      }
    });
    setSteps(stepData);
    setCurrentStepIndex(allDone ? Math.max(stepData.length - 1, 0) : index);
    setSelectedTemplate(template);
    const tpl = task.template;
    if (tpl) {
      setSelectedTemplateMeta({
        id: String(tpl.id || 'history-template'),
        title: tpl.title || template,
        kind: tpl.kind || task.type || 'lesson_plan',
        scope: tpl.scope || 'system',
        source_label: tpl.source_label || (tpl.scope === 'school' ? '校本' : '模板'),
        subject: task.subject || '数学',
        builtin_type: template,
        content: tpl.content || '',
      });
    } else {
      setSelectedTemplateMeta(null);
    }
    setHistoryMaterials((task.materials || []).map(mapTaskMaterial));
    setChatMessages(restored);
    setIsStreaming(false);
    setIsInitialized(true);
    setSessionStarted(true);
  }, []);

  useEffect(() => {
    if (searchParams.get('mode') === 'research') return;
    const id = searchParams.get('id');
    if (!id) return;
    if (loadedIdRef.current === id) return;
    let cancelled = false;
    taskIdRef.current = id;
    (async () => {
      setLoading(true);
      try {
        const payload = extractPayload<{ task: any }>(await processingService.getDetail(id));
        const task = payload?.task || payload;
        if (cancelled) return;
        if (!task?.id) {
          message.error('加载加工任务失败');
          return;
        }
        applyTask(task, typeToTemplate(task.type));
        loadedIdRef.current = id;
      } catch {
        if (!cancelled) message.error('加载加工任务失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, applyTask]);

  useEffect(() => {
    if (searchParams.get('mode') === 'research' || searchParams.get('id')) return;
    if (sessionStartedRef.current) return;
    const type = searchParams.get('type');
    const template = typeFromQuery(type);
    if (!template) return;
    setSelectedTemplate((prev) => prev || template);
    const match = matchTemplateByType(template, type, commonTemplates, schoolTemplates);
    if (!match) return;
    setSelectedTemplateMeta((prev) => (prev?.id === match.id ? prev : match));
  }, [searchParams, commonTemplates, schoolTemplates]);

  useEffect(() => {
    const taskId = taskIdRef.current;
    if (!taskId || chatMessages.length === 0) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      processingService.saveConversation(taskId, chatMessages as unknown as Array<Record<string, unknown>>).catch(() => undefined);
    }, 400);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [chatMessages]);

  const selectTemplate = useCallback((template: TemplateType, meta?: WorkbenchTemplate) => {
    setSelectedTemplate(template);
    setSelectedTemplateMeta(meta || null);
    setCurrentStepIndex(0);
    setSteps([]);
    setIsStreaming(false);
    setIsInitialized(false);
    setSessionStarted(false);
    setChatMessages([]);
    setHistoryMaterials([]);
    setCurrentTaskId('');
    setTopic('');
    setExamSpec(DEFAULT_EXAM_SPEC);
    setExamSubject('数学');
    setExamSpecOpen(false);
    taskIdRef.current = '';
    loadedIdRef.current = '';
    setSearchParams({});
  }, [setSearchParams]);

  const streamIntoStep = useCallback(async (stage: string, stepIndex: number, messageId: string, feedback?: string) => {
    const taskId = taskIdRef.current;
    if (!taskId) return;
    streamingRef.current = true;
    setIsStreaming(true);
    setLoading(true);
    let content = '';
    let thinking = '';
    let rafId = 0;
    const applyTitle = (markdown: string, extra?: string) => {
      const name = extra || extractLessonTitle(markdown);
      if (!name) return;
      const display = artifactDisplayName(name, selectedTemplateRef.current || undefined);
      topicRef.current = display;
      setTopic(display);
    };
    const flushUi = () => {
      rafId = 0;
      applyTitle(content);
      patchMessage(messageId, {
        content,
        reasoning: thinking ? localizeThinkingText(thinking) : undefined,
      });
      setSteps((prev) => prev.map((step, index) => (
        index === stepIndex ? { ...step, content, status: 'processing' as const } : step
      )));
    };
    const scheduleUi = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(flushUi);
    };
    try {
      await processingService.streamStage(taskId, stage, {
        examSpec: selectedTemplateRef.current === '试卷模板' ? examSpecRef.current : undefined,
        feedback,
        onThinking: (text) => {
          thinking += text;
          scheduleUi();
        },
        onSnapshot: (text) => {
          content = text;
          scheduleUi();
        },
        onDelta: (text) => {
          content += text;
          scheduleUi();
        },
        onDone: (payload) => {
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
          content = payload.content || content;
          thinking = localizeThinkingText(payload.thinking || thinking);
          applyTitle(content, payload.title);
          patchMessage(messageId, { content, reasoning: thinking || undefined });
          setSteps((prev) => prev.map((step, index) => (
            index === stepIndex ? { ...step, content, status: 'processing' as const } : step
          )));
        },
        onError: (msg) => {
          message.error(msg);
        },
      });
    } finally {
      if (rafId) cancelAnimationFrame(rafId);
      streamingRef.current = false;
      setIsStreaming(false);
      setLoading(false);
    }
  }, [patchMessage]);

  const sendMessage = useCallback(async (text: string, context?: GenerationContext) => {
    if (taskIdRef.current && sessionStartedRef.current) {
      if (streamingRef.current) {
        message.warning('正在生成，请稍候再调整');
        return false;
      }
      const trimmed = text.trim();
      if (!trimmed) return false;
      appendMessage({ role: 'user', content: trimmed, type: 'message' });
      const stepsNow = stepsRef.current;
      const refineIndex = stepsNow.findIndex((step) => step.type === 'refine');
      const allDone = stepsNow.length > 0 && stepsNow.every((step) => step.status === 'completed');
      const stepIndex = allDone
        ? (refineIndex >= 0 ? refineIndex : Math.max(0, stepsNow.length - 1))
        : currentStepIndexRef.current;
      const stage = stepsNow[stepIndex]?.type || 'refine';
      const stageTitle = stepsNow[stepIndex]?.title || stepNames[stage] || '当前阶段';
      const reviseFinal = allDone || stage === 'refine';
      if (selectedTemplateRef.current === '试卷模板' && stage === 'outline') {
        appendMessage({
          role: 'assistant',
          content: '请先选择题型与题量，确认后再用对话调整试卷。',
          type: 'message',
        });
        return true;
      }
      setCurrentStepIndex(stepIndex);
      currentStepIndexRef.current = stepIndex;
      setSteps((prev) => prev.map((step, index) => (
        index === stepIndex ? { ...step, status: 'processing' as const } : step
      )));
      const msgId = appendMessage({
        role: 'assistant',
        content: '',
        type: stage,
        step: stepIndex,
      });
      await streamIntoStep(stage, stepIndex, msgId, trimmed);
      if (allDone) {
        setSteps((prev) => prev.map((step, index) => (
          index === stepIndex ? { ...step, status: 'completed' as const } : step
        )));
      }
      appendMessage({
        role: 'system',
        content: reviseFinal && allDone
          ? '已按你的意见重新生成终稿。请在右侧按文件类型预览；还不满意可以继续说明修改意见。'
          : `已按你的意见重新生成「${stageTitle}」。确认无误后再进入下一阶段；还不满意可以继续说明修改意见。`,
        type: 'system',
      });
      return true;
    }
    if (!selectedTemplate) {
      message.warning('请先选择模板');
      return false;
    }

    const template = context?.template || selectedTemplateMeta;
    const materials = context?.materials || [];
    if (!template?.id) {
      message.warning('请先在右侧选择模板');
      return false;
    }

    const quotaError = assertGenerationQuota(loadPersistedUser(), templateToType(selectedTemplate));
    if (quotaError) {
      message.error(quotaError);
      return false;
    }

    appendMessage({ role: 'user', content: text, type: 'message' });
    const user = loadPersistedUser();
    const commercial = isCommercialTenant(user);
    const subject = user?.subjects?.[0] || template.subject || '数学';
    const catalog = examTypesForSubject(subject, currentExamCatalog());
    setExamSubject(subject);
    setExamSpec(defaultExamSpecForSubject(subject, catalog));
    setLoading(true);
    const payload = {
      class_id: commercial ? undefined : (org.classId || user?.classId),
      grade_id: commercial ? undefined : (org.gradeId || user?.gradeId),
      subject,
      topic: text,
      type: templateToType(selectedTemplate),
      template_id: template.id,
      template: {
        id: template.id,
        title: template.title,
        kind: template.kind,
        scope: template.scope,
        source_label: template.source_label,
        builtin_type: template.builtin_type,
        content: template.content || '',
      },
      material_ids: materials.map((item) => item.id).filter(Boolean),
      materials: materials.map((item) => ({
        id: item.id,
        title: item.name,
        type: item.type,
      })),
      teacher_ideas: {
        teaching_approach: text,
        key_points: [],
        special_design: '',
        target_students: commercial ? '我的学生' : (org.className || ''),
      },
    };

    try {
      if (hasStepsByTemplate(selectedTemplate)) {
        const created = extractPayload<any>(await processingService.create(payload));
        const taskId = created.task_id || created.id;
        taskIdRef.current = taskId;
        loadedIdRef.current = taskId;
        setCurrentTaskId(taskId || '');
        setTopic(artifactDisplayName(created.title || created.topic, selectedTemplate));
        topicRef.current = artifactDisplayName(created.title || created.topic, selectedTemplate);
        if (taskId) setSearchParams({ id: taskId });
        const stepData = getMarkdownStepsByTemplate(selectedTemplate).map((step) => ({ ...step, content: '' }));
        if (stepData[0]) stepData[0].status = 'processing';
        setSteps(stepData);
        setCurrentStepIndex(0);
        setIsStreaming(true);
        setIsInitialized(true);
        setSessionStarted(true);
        const msgId = appendMessage({
          role: 'assistant',
          content: '',
          type: 'init',
          step: 0,
        });
        await streamIntoStep('init', 0, msgId);
      } else {
        const created = extractPayload<any>(await processingService.create(payload));
        const taskId = created.task_id || created.id;
        if (taskId) {
          taskIdRef.current = taskId;
          loadedIdRef.current = taskId;
          setCurrentTaskId(taskId);
          setTopic(artifactDisplayName(created.title || created.topic, selectedTemplate));
          topicRef.current = artifactDisplayName(created.title || created.topic, selectedTemplate);
          await processingService.complete(taskId);
          setSearchParams({ id: taskId });
        }
        setSteps([]);
        setIsStreaming(false);
        setIsInitialized(true);
        setSessionStarted(true);
        appendMessage({
          role: 'assistant',
          content: `✅ 「${template.title}」已生成完成！\n\n已使用模板「${template.title}」与 ${materials.length} 项素材。`,
          type: 'system',
        });
      }
      void refreshSession().catch(() => undefined);
      return true;
    } catch (error: any) {
      message.error(error?.message || '创建加工任务失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate, selectedTemplateMeta, appendMessage, setSearchParams, org.classId, org.className, org.gradeId, streamIntoStep, refreshSession]);

  const confirmExamSpec = useCallback(async (spec: ExamSpec) => {
    if (streamingRef.current) return;
    const taskId = taskIdRef.current;
    setExamSpec(spec);
    examSpecRef.current = spec;
    setExamSpecOpen(false);
    const specText = formatExamSpecMarkdown(spec, examSubjectRef.current, spec.types);
    const outlineIndex = stepsRef.current.findIndex((step) => step.type === 'outline');
    const contentIndex = stepsRef.current.findIndex((step) => step.type === 'content');
    if (outlineIndex < 0 || contentIndex < 0) return;
    setLoading(true);
    try {
      setSteps((prev) => prev.map((step, index) => {
        if (index === outlineIndex) return { ...step, status: 'completed' as const, content: specText };
        if (index === contentIndex) return { ...step, status: 'processing' as const, content: '' };
        return step;
      }));
      setCurrentStepIndex(contentIndex);
      appendMessage({
        role: 'system',
        content: '✅ 已确认题型与题量，开始生成学生卷（答案在右侧单独卡片）',
        type: 'confirm',
      });
      const msgId = appendMessage({
        role: 'assistant',
        content: '',
        step: contentIndex,
        type: 'content',
      });
      if (taskId) {
        await streamIntoStep('content', contentIndex, msgId);
      }
    } catch (error: any) {
      message.error(error?.message || '出题失败');
    } finally {
      setLoading(false);
    }
  }, [appendMessage, streamIntoStep]);

  const confirmStep = useCallback(async () => {
    if (streamingRef.current) return;
    const taskId = taskIdRef.current;
    const stepIndex = currentStepIndexRef.current;
    const currentSteps = stepsRef.current;
    const current = currentSteps[stepIndex];
    if (!current || current.status === 'completed') return;
    const isExam = selectedTemplateRef.current === '试卷模板';
    if (isExam && current.type === 'outline') {
      setExamSpecOpen(true);
      return;
    }
    const nextIndex = stepIndex + 1;
    setLoading(true);
    try {
      if (current.type === 'refine') {
        if (taskId) {
          await processingService.complete(taskId);
          try {
            await processingService.submit(taskId);
          } catch {
            // 提交审核失败不阻断完成
          }
        }
        setSteps((prev) => prev.map((step, index) => (
          index === stepIndex ? { ...step, status: 'completed' as const } : step
        )));
        setIsStreaming(false);
        setIsInitialized(true);
        appendMessage({
          role: 'system',
          content: '🎉 所有步骤已完成！内容已生成',
          type: 'system',
        });
        return;
      }

      if (taskId && current.type === 'analysis') {
        await processingService.confirmAnalysis(taskId, true);
      }

      const nextStep = currentSteps[nextIndex];
      if (isExam && current.type === 'analysis') {
        const placeholder = '请在弹窗中选择题型、题量与难度，确认后再出题。';
        setSteps((prev) => prev.map((step, index) => {
          if (index === stepIndex) return { ...step, status: 'completed' as const };
          if (index === nextIndex) return { ...step, status: 'processing' as const, content: placeholder };
          return step;
        }));
        setCurrentStepIndex(nextIndex);
        setExamSpecOpen(true);
        appendMessage({
          role: 'system',
          content: '✅ 学情已确认。请选择题型、题量和难度。',
          type: 'confirm',
        });
        appendMessage({
          role: 'assistant',
          content: placeholder,
          step: nextIndex,
          type: nextStep?.type,
        });
        return;
      }

      setSteps((prev) => prev.map((step, index) => {
        if (index === stepIndex) {
          const content = isExam && current.type === 'outline'
            ? formatExamSpecMarkdown(examSpecRef.current, examSubjectRef.current, examSpecRef.current.types)
            : step.content;
          return { ...step, status: 'completed' as const, content };
        }
        if (index === nextIndex) return { ...step, status: 'processing' as const, content: '' };
        return step;
      }));
      setCurrentStepIndex(nextIndex);
      appendMessage({
        role: 'system',
        content: `✅ 已确认「${current.title}」，进入第 ${nextIndex + 1} 步`,
        type: 'confirm',
      });
      const msgId = appendMessage({
        role: 'assistant',
        content: '',
        step: nextIndex,
        type: nextStep?.type,
      });
      if (taskId && nextStep?.type) {
        await streamIntoStep(nextStep.type, nextIndex, msgId);
      }
    } catch (error: any) {
      message.error(error?.message || '推进加工阶段失败');
    } finally {
      setLoading(false);
    }
  }, [appendMessage, streamIntoStep]);

  const regenerateStep = useCallback(async () => {
    if (streamingRef.current) return;
    const taskId = taskIdRef.current;
    const stepIndex = currentStepIndexRef.current;
    const current = stepsRef.current[stepIndex];
    if (!current || current.status === 'completed') return;
    if (selectedTemplateRef.current === '试卷模板' && current.type === 'outline') {
      setExamSpecOpen(true);
      return;
    }
    setSteps((prev) => prev.map((step, index) => (
      index === stepIndex ? { ...step, content: '', status: 'processing' as const } : step
    )));
    appendMessage({
      role: 'system',
      content: `🔄 正在重新生成「${current.title}」`,
      type: 'system',
    });
    const msgId = appendMessage({
      role: 'assistant',
      content: '',
      type: current.type,
      step: stepIndex,
    });
    if (taskId) {
      await streamIntoStep(current.type, stepIndex, msgId);
    }
    message.success(`已重新生成「${current.title}」`);
  }, [appendMessage, streamIntoStep]);

  const exportMarkdown = useMemo(() => {
    const filled = [...steps].reverse().find((step) => Boolean(step.content?.trim()));
    return cleanExportMarkdown(filled?.content || '', topic);
  }, [steps, topic]);

  const examDraftMarkdown = useMemo(() => {
    const refine = steps.find((step) => step.type === 'refine')?.content || '';
    const content = steps.find((step) => step.type === 'content')?.content || '';
    return refine.trim() || content.trim() || '';
  }, [steps]);

  const examPaperMarkdown = useMemo(
    () => pickExamVisibleMarkdown('content', examDraftMarkdown) || splitExamMarkdown(examDraftMarkdown).paper,
    [examDraftMarkdown],
  );
  const examAnswerMarkdown = useMemo(() => splitExamMarkdown(examDraftMarkdown).answers, [examDraftMarkdown]);

  const currentStep = useMemo(() => steps[currentStepIndex] || null, [steps, currentStepIndex]);

  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    return ((currentStepIndex + 1) / steps.length) * 100;
  }, [currentStepIndex, steps.length]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsStreaming(true);
    setIsInitialized(false);
    setSessionStarted(false);
    setChatMessages([]);
    setHistoryMaterials([]);
    setCurrentTaskId('');
    setTopic('');
    setExamSpec(DEFAULT_EXAM_SPEC);
    setExamSubject('数学');
    setExamSpecOpen(false);
    taskIdRef.current = '';
    loadedIdRef.current = '';
    setSearchParams({});
  }, [setSearchParams]);

  return {
    selectedTemplate,
    selectedTemplateMeta,
    steps,
    currentStep,
    currentStepIndex,
    hasSteps,
    isStreaming,
    isInitialized,
    sessionStarted,
    loading,
    progress,
    chatMessages,
    historyMaterials,
    currentTaskId,
    topic,
    examSpec,
    examSubject,
    examSpecOpen,
    examTypeCatalog: currentExamCatalog(),
    examPaperMarkdown,
    examAnswerMarkdown,
    setExamSpecOpen,
    setExamSpec: (spec: ExamSpec) => {
      setExamSpec(spec);
      if (selectedTemplateRef.current === '试卷模板' && stepsRef.current[currentStepIndexRef.current]?.type === 'outline') {
        const specText = formatExamSpecMarkdown(spec, examSubjectRef.current, spec.types);
        const stepIndex = currentStepIndexRef.current;
        setSteps((prev) => prev.map((step, index) => (
          index === stepIndex ? { ...step, content: specText } : step
        )));
      }
    },
    exportMarkdown,
    selectTemplate,
    sendMessage,
    confirmStep,
    confirmExamSpec,
    regenerateStep,
    reset,
  };
};
