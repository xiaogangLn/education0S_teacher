// packages/ui/src/components/MarkdownRenderer/StepRenderer.tsx
import React, { useEffect } from 'react';
import { Steps, type StepsProps } from 'antd';
import { TypewriterEffect } from './TypewriterEffect';
import { StepConfirm } from './CustomComponents';
import type { StepData } from './types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircleOutlined } from '@ant-design/icons';

interface StepRendererProps {
  steps: StepData[];
  typewriter?: boolean;
  typingSpeed?: number;
  customComponents?: Record<string, React.ComponentType<any>>;
  onStepComplete?: (stepIndex: number) => void;
  onAllComplete?: () => void;
  externalStepIndex?: number;
  showConfirm?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  onModify?: () => void;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export const StepRenderer: React.FC<StepRendererProps> = ({
  steps: initialSteps,
  typewriter = true,
  typingSpeed = 30,
  customComponents = {},
  onStepComplete,
  onAllComplete,
  externalStepIndex = 0,
  showConfirm = true,
  confirmText = '确认进入下一阶段',
  onConfirm,
  onModify,
  onRegenerate,
  isStreaming = false,
}) => {
  // 使用外部传入的 steps，而不是内部管理
  const steps = initialSteps;
  const stepIndex = Math.min(externalStepIndex, steps.length - 1);
  const currentStep = steps[stepIndex] || null;

  // 当步骤完成时触发回调
  useEffect(() => {
    if (currentStep?.status === 'completed') {
      onStepComplete?.(stepIndex);
    }
  }, [currentStep, stepIndex, onStepComplete]);

  // 所有步骤完成时触发回调
  const allCompleted = steps.every(step => step.status === 'completed');
  useEffect(() => {
    if (allCompleted && steps.length > 0) {
      onAllComplete?.();
    }
  }, [allCompleted, steps.length, onAllComplete]);

  const getStepStatus = (status: StepData['status']): StepStatus => {
    const map: Record<StepData['status'], StepStatus> = {
      pending: 'wait',
      processing: 'process',
      completed: 'finish',
    };
    return map[status] || 'wait';
  };

  if (!currentStep) {
    return null;
  }

  const stepItems: StepsProps['items'] = steps.map((step, index) => ({
    title: step.title,
    status: getStepStatus(step.status) as StepsProps['status'],
    icon: step.status === 'completed' ? <CheckCircleOutlined /> : undefined,
    disabled: index > stepIndex,
  }));

  // 判断当前步骤是否已完成
  const isStepCompleted = currentStep.status === 'completed';

  return (
    <div className="step-renderer">
      {/* 步骤指示器 */}
      <Steps
        current={stepIndex}
        status={getStepStatus(currentStep.status)}
        items={stepItems}
        size="small"
        className="step-indicator"
      />

      {/* 当前步骤内容 */}
      <div className="step-content">
        <div className="step-header">
          <h3 className="step-title">
            {currentStep.type === 'init' && '📝 阶段1：初始化'}
            {currentStep.type === 'analysis' && '📊 阶段2：学情分析'}
            {currentStep.type === 'outline' && '📌 阶段3：大纲生成'}
            {currentStep.type === 'content' && '📄 阶段4：内容填充'}
            {currentStep.type === 'refine' && '✨ 阶段5：精修定稿'}
            {currentStep.type === 'confirm' && '✅ 确认完成'}
          </h3>
          <div className="step-status-badge">
            {currentStep.status === 'pending' && <span className="badge-pending">⏳ 待开始</span>}
            {currentStep.status === 'processing' && <span className="badge-processing">🔄 进行中</span>}
            {currentStep.status === 'completed' && <span className="badge-completed">✅ 已完成</span>}
          </div>
        </div>

        <div className="step-body">
          {typewriter && currentStep.status !== 'completed' ? (
            <TypewriterEffect
              content={currentStep.content}
              speed={typingSpeed}
              autoStart={currentStep.status === 'processing' || currentStep.status === 'pending'}
              onComplete={() => {
                // 打字完成后标记步骤为 processing（如果当前是 pending）
                if (currentStep.status === 'pending') {
                  // 这里可以触发状态更新
                }
                // 触发步骤完成回调
                onStepComplete?.(stepIndex);
              }}
              customComponents={customComponents}
            />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {currentStep.content}
            </ReactMarkdown>
          )}
        </div>
        <div className="step-actions">
          <StepConfirm
            onConfirm={onConfirm || (() => {})}
            onModify={onModify}
            onRegenerate={onRegenerate}
            confirmText={confirmText}
          />
        </div>

        {currentStep.status === 'completed' && (
          <div className="step-completed">
            <span className="text-green-500">✅ 此步骤已完成</span>
          </div>
        )}
      </div>

      <style>{`
        .step-renderer {
          padding: 12px 0;
          background: transparent;
          border-radius: 0;
        }
        .step-indicator {
          margin-bottom: 16px;
        }
        .step-content {
          background: #fafcff;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #e9edf4;
        }
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .step-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #0b1a33;
        }
        .step-status-badge .badge-pending {
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 11px;
        }
        .step-status-badge .badge-processing {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 11px;
        }
        .step-status-badge .badge-completed {
          background: #d1fae5;
          color: #065f46;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 11px;
        }
        .step-body {
          min-height: 40px;
          font-size: 14px;
          line-height: 1.7;
        }
        .step-body h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 12px 0 8px;
        }
        .step-body h2 {
          font-size: 17px;
          font-weight: 600;
          margin: 10px 0 6px;
        }
        .step-body h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 8px 0 4px;
        }
        .step-body p {
          margin: 4px 0;
        }
        .step-body ul, .step-body ol {
          padding-left: 20px;
          margin: 4px 0;
        }
        .step-body li {
          margin: 2px 0;
        }
        .step-actions {
          margin-top: 12px;
          padding-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .step-actions .desc {
          font-size: 14px;
          color: #9CA3AF;
        }
        .step-actions .btn {
          padding: 6px 18px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: 0.15s;
        }
        .step-actions .btn-primary {
          background: #4f46e5;
          color: #fff;
        }
        .step-actions .btn-primary:hover {
          background: #4338ca;
        }
        .step-actions .btn-outline {
          background: transparent;
          border: 1.5px solid #d1d5db;
          color: #374151;
        }
        .step-actions .btn-outline:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }
        .step-completed {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9edf4;
          text-align: center;
          font-size: 13px;
        }
        .typewriter-container .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #4f46e5;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.8s step-end infinite;
        }
        .typewriter-container .cursor.hidden {
          opacity: 0;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .ai-annotation {
          background: #f3f0ff;
          border-radius: 8px;
          padding: 10px 14px;
          margin: 6px 0;
          border-left: 4px solid #8b5cf6;
        }
        .teacher-edit {
          background: #fffbeb;
          border-radius: 8px;
          padding: 10px 14px;
          margin: 6px 0;
          border-left: 4px solid #f59e0b;
        }
        .callout {
          border-radius: 8px;
          padding: 10px 14px;
          margin: 6px 0;
        }
      `}</style>
    </div>
  );
};