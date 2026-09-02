// components/PredictionStepItem.tsx - 使用 light 主题
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { type PredictionStep, STEP_TYPE_CONFIG } from '../types';

interface PredictionStepItemProps {
  step: PredictionStep;
}

export const PredictionStepItem: React.FC<PredictionStepItemProps> = ({ step }) => {
  const config = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.info;

  return (
    <div
      className={`rounded-xl border-l-4 p-4 transition-all ${config.color}`}
      style={{ animation: 'fadeIn 0.4s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800">{step.title}</span>
            <span className="text-xs text-gray-400">{step.timestamp}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              ✓ 完成
            </span>
          </div>
          <div className="mt-2 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = node?.type === 'text' && !children?.includes('\n');
                  
                  if (!isInline && match) {
                    return (
                      <SyntaxHighlighter
                        style={prism}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }: any) {
                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }: any) {
                  return (
                    <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  );
                },
                td({ children }: any) {
                  return (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {children}
                    </td>
                  );
                },
                blockquote({ children }: any) {
                  return (
                    <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-2 text-gray-600 bg-blue-50/50 rounded-r">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {step.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};