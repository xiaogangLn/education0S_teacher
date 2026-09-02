// packages/ui/src/components/MarkdownRenderer/StepRenderer.tsx
import React, { useState, useEffect } from 'react';
import { Steps, Progress, StepsProps } from 'antd';
import { TypewriterEffect } from './TypewriterEffect';
import { StepConfirm } from './CustomComponents';
import { StepData } from './types';
import { useStepRenderer } from './hooks/useStepRenderer';
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
}

// 定义步骤状态类型
type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export const StepRenderer: React.FC<StepRendererProps> = ({
  steps: initialSteps,
  typewriter = true,
  typingSpeed = 30,
  customComponents = {},
  onStepComplete,
  onAllComplete,
}) => {
  const {
    steps,
    currentStep,
    currentStepIndex,
    isComplete,
    completeCurrentStep,
    getStats,
  } = useStepRenderer(initialSteps);

  const { progress } = getStats();

  // 当步骤完成时触发回调
  useEffect(() => {
    if (currentStep?.status === 'completed') {
      onStepComplete?.(currentStepIndex);
    }
  }, [currentStep, currentStepIndex, onStepComplete]);

  // 所有步骤完成时触发回调
  useEffect(() => {
    if (isComplete) {
      onAllComplete?.();
    }
  }, [isComplete, onAllComplete]);

  // 步骤状态图标
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
    disabled: index > currentStepIndex,
  }));

  return (
    <div className="step-renderer">
      {/* 进度条 */}
      <div className="step-progress">
        <Progress
          percent={progress}
          status={isComplete ? 'success' : 'active'}
          showInfo
          strokeColor={{
            from: '#4f46e5',
            to: '#10b981',
          }}
        />
        <div className="step-counter">
          步骤 {currentStepIndex + 1} / {steps.length}
        </div>
      </div>

      {/* 步骤指示器 */}
      <Steps
        current={currentStepIndex}
        status={getStepStatus(currentStep.status)}
        items={stepItems}
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
                // 打字完成后自动标记为 processing 或 completed
                if (currentStep.status !== 'completed') {
                  // 这里可以触发确认按钮显示
                }
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

        {/* 操作按钮 */}
        {currentStep.confirmable !== false && currentStep.status !== 'completed' && (
          <div className="step-actions">
            <StepConfirm
              onConfirm={() => {
                // 这里可以添加确认逻辑
                completeCurrentStep();
              }}
              onModify={() => {
                // 修改逻辑
                console.log('修改步骤:', currentStepIndex);
              }}
              onRegenerate={() => {
                // 重新生成逻辑
                console.log('重新生成步骤:', currentStepIndex);
              }}
              confirmText={currentStep.confirmText || '确认'}
            />
          </div>
        )}

        {currentStep.status === 'completed' && (
          <div className="step-completed">
            <span className="text-green-500">✅ 此步骤已完成</span>
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .step-renderer {
          padding: 16px;
          background: #fff;
          border-radius: 12px;
        }
        .step-progress {
          margin-bottom: 16px;
        }
        .step-counter {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
        .step-indicator {
          margin-bottom: 24px;
        }
        .step-content {
          background: #fafcff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9edf4;
        }
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .step-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #0b1a33;
        }
        .step-status-badge .badge-pending {
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 12px;
        }
        .step-status-badge .badge-processing {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 12px;
        }
        .step-status-badge .badge-completed {
          background: #d1fae5;
          color: #065f46;
          padding: 2px 12px;
          border-radius: 30px;
          font-size: 12px;
        }
        .step-body {
          min-height: 60px;
        }
        .step-actions {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9edf4;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .step-actions .btn {
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 13px;
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
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9edf4;
          text-align: center;
          font-size: 14px;
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
        /* AI 标注样式 */
        .ai-annotation {
          background: #f3f0ff;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 8px 0;
          border-left: 4px solid #8b5cf6;
        }
        .ai-annotation-content {
          margin-top: 4px;
        }
        .teacher-edit {
          background: #fffbeb;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 8px 0;
          border-left: 4px solid #f59e0b;
        }
        .teacher-edit-content {
          margin-top: 4px;
        }
        .code-block {
          background: #1a1a2e;
          border-radius: 8px;
          margin: 8px 0;
          overflow: hidden;
        }
        .code-block-header {
          padding: 8px 16px;
          background: #2d2d44;
          border-bottom: 1px solid #3d3d5c;
        }
        .code-block-language {
          color: #a5b4fc;
          font-size: 12px;
          font-weight: 500;
        }
        .code-block-content {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          color: #e5e7eb;
          font-family: 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.7;
          background: transparent;
        }
        .code-block-content code {
          background: transparent;
          color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};