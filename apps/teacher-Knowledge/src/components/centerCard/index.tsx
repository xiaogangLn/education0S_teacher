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

interface CenterPanelProps {
  steps?: StepData[];
  currentStepIndex?: number;
  hasSteps?: boolean;
  isStreaming?: boolean;
  isInitialized?: boolean;
  sessionStarted?: boolean;
  loading?: boolean;
  progress?: number;
  selectedTemplate?: TemplateType | null;
  chatMessages?: ChatMessage[];
  onConfirmStep?: () => void;
  onSendMessage?: (message: string) => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  steps = [],
  currentStepIndex = 0,
  hasSteps = false,
  isStreaming = false,
  isInitialized = false,
  sessionStarted = false,
  loading = false,
  progress = 0,
  selectedTemplate = null,
  chatMessages = [],
  onConfirmStep,
  onSendMessage,
}) => {
  const [messageValue, setMessageValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 当流式结束或步骤变化时，显示确认按钮
  useEffect(() => {
    if (!isStreaming && steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      if (currentStep && currentStep.status !== 'completed') {
        setShowConfirm(true);
      } else {
        setShowConfirm(false);
      }
    } else {
      setShowConfirm(false);
    }
  }, [isStreaming, steps, currentStepIndex]);

  const handleSend = () => {
    if (messageValue.trim()) {
      // 发送消息时隐藏确认按钮
      setShowConfirm(false);
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
            <div className="prose prose-sm max-w-none">
              <StepRenderer
                steps={steps.length > 0 ? steps : [{
                  id: 'temp',
                  title: '生成中',
                  type: 'init',
                  status: 'processing',
                  content: msg.content,
                  confirmable: false,
                }]}
                typewriter={true}
                typingSpeed={25}
                showConfirm={false}
                externalStepIndex={msg.step !== undefined ? msg.step : 0}
                onStepComplete={() => {console.log('步骤完成')}}
                customComponents={{
                  callout: ({ children, ...props }: any) => {
                    const type = props['data-type'] || 'info';
                    const title = props['data-title'] || '';
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
  // 渲染确认按钮（在 Markdown 组件下方）
  // ============================================================
  const renderConfirmButton = () => {
    if (!showConfirm || !hasSteps || steps.length === 0) return null;

    const currentStep = steps[currentStepIndex];
    if (!currentStep || currentStep.status === 'completed') return null;

    const isLastStep = currentStepIndex >= steps.length - 1;

    return (
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>💡 发送消息 = 修改当前步骤</span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="text-blue-500">✅ 确认后进入下一步</span>
        </div>
        <Button
          size="small"
          type="primary"
          className="rounded-full bg-green-500 hover:bg-green-600 border-green-500"
          onClick={onConfirmStep}
          disabled={loading}
        >
          {isLastStep ? '🎉 完成生成' : '✅ 确认，进入下一步'}
        </Button>
      </div>
    );
  };

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
            <p className="text-xs mt-2 text-gray-400">选择「教案模板」或「课件模板」可启动五阶段交互生成</p>
          </div>
        </div>

        <div className="p-3.5 bg-white border-t border-gray-100">
          <div className="flex gap-2 items-end opacity-50">
            <Input.TextArea
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              placeholder="💬 请先选择模板..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="flex-1 !min-h-[44px] !rounded-2xl"
              disabled
            />
            <Button type="primary" icon={<SendOutlined />} shape="circle" size="large" disabled />
          </div>
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
            <Tag color="green" className="text-xs">已选: {selectedTemplate}</Tag>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50/50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">{hasSteps ? '📝' : '📄'}</div>
            <p className="text-base font-medium text-gray-700">已选择「{selectedTemplate}」</p>
            <p className="text-sm text-gray-500 mt-2">
              {hasSteps 
                ? '发送消息将启动五阶段交互生成，每步需确认后继续' 
                : '发送消息将直接生成内容，无需步骤确认'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Tag color={hasSteps ? 'blue' : 'green'}>
                {hasSteps ? '🔄 五阶段交互' : '⚡ 快速生成'}
              </Tag>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-white border-t border-gray-100">
          <div className="flex gap-2 items-end">
            <Input.TextArea
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              placeholder={hasSteps 
                ? '💬 输入指令开始五阶段生成...' 
                : '💬 输入指令开始生成...'}
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="flex-1 !min-h-[44px] !rounded-2xl"
              onPressEnter={(e) => {
                if (!e.shiftKey && messageValue.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              shape="circle"
              size="large"
              className="flex-shrink-0 shadow-sm"
              onClick={handleSend}
              disabled={!messageValue.trim()}
            />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 状态3: 会话进行中 - 加载状态
  // ============================================================
  if (loading) {
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
          <Spin tip={`正在生成 ${selectedTemplate}...`} size="large">
            <div className="h-32" />
          </Spin>
        </div>

        <div className="p-3.5 bg-white border-t border-gray-100 opacity-50">
          <div className="flex gap-2 items-end">
            <Input.TextArea
              value={messageValue}
              placeholder="💬 生成中，请稍候..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="flex-1 !min-h-[44px] !rounded-2xl"
              disabled
            />
            <Button type="primary" icon={<SendOutlined />} shape="circle" size="large" disabled />
          </div>
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
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              {renderMessage(msg)}
            </div>
          ))}
          {/* 确认按钮放在消息列表底部，Markdown 组件下方 */}
          {renderConfirmButton()}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入区 */}
        <div className="p-3.5 bg-white border-t border-gray-100">
          <div className="flex gap-2 items-end">
            <Input.TextArea
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              placeholder="💬 继续发送消息修改当前步骤内容..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="flex-1 !min-h-[44px] !rounded-2xl"
              onPressEnter={(e) => {
                if (!e.shiftKey && messageValue.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              shape="circle"
              size="large"
              className="flex-shrink-0 shadow-sm"
              onClick={handleSend}
              disabled={!messageValue.trim() || loading}
            />
          </div>
        </div>
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
          <p className="text-sm text-gray-500 mt-2">「{selectedTemplate}」已生成</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button type="primary" className="rounded-full">📄 查看</Button>
            <Button className="rounded-full">✏️ 编辑</Button>
            <Button className="rounded-full">📥 导出</Button>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <Input.TextArea
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            placeholder="💬 继续输入指令..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 !min-h-[44px] !rounded-2xl"
            onPressEnter={(e) => {
              if (!e.shiftKey && messageValue.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            shape="circle"
            size="large"
            className="flex-shrink-0 shadow-sm"
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};