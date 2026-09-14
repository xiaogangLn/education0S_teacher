// components/centerCard/index.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  SendOutlined,
  StarOutlined,
  LoadingOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Tag, Tooltip, Spin, Avatar, Badge } from 'antd';
import { StepRenderer } from '@ui/components/MarkdownRenderer';
import type { StepData, TemplateType } from '@/pages/workbench/Instrument/types';
import type { ChatMessage } from '@/pages/workbench/Instrument/hooks/useTemplateSelection';
import { ExamSpecModal, pickExamVisibleMarkdown, type ExamSpec, type ExamTypeDef } from '@/pages/workbench/Instrument/components/ExamSpecBar';
import { pickCoursewareVisibleMarkdown, pickLessonPlanVisibleMarkdown } from '@/utils/exportByTemplate';
import { localizeThinkingText } from '@/utils/localizeThinking';

function displayStageSteps(
  steps: StepData[],
  template?: TemplateType | null,
  override?: { stepIndex: number; content: string },
): StepData[] {
  const source = steps.length > 0 ? steps : [{
    id: 'temp',
    title: '生成中',
    type: 'init' as const,
    status: 'processing' as const,
    content: override?.content || '',
    confirmable: false,
  }];

  return source.map((step, index) => {
    // 有 override 时必须用它（含空字符串），避免进入下一阶段仍回落到上一阶段正文
    const raw = (override && index === override.stepIndex)
      ? String(override.content ?? '')
      : (step.content || '');
    let content = raw;
    if (!raw.trim()) {
      content = '';
    } else if (template === '试卷模板') {
      content = pickExamVisibleMarkdown(step.type, raw);
    } else if (template === '课件模板') {
      content = pickCoursewareVisibleMarkdown(step.type, raw);
    } else if (template === '教案模板') {
      content = pickLessonPlanVisibleMarkdown(step.type, raw);
    }
    return { ...step, content };
  });
}

