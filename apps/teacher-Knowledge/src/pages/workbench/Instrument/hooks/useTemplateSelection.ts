// pages/Instrument/hooks/useTemplateSelection.ts
import { useState, useCallback, useMemo } from 'react';
import type { TemplateType, StepData } from '../types';
import { getMarkdownStepsByTemplate, hasStepsByTemplate } from '@/utils/markdownSteps';

// 消息类型定义
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  step?: number;
  type?: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'confirm' | 'message' | 'system';
}

// 步骤名称映射 - 添加 confirm 类型
const stepNames: Record<string, string> = {
  init: '📝 初始化',
  analysis: '📊 学情分析',
  outline: '📌 大纲生成',
  content: '📄 内容填充',
  refine: '✨ 精修定稿',
  confirm: '✅ 确认完成',
};

export const useTemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // 判断是否支持步骤
  const hasSteps = useMemo(() => {
    if (!selectedTemplate) return false;
    return hasStepsByTemplate(selectedTemplate);
  }, [selectedTemplate]);

  // 选择模板
  const selectTemplate = useCallback((template: TemplateType) => {
    setSelectedTemplate(template);
    setCurrentStepIndex(0);
    setSteps([]);
    setIsStreaming(false);
    setIsInitialized(false);
    setSessionStarted(false);
    setChatMessages([]);
  }, []);

  // 发送消息 - 初始化会话或修改当前步骤
  const sendMessage = useCallback((message: string) => {
    if (!selectedTemplate) {
      console.warn('请先选择模板');
      return false;
    }

    // 添加用户消息到聊天记录
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'message',
    };
    setChatMessages(prev => [...prev, userMsg]);

    // 如果是教案或课件模板，启动五阶段流程
    if (hasStepsByTemplate(selectedTemplate)) {
      setLoading(true);

      // 模拟 API 调用
      setTimeout(() => {
        const stepData = getMarkdownStepsByTemplate(selectedTemplate);
        setSteps(stepData);
        setCurrentStepIndex(0);
        setIsStreaming(true);
        setIsInitialized(true);
        setSessionStarted(true);
        setLoading(false);

        // 添加 AI 响应消息
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `### 📝 开始生成「${selectedTemplate}」\n\n已收到您的指令，正在生成第一步内容...`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'init',
          step: 0,
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }, 800);

      return true;
    } else {
      // 其他模板直接生成
      setLoading(true);
      setTimeout(() => {
        setSteps([]);
        setIsStreaming(false);
        setIsInitialized(true);
        setSessionStarted(true);
        setLoading(false);

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `✅ 「${selectedTemplate}」已生成完成！\n\n您可以查看、编辑或导出。`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'system',
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }, 600);
      return true;
    }
  }, [selectedTemplate]);

  // 确认当前步骤，进入下一步
  const confirmStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);

      // 添加系统确认消息
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: `✅ 已确认，进入第 ${currentStepIndex + 2} 步`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'confirm',
      };
      setChatMessages(prev => [...prev, confirmMsg]);

      // 添加 AI 下一步消息
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        // 使用类型安全的方式获取步骤名称
        const stepType = nextStep.type as keyof typeof stepNames;
        const stepName = stepNames[stepType] || '步骤';

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `### ${stepName}\n\n${nextStep.content}`,
          timestamp: new Date().toLocaleTimeString(),
          step: currentStepIndex + 1,
          type: nextStep.type,
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } else {
      setIsStreaming(false);
      setIsInitialized(true);

      const completeMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: '🎉 所有步骤已完成！教案已生成',
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
      };
      setChatMessages(prev => [...prev, completeMsg]);
    }
  }, [currentStepIndex, steps]);

  // 获取当前步骤
  const currentStep = useMemo(() => {
    return steps[currentStepIndex] || null;
  }, [steps, currentStepIndex]);

  // 获取进度
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    return ((currentStepIndex + 1) / steps.length) * 100;
  }, [currentStepIndex, steps.length]);

  // 重置
  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsStreaming(true);
    setIsInitialized(false);
    setSessionStarted(false);
    setChatMessages([]);
  }, []);

  return {
    selectedTemplate,
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
    selectTemplate,
    sendMessage,
    confirmStep,
    reset,
  };
};