// packages/ui/src/components/MarkdownRenderer/StepRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { Steps, type StepsProps } from 'antd';
import { defaultCustomComponents, StepConfirm } from './CustomComponents';
import type { StepData } from './types';
import { CheckCircleOutlined } from '@ant-design/icons';
import { StreamingMarkdown } from './StreamingMarkdown';

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
  reasoning?: string;
  expandReasoning?: boolean;
  resultLabel?: string;
  /** 过滤掉模板壳后若无可见正文时的提示 */
  emptyResultHint?: string;
}

type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export const StepRenderer: React.FC<StepRendererProps> = ({
  steps: initialSteps,
  customComponents = {},
  onStepComplete,
  onAllComplete,
  externalStepIndex = 0,
  showConfirm = true,
  confirmText = '进入下一步',
  onConfirm,
  onRegenerate,
  isStreaming = false,
  reasoning,
  expandReasoning = false,
  resultLabel,
  emptyResultHint,
}) => {
  const steps = initialSteps;
  const stepIndex = Math.min(externalStepIndex, steps.length - 1);
  const currentStep = steps[stepIndex] || null;
  const reasoningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep?.status === 'completed') {
      onStepComplete?.(stepIndex);
    }
  }, [currentStep, stepIndex, onStepComplete]);

  const allCompleted = steps.every((step) => step.status === 'completed');
  useEffect(() => {
    if (allCompleted && steps.length > 0) {
      onAllComplete?.();
    }
  }, [allCompleted, steps.length, onAllComplete]);

  useEffect(() => {
    if (!isStreaming || !reasoning) return;
    const el = reasoningRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [reasoning, isStreaming]);

  const markdownComponents = { ...defaultCustomComponents, ...customComponents };

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

  const hasReasoning = Boolean(String(reasoning || '').trim());
  const reasoningOpen = isStreaming || expandReasoning || hasReasoning;

  return (
    <div className="step-renderer">
      <Steps
        current={stepIndex}
        status={getStepStatus(currentStep.status)}
        items={stepItems}
        size="small"
        className="step-indicator"
      />

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
          <div className="step-header-actions">
            <div className="step-status-badge">
              {currentStep.status === 'pending' && <span className="badge-pending">⏳ 待开始</span>}
              {currentStep.status === 'processing' && <span className="badge-processing">🔄 进行中</span>}
              {currentStep.status === 'completed' && <span className="badge-completed">✅ 已完成</span>}
            </div>
          </div>
        </div>

        <details className={`reasoning-panel${isStreaming ? ' is-live' : ''}`} open={reasoningOpen}>
          <summary className="reasoning-summary">
            {isStreaming ? (
              <span className="reasoning-live">
                <span className="reasoning-dot" />
                思考中
              </span>
            ) : (
              '思考过程'
            )}
          </summary>
          <div ref={reasoningRef} className="reasoning-body">
            {hasReasoning
              ? reasoning
              : (isStreaming ? '正在组织本阶段思路…' : '本阶段暂无单独思考过程（结果见下方）')}
            {isStreaming ? <span className="stream-caret" aria-hidden /> : null}
          </div>
        </details>

        <div className="step-result">
          <div className="step-result-label">{resultLabel || '本阶段结果'}</div>
          <div className={`step-body${isStreaming ? ' is-streaming' : ''}`}>
            {!currentStep.content && isStreaming ? (
              <div className="step-result-placeholder">
                等待本阶段思考完成后写入结果
                <span className="stream-caret" aria-hidden />
              </div>
            ) : !currentStep.content ? (
              <div className="step-result-placeholder">
                {emptyResultHint || '暂无本阶段结果'}
              </div>
            ) : (
              <StreamingMarkdown
                content={String(currentStep.content || '')}
                isStreaming={isStreaming}
                customComponents={markdownComponents}
              />
            )}
          </div>
        </div>

        {showConfirm && currentStep.status !== 'completed' && (
          <div className="step-actions">
            <StepConfirm
              onConfirm={onConfirm || (() => {})}
              onRegenerate={onRegenerate}
              confirmText={currentStep.confirmText || confirmText}
              disabled={isStreaming}
            />
          </div>
        )}

        {currentStep.status === 'completed' && (
          <div className="step-completed">
            <span className="text-green-500">✅ 此步骤已完成</span>
          </div>
        )}
      </div>

      <style>{`
        .step-renderer {
          padding: 4px 0 12px;
          background: transparent;
        }
        .step-indicator {
          margin-bottom: 14px;
        }
        .step-content {
          background: #fff;
          border-radius: 14px;
          padding: 18px 20px 16px;
          border: 1px solid #e8edf5;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .step-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .step-title {
          font-size: 17px;
          font-weight: 650;
          margin: 0;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .step-status-badge .badge-pending {
          background: #f1f5f9; color: #64748b;
          padding: 2px 10px; border-radius: 999px; font-size: 11px;
        }
        .step-status-badge .badge-processing {
          background: #e0e7ff; color: #4338ca;
          padding: 2px 10px; border-radius: 999px; font-size: 11px;
        }
        .step-status-badge .badge-completed {
          background: #d1fae5; color: #065f46;
          padding: 2px 10px; border-radius: 999px; font-size: 11px;
        }

        .reasoning-panel {
          margin: 0 0 14px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .reasoning-panel.is-live {
          background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
          border-color: #c7d2fe;
        }
        .reasoning-summary {
          list-style: none;
          cursor: pointer;
          user-select: none;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .reasoning-summary::-webkit-details-marker { display: none; }
        .reasoning-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4f46e5;
        }
        .reasoning-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4f46e5;
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.45);
          animation: reasoning-pulse 1.4s ease-out infinite;
        }
        .reasoning-body {
          max-height: 180px;
          overflow: auto;
          padding: 0 14px 12px;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 13px;
          line-height: 1.7;
          color: #64748b;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        .step-result-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }
        .step-result-placeholder {
          font-size: 14px;
          color: #94a3b8;
          padding: 12px 0 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .step-body,
        .streaming-markdown {
          font-size: 16px;
          line-height: 1.75;
          color: #1e293b;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        }
        .streaming-markdown > *:first-child { margin-top: 0; }
        .streaming-markdown > *:last-child { margin-bottom: 0; }
        .step-body h1, .streaming-markdown h1 {
          font-size: 1.45em; font-weight: 700; margin: 1.1em 0 0.45em; color: #0f172a; line-height: 1.3;
        }
        .step-body h2, .streaming-markdown h2 {
          font-size: 1.25em; font-weight: 650; margin: 1em 0 0.4em; color: #0f172a; line-height: 1.35;
        }
        .step-body h3, .streaming-markdown h3 {
          font-size: 1.1em; font-weight: 600; margin: 0.9em 0 0.35em; color: #1e293b;
        }
        .step-body h4, .streaming-markdown h4 {
          font-size: 1em; font-weight: 600; margin: 0.8em 0 0.3em;
        }
        .step-body p, .streaming-markdown p {
          margin: 0.55em 0;
          white-space: normal;
        }
        .step-body p:empty, .streaming-markdown p:empty { display: none; }
        .step-body ul, .step-body ol,
        .streaming-markdown ul, .streaming-markdown ol {
          padding-left: 1.4em;
          margin: 0.55em 0 0.85em;
        }
        /* Tailwind preflight 会全局隐藏列表序号/圆点，内容区必须恢复，否则题干「1.」不可见 */
        .step-body ul, .streaming-markdown ul { list-style: disc outside; }
        .step-body ol, .streaming-markdown ol { list-style: decimal outside; }
        .step-body li, .streaming-markdown li {
          margin: 0.28em 0;
          line-height: 1.75;
        }
        .step-body li > p, .streaming-markdown li > p {
          margin: 0.2em 0;
        }
        .step-body .katex, .streaming-markdown .katex { font-size: 1.08em; }
        .step-body .katex-display, .streaming-markdown .katex-display {
          margin: 0.85em 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .step-body .md-inline-code, .streaming-markdown .md-inline-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.88em;
          padding: 0.12em 0.38em;
          border-radius: 6px;
          background: #f1f5f9;
          color: #be185d;
        }
        .step-body .md-code-block, .streaming-markdown .md-code-block {
          margin: 0.85em 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: #0f172a;
        }
        .step-body .md-code-as-data, .streaming-markdown .md-code-as-data { background: #fff; }
        .step-body .md-code-as-data .md-table-wrap {
          margin: 0; border: 0; border-radius: 0; background: #fff;
        }
        .step-body .md-code-as-data .md-code-header {
          background: #f8fafc; border-bottom: 1px solid #e2e8f0;
        }
        .step-body .md-code-as-data .md-code-lang { color: #64748b; }
        .step-body .md-code-header, .streaming-markdown .md-code-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 12px; background: #1e293b; border-bottom: 1px solid #334155;
        }
        .step-body .md-code-lang, .streaming-markdown .md-code-lang {
          font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .step-body .md-code-body, .streaming-markdown .md-code-body {
          margin: 0; padding: 12px 14px; overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 13px; line-height: 1.65; color: #e2e8f0; white-space: pre;
        }
        .step-body .md-table-wrap, .streaming-markdown .md-table-wrap {
          overflow-x: auto; margin: 0.85em 0 1em;
          border: 1px solid #e2e8f0; border-radius: 10px;
        }
        .step-body table, .streaming-markdown table {
          width: 100%; border-collapse: collapse; font-size: 14.5px; background: #fff;
        }
        .step-body th, .step-body td, .streaming-markdown th, .streaming-markdown td {
          border-bottom: 1px solid #eef2f7; padding: 9px 12px; text-align: left; vertical-align: top;
        }
        .step-body th, .streaming-markdown th {
          background: #f8fafc; font-weight: 600; color: #334155;
        }
        .step-body tr:last-child td, .streaming-markdown tr:last-child td { border-bottom: none; }
        .step-body .md-link, .streaming-markdown .md-link {
          color: #4f46e5; text-decoration: underline; text-underline-offset: 2px;
        }
        .step-body .md-file-chip, .streaming-markdown .md-file-chip {
          display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
          margin: 4px 2px; padding: 6px 10px; border-radius: 999px;
          border: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px;
          text-decoration: none; vertical-align: middle;
        }
        .step-body .md-file-kind { font-size: 11px; font-weight: 700; }
        .step-body .md-file-name {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #334155; max-width: 280px;
        }
        .step-body .md-image, .streaming-markdown .md-image {
          margin: 0.85em 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;
        }
        .step-body .md-image img, .streaming-markdown .md-image img {
          display: block; max-width: 100%; max-height: 360px; margin: 0 auto; object-fit: contain; background: #f8fafc;
        }
        .step-body .md-image figcaption, .streaming-markdown .md-image figcaption {
          padding: 8px 12px; font-size: 12px; color: #64748b; border-top: 1px solid #eef2f7;
        }
        .step-body blockquote, .streaming-markdown blockquote {
          margin: 0.75em 0; padding: 0.35em 0 0.35em 0.9em;
          border-left: 3px solid #c7d2fe; color: #475569;
        }
        .step-body hr, .streaming-markdown hr {
          border: 0; border-top: 1px solid #e2e8f0; margin: 1.1em 0;
        }
        .step-body strong, .streaming-markdown strong { font-weight: 650; color: #0f172a; }

        .stream-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 2px;
          background: #4f46e5;
          vertical-align: -0.15em;
          border-radius: 1px;
          animation: blink 0.9s step-end infinite;
        }

        .step-actions {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .step-actions .desc { font-size: 13px; color: #94a3b8; margin: 0; }
        .step-actions .btn {
          padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 500;
          border: none; cursor: pointer; transition: 0.15s;
        }
        .step-actions .btn-primary { background: #4f46e5; color: #fff; }
        .step-actions .btn-primary:hover { background: #4338ca; }
        .step-actions .btn-outline {
          background: transparent; border: 1.5px solid #d1d5db; color: #374151;
        }
        .step-actions .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .step-completed {
          margin-top: 12px; padding-top: 12px; border-top: 1px solid #e9edf4;
          text-align: center; font-size: 13px;
        }
        .ai-annotation {
          background: #f3f0ff; border-radius: 8px; padding: 10px 14px; margin: 6px 0;
          border-left: 4px solid #8b5cf6;
        }
        .teacher-edit {
          background: #fffbeb; border-radius: 8px; padding: 10px 14px; margin: 6px 0;
          border-left: 4px solid #f59e0b;
        }
        .callout { border-radius: 8px; padding: 10px 14px; margin: 6px 0; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes reasoning-pulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.45); }
          70% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}</style>
    </div>
  );
};