/** 一体式输入栏：白底圆角容器 + 右侧紫渐变发送按钮 */
const MessageInputBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
  sendDisabled?: boolean;
}> = ({ value, onChange, onSend, placeholder, disabled = false, sendDisabled }) => {
  const cannotSend = sendDisabled ?? (!value.trim() || disabled);
  return (
    <div
      className={`flex items-end gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-2.5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={disabled}
        variant="borderless"
        className="flex-1 !min-h-[36px] !resize-none !bg-transparent !px-0 !py-1.5 !text-[15px] !leading-6 !shadow-none placeholder:!text-gray-400"
        onPressEnter={(e) => {
          if (!e.shiftKey && value.trim() && !cannotSend) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        type="button"
        disabled={cannotSend}
        onClick={onSend}
        aria-label="发送"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-none text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, #7C6CFF 0%, #6B5CFF 45%, #5B8DEF 100%)',
          boxShadow: cannotSend ? 'none' : '0 4px 12px rgba(108, 99, 255, 0.35)',
          cursor: cannotSend ? 'not-allowed' : 'pointer',
        }}
      >
        <SendOutlined className="text-base" />
      </button>
    </div>
  );
};

interface CenterPanelProps {
  variant?: 'generate' | 'research';
  steps?: StepData[];
  currentStepIndex?: number;
  hasSteps?: boolean;
  isStreaming?: boolean;
  isInitialized?: boolean;
  sessionStarted?: boolean;
  loading?: boolean;
  progress?: number;
  selectedTemplate?: TemplateType | null;
  selectedTemplateTitle?: string | null;
  chatMessages?: ChatMessage[];
  savingToKnowledge?: boolean;
  examSpec?: ExamSpec;
  examSubject?: string;
  examTypeCatalog?: ExamTypeDef[];
  examSpecOpen?: boolean;
  onExamSpecChange?: (spec: ExamSpec) => void;
  onExamSpecSubmit?: (spec: ExamSpec) => void;
  onExamSpecOpenChange?: (open: boolean) => void;
  onConfirmStep?: () => void;
  onRegenerateStep?: () => void;
  onSendMessage?: (message: string) => void;
  onSaveToKnowledge?: () => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  variant = 'generate',
  steps = [],
  currentStepIndex = 0,
  hasSteps = false,
  isStreaming = false,
  isInitialized = false,
  sessionStarted = false,
  loading = false,
  progress = 0,
  selectedTemplate = null,
  selectedTemplateTitle = null,
  chatMessages = [],
  savingToKnowledge = false,
  examSpec,
  examSubject,
  examTypeCatalog,
  examSpecOpen = false,
  onExamSpecSubmit,
  onExamSpecOpenChange,
  onConfirmStep,
  onRegenerateStep,
  onSendMessage,
  onSaveToKnowledge,
}) => {
  const [messageValue, setMessageValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const templateLabel = selectedTemplateTitle || selectedTemplate;

  const handleSend = () => {
    if (messageValue.trim()) {
      onSendMessage?.(messageValue);
      setMessageValue('');
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, currentStepIndex]);

  /** 当前未完成阶段：把确认按钮挂在对应助手消息上（没有 step 时退化为最后一条助手消息） */
  const confirmHostMessageId = (() => {
    if (isStreaming) return null;
    const current = steps[currentStepIndex];
    if (!current || current.status === 'completed') return null;
    const assistants = chatMessages.filter((item) => item.role === 'assistant');
    const matched = assistants.filter((item) => item.step === currentStepIndex);
    if (matched.length) return matched[matched.length - 1].id;
    const hasAnyStep = assistants.some((item) => typeof item.step === 'number');
    if (!hasAnyStep && assistants.length) return assistants[assistants.length - 1].id;
    return null;
  })();

  const renderResearchMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    const isResult = Array.isArray(msg.sources);
    const sources = msg.sources || [];
    const kindLabel: Record<string, string> = {
      document: '文档',
      textbook_chapter: '教材章节',
      textbook_catalog: '教材目录',
      lesson_plan: '教案',
      courseware: '课件',
      exam: '试卷',
    };
    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <Avatar
          size={32}
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          className={isUser ? 'bg-blue-500 flex-shrink-0' : 'bg-purple-500 flex-shrink-0'}
        />
        <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
            <span className="text-xs font-medium text-gray-600">{isUser ? '我' : '资料助手'}</span>
            <span className="text-xs text-gray-400">{msg.timestamp}</span>
          </div>
          <div className={isUser
            ? 'max-w-[320px] rounded-2xl px-4 py-3 bg-blue-500 text-white rounded-br-sm'
            : 'rounded-2xl px-4 py-3 bg-white border border-gray-200 rounded-bl-sm shadow-sm w-full space-y-3'}
          >
            {isUser ? (
              <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
            ) : isResult ? (
              <>
                <div>
                  <div className="mb-2">
                    <Tag color="blue">系统内资料</Tag>
                  </div>
                  {sources.length ? (
                    <div className="space-y-2">
                      {sources.map((item) => (
                        <div key={item.id} className="rounded-lg bg-blue-50/70 px-3 py-2">
                          <div className="text-sm font-medium text-gray-800">{item.title}</div>
                          <div className="mt-0.5 text-[11px] text-gray-500">
                            {[kindLabel[item.kind] || item.kind, item.subject].filter(Boolean).join(' · ')}
                          </div>
                          {item.excerpt ? (
                            <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{item.excerpt}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">系统内暂无直接匹配的资料</div>
                  )}
                </div>
                <div>
                  <div className="mb-2">
                    <Tag color="purple">AI 查出的资料</Tag>
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words text-gray-800">
                    {msg.content || '正在查询...'}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (variant === 'research') {
    const canSave = chatMessages.some((item) => item.role === 'user');
    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 查资料</span>
            <Tag color="blue" className="text-xs">系统检索 + AI 查询</Tag>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id}>{renderResearchMessage(msg)}</div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 pl-11">
              <LoadingOutlined className="animate-spin" /> 正在查找资料...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3.5 pl-4 bg-white border-t border-gray-100">
          <div className="mb-2">
            <Button
              type="primary"
              className="rounded-full"
              loading={savingToKnowledge}
              disabled={!canSave || loading}
              onClick={onSaveToKnowledge}
            >
              整理并写入个人知识库
            </Button>
          </div>
          <MessageInputBar
            value={messageValue}
            onChange={setMessageValue}
            onSend={handleSend}
            placeholder="输入课题、知识点或资料名称..."
            disabled={loading}
            sendDisabled={!messageValue.trim() || loading}
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // 渲染消息
  // ============================================================
  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-500 text-xs px-4 py-1.5 rounded-full max-w-[90%]">
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar
        size={32}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        className={isUser ? 'bg-blue-500 flex-shrink-0' : 'bg-purple-500 flex-shrink-0'}
      />
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-xs font-medium text-gray-600">
            {isUser ? '我' : 'AI 助手'}
          </span>
          <span className="text-xs text-gray-400">{msg.timestamp}</span>
          {msg.step !== undefined && (
            <Tag color="blue" className="text-[10px]">
              步骤 {msg.step + 1}
            </Tag>
          )}
        </div>
        {isUser ? (
          // 用户消息 - 宽度自适应，最大宽度 200px，从右往左增长
          <div className="max-w-[200px] rounded-2xl px-4 py-3 bg-blue-500 text-white rounded-br-sm">
            <div className="text-sm whitespace-pre-wrap break-words">
              {msg.content}
            </div>
          </div>
        ) : (
          // AI 消息
          <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 rounded-bl-sm shadow-sm w-full">
            <div className="prose max-w-none text-[17px] leading-8">
              <StepRenderer
                steps={displayStageSteps(steps, selectedTemplate, {
                  stepIndex: msg.step !== undefined ? msg.step : currentStepIndex,
                  content: msg.content || '',
                })}
                typewriter={false}
                showConfirm={confirmHostMessageId === msg.id}
                confirmText={steps[currentStepIndex]?.confirmText || '进入下一步'}
                onConfirm={() => onConfirmStep?.()}
                onRegenerate={() => onRegenerateStep?.()}
                isStreaming={isStreaming && (msg.step === currentStepIndex || confirmHostMessageId === msg.id)}
                reasoning={msg.reasoning ? localizeThinkingText(msg.reasoning) : msg.reasoning}
                expandReasoning
                resultLabel="本阶段结果"
                emptyResultHint={
                  isStreaming && (msg.step === currentStepIndex || confirmHostMessageId === msg.id)
                    ? '等待本阶段思考完成后写入结果...'
                    : '本阶段结果生成后将显示在这里；完整文稿请在右侧「生成记录」预览'
                }
                externalStepIndex={typeof msg.step === 'number' ? msg.step : currentStepIndex}
                onStepComplete={() => undefined}
                customComponents={{
                  callout: ({ children, ...props }: any) => {
                    const type = props['data-type'] || props.type || 'info';
                    const title = props['data-title'] || props.title || '';
                    const colors: Record<string, string> = {
                      info: 'bg-blue-50 border-blue-200 text-blue-700',
                      success: 'bg-green-50 border-green-200 text-green-700',
                      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                      error: 'bg-red-50 border-red-200 text-red-700',
                    };
                    return (
                      <div className={`callout border-l-4 p-3 my-2 rounded-r ${colors[type] || colors.info}`}>
                        {title && <div className="font-medium text-sm">{title}</div>}
                        <div className="text-sm">{children}</div>
                      </div>
                    );
                  },
                  ai: ({ children }: any) => (
                    <div className="ai-annotation p-3 my-2 bg-purple-50 border-l-4 border-purple-400 rounded-r">
                      <span className="text-xs font-medium text-purple-600">🤖 AI 生成</span>
                      <div className="mt-1">{children}</div>
                    </div>
                  ),
                  teacher: ({ children }: any) => (
                    <div className="teacher-edit p-3 my-2 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                      <span className="text-xs font-medium text-amber-600">✏️ 教师修改</span>
                      <div className="mt-1">{children}</div>
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  // ============================================================
  // 加载历史任务
  // ============================================================
  if (loading && !sessionStarted) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 对话区</span>
            <Tag color="processing" className="text-xs flex items-center gap-1">
              <LoadingOutlined className="animate-spin" /> 加载历史记录...
            </Tag>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 min-w-[240px] text-center">
            <Spin size="large" />
            <p className="text-sm text-gray-500 whitespace-nowrap">正在还原对话与生成内容...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 状态1: 未选择模板
  // ============================================================
  if (!selectedTemplate) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 对话区</span>
            <Tag color="gray" className="text-xs">请选择模板</Tag>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-sm font-medium text-gray-600">请从左侧选择参考的内容，右侧选择一个模板</p>
            <p className="text-xs mt-2 text-gray-400">选择教案、课件或试卷模板，将按步骤生成</p>
          </div>
        </div>

        <div className="p-3.5 pl-4 bg-white border-t border-gray-100">
          <MessageInputBar
            value={messageValue}
            onChange={setMessageValue}
            onSend={handleSend}
            placeholder="请先选择模板..."
            disabled
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // 状态2: 已选择模板但未开始会话
  // ============================================================
  if (!sessionStarted) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 对话区</span>
            <Tag color="blue" className="text-xs">
              {hasSteps ? '五阶段交互' : '快速生成'}
            </Tag>
            <Tag color="green" className="text-xs">已选: {templateLabel}</Tag>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">{hasSteps ? '📝' : '📄'}</div>
            <p className="text-base font-medium text-gray-700">已选择「{templateLabel}」</p>
            <p className="text-sm text-gray-500 mt-2">
              {hasSteps 
                ? selectedTemplate === '试卷模板'
                  ? '先在左侧选素材、右侧选试卷模板。发送后将按学情 → 题型难度 → 定稿 → 精修推进'
                  : '发送消息将启动五阶段交互生成，每步需确认后继续' 
                : '发送消息将直接生成内容，无需步骤确认'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Tag color={hasSteps ? 'blue' : 'green'}>
                {hasSteps ? '🔄 五阶段交互' : '⚡ 快速生成'}
              </Tag>
            </div>
          </div>
        </div>

        <div className="p-3.5 pl-4 bg-white border-t border-gray-100">
          <MessageInputBar
            value={messageValue}
            onChange={setMessageValue}
            onSend={handleSend}
            placeholder={hasSteps ? '输入指令开始五阶段生成...' : '输入指令开始生成...'}
            sendDisabled={!messageValue.trim()}
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // 状态3: 会话进行中 - 加载状态
  // ============================================================
  if (loading && !sessionStarted) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 对话区</span>
            <Tag color="processing" className="text-xs flex items-center gap-1">
              <LoadingOutlined className="animate-spin" /> 生成中...
            </Tag>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 min-w-[240px] text-center">
            <Spin size="large" />
            <p className="text-sm text-gray-500 whitespace-nowrap">正在生成 {templateLabel}...</p>
          </div>
        </div>

        <div className="p-3.5 pl-4 bg-white border-t border-gray-100">
          <MessageInputBar
            value={messageValue}
            onChange={setMessageValue}
            onSend={handleSend}
            placeholder="生成中，请稍候..."
            disabled
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // 状态4: 有步骤 - 显示会话 + 步骤
  // ============================================================
  if (hasSteps && steps.length > 0) {
    const currentStep = steps[currentStepIndex] || steps[0];

    return (
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
        {/* 头部 */}
        <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">💬 对话区</span>
            <Tag color="blue" className="text-xs">五阶段交互</Tag>
            <Tag color="red" className="text-xs">非一次性生成</Tag>
            {isStreaming && (
              <Tag color="processing" className="text-xs flex items-center gap-1">
                <LoadingOutlined className="animate-spin" /> 逐字生成中
              </Tag>
            )}
            <Badge 
              count={`${currentStepIndex + 1}/${steps.length}`} 
              className="ml-1"
              style={{ backgroundColor: '#4f46e5' }}
            />
          </div>
          <Space size={2}>
            <Tooltip title="预览"><Button type="text" size="small" icon={<EyeOutlined />} /></Tooltip>
            <Tooltip title="导出"><Button type="text" size="small" icon={<ExportOutlined />} /></Tooltip>
            <Tooltip title="收藏"><Button type="text" size="small" icon={<StarOutlined />} /></Tooltip>
          </Space>
        </div>

        {/* 会话消息列表 */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 space-y-3">
            {selectedTemplate === '试卷模板' && currentStep?.type === 'outline' && currentStep.status !== 'completed' ? (
            <div className="mb-1 rounded-xl border border-indigo-200 bg-white px-4 py-3">
              <div className="text-sm font-medium text-gray-800">请选择题型、题量和难度</div>
              <div className="text-xs text-gray-400 mt-1 mb-3">确认学情后会弹出设置框；关闭后可再次打开。</div>
              <Button type="primary" size="small" onClick={() => onExamSpecOpenChange?.(true)}>
                选择题型与题量
              </Button>
            </div>
          ) : null}
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              {renderMessage(msg)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入区；若当前阶段无助手气泡可挂按钮，则在输入上方补确认条 */}
        <div className="bg-white border-t border-gray-100">
          {!isStreaming
            && currentStep?.status !== 'completed'
            && !confirmHostMessageId && (
            <div className="px-3.5 pt-3 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={loading || isStreaming}
                className="px-5 py-2 rounded-full text-sm font-medium border-none cursor-pointer bg-indigo-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onConfirmStep?.();
                }}
              >
                {loading || isStreaming
                  ? '生成中...'
                  : `✅ ${currentStep?.confirmText || '进入下一步'}`}
              </button>
              <button
                type="button"
                disabled={loading || isStreaming}
                className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRegenerateStep?.();
                }}
              >
                🔄 重新生成
              </button>
            </div>
          )}
          <div className="p-3.5 pl-4">
            <MessageInputBar
              value={messageValue}
              onChange={setMessageValue}
              onSend={handleSend}
              placeholder={
                isStreaming
                  ? '正在逐字生成，请稍候...'
                  : steps.every((step) => step.status === 'completed') || currentStep?.type === 'refine'
                    ? '终稿不满意？直接说明修改意见，将按你的要求优化终稿...'
                    : `对「${currentStep?.title || '当前阶段'}」不满意？直接说明修改意见，将只优化这一阶段...`
              }
              disabled={loading || isStreaming}
              sendDisabled={!messageValue.trim() || loading || isStreaming}
            />
          </div>
        </div>
        {selectedTemplate === '试卷模板' && examSpec && onExamSpecSubmit ? (
          <ExamSpecModal
            open={examSpecOpen}
            spec={examSpec}
            subject={examSubject}
            catalog={examTypeCatalog}
            confirmLoading={loading || isStreaming}
            onCancel={() => onExamSpecOpenChange?.(false)}
            onOk={onExamSpecSubmit}
          />
        ) : null}
      </div>
    );
  }

  // ============================================================
  // 状态5: 无步骤（快速生成完成）
  // ============================================================
  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">💬 对话区</span>
          <Tag color="green" className="text-xs">✅ 生成完成</Tag>
        </div>
        <Space size={2}>
          <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} /></Tooltip>
          <Tooltip title="预览"><Button type="text" size="small" icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="导出"><Button type="text" size="small" icon={<ExportOutlined />} /></Tooltip>
          <Tooltip title="收藏"><Button type="text" size="small" icon={<StarOutlined />} /></Tooltip>
        </Space>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-base font-medium text-gray-700">生成完成！</p>
          <p className="text-sm text-gray-500 mt-2">「{templateLabel}」已生成</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button type="primary" className="rounded-full">📄 查看</Button>
            <Button className="rounded-full">✏️ 编辑</Button>
            <Button className="rounded-full">📥 导出</Button>
          </div>
        </div>
      </div>

      <div className="p-3.5 pl-4 bg-white border-t border-gray-100">
        <MessageInputBar
          value={messageValue}
          onChange={setMessageValue}
          onSend={handleSend}
          placeholder="继续输入指令..."
          sendDisabled={!messageValue.trim()}
        />
      </div>
    </div>
  );
};