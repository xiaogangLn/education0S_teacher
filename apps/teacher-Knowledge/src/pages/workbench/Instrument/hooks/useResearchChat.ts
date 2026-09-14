import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { knowledgeService, processingService, searchService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';
import type { ChatMessage, ResearchSource } from './useTemplateSelection';

function nowTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

function makeMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: nowTime(),
    type: 'message',
  };
}

const GREETING = '你好，我可以帮你查找校内文档、教材章节和已发布教案。直接输入课题或知识点即可，查完后可整理写入个人知识库。';

function conversationMarkdown(messages: ChatMessage[]) {
  const body = messages
    .filter((item) => item.role !== 'system')
    .map((item) => `### ${item.role === 'user' ? '我' : 'AI 助手'}\n\n${item.content}`)
    .join('\n\n');
  return `# 资料查询笔记\n\n整理时间：${new Date().toLocaleString('zh-CN')}\n\n${body}`;
}

function mapMessages(raw: any[]): ChatMessage[] {
  return (raw || [])
    .filter((item) => item?.role === 'user' || item?.role === 'assistant')
    .map((item) => ({
      id: String(item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      role: item.role,
      content: String(item.content || ''),
      timestamp: item.timestamp || nowTime(),
      type: item.type || 'message',
      sources: Array.isArray(item.sources) ? item.sources : undefined,
    }));
}

export const useResearchChat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const org = useOrgContext();
  const taskIdRef = useRef(searchParams.get('id') || '');
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedIdRef = useRef('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([makeMessage('assistant', GREETING)]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const persistMessages = useCallback(async (taskId: string, messages: ChatMessage[]) => {
    if (!taskId) return;
    if (!messages.some((item) => item.role === 'user')) return;
    await processingService.saveConversation(taskId, messages);
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id || loadedIdRef.current === id) return;
    let cancelled = false;
    taskIdRef.current = id;
    setLoading(true);
    processingService.getDetail(id).then((res) => {
      if (cancelled) return;
      const task = extractPayload<{ task: any }>(res)?.task || extractPayload<any>(res);
      const restored = mapMessages(task?.messages || []);
      setChatMessages(restored.length ? restored : [makeMessage('assistant', GREETING)]);
      loadedIdRef.current = id;
    }).catch(() => {
      if (!cancelled) message.error('加载查资料记录失败');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    const taskId = taskIdRef.current;
    if (!taskId || loadedIdRef.current !== taskId) return;
    if (!chatMessages.some((item) => item.role === 'user')) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      void persistMessages(taskId, chatMessages);
    }, 400);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [chatMessages, persistMessages]);

  const sendMessage = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question) return false;
    const user = loadPersistedUser();
    const userMsg = makeMessage('user', question);
    setChatMessages((prev) => [...prev, userMsg]);
    const assistantId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: nowTime(),
      type: 'message',
      sources: [],
    };
    setChatMessages((prev) => [...prev, assistantMsg]);
    setLoading(true);
    try {
      let sources: ResearchSource[] = [];
      let answer = '';
      await searchService.researchStream(
        {
          question,
          subject: user?.subjects?.[0],
          grade_id: org.gradeId,
        },
        {
          onSources: (next) => {
            sources = next;
            setChatMessages((prev) =>
              prev.map((item) => (item.id === assistantId ? { ...item, sources: next } : item)),
            );
          },
          onDelta: (text) => {
            answer += text;
            setChatMessages((prev) =>
              prev.map((item) => (item.id === assistantId ? { ...item, content: item.content + text } : item)),
            );
          },
          onDone: (payload) => {
            sources = payload.sources?.length ? payload.sources : sources;
            answer = payload.answer || answer;
            setChatMessages((prev) =>
              prev.map((item) =>
                item.id === assistantId
                  ? { ...item, content: answer || item.content, sources }
                  : item,
              ),
            );
          },
          onError: (msg) => {
            answer = answer || msg;
            setChatMessages((prev) =>
              prev.map((item) =>
                item.id === assistantId ? { ...item, content: item.content || msg } : item,
              ),
            );
          },
        },
      );
      if (!answer) {
        answer = '没有找到可展示的资料。';
        setChatMessages((prev) =>
          prev.map((item) => (item.id === assistantId ? { ...item, content: answer } : item)),
        );
      }
      if (!taskIdRef.current) {
        const created = extractPayload<{ task_id?: string }>(
          await processingService.createResearch({
            topic: question,
            subject: user?.subjects?.[0] || '综合',
            class_id: isCommercialTenant(user) ? undefined : org.classId,
            grade_id: isCommercialTenant(user) ? undefined : org.gradeId,
            messages: [userMsg, { ...assistantMsg, content: answer, sources }],
          }),
        );
        const taskId = created?.task_id || '';
        if (taskId) {
          taskIdRef.current = taskId;
          loadedIdRef.current = taskId;
          setSearchParams({ mode: 'research', id: taskId });
        }
      }
      return true;
    } catch (err: any) {
      setChatMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId
            ? { ...item, content: item.content || err?.message || '查询失败，请稍后重试。' }
            : item,
        ),
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [org.classId, org.gradeId, setSearchParams]);

  const saveToKnowledge = useCallback(async () => {
    const start = chatMessages.findIndex((item) => item.role === 'user');
    if (start < 0) {
      message.warning('请先查询一轮资料，再写入个人知识库');
      return;
    }
    const dialog = chatMessages.slice(start);
    setSaving(true);
    try {
      const firstQuestion = dialog[0]?.content || '资料笔记';
      const response = await knowledgeService.create({
        title: firstQuestion.slice(0, 40),
        type: 'document',
        permission: 'personal',
        content: conversationMarkdown(dialog),
        grade_id: org.gradeId,
        category: '资料查询',
        metadata: { source_type: 'research_chat', task_id: taskIdRef.current },
      });
      const created = extractPayload<{ id?: string }>(response);
      message.success('已整理并写入个人知识库');
      if (created?.id) {
        navigate(`/knowledge/DocumentEditor?id=${created.id}`);
      }
    } catch (err: any) {
      message.error(err?.message || '写入知识库失败');
    } finally {
      setSaving(false);
    }
  }, [chatMessages, navigate, org.gradeId]);

  return {
    chatMessages,
    loading,
    saving,
    sendMessage,
    saveToKnowledge,
  };
};
