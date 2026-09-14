// packages/ui/src/components/MarkdownRenderer/CustomComponents.tsx
import React from 'react';
import { Tag, Alert } from 'antd';
import { CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, FileOutlined, LinkOutlined } from '@ant-design/icons';
import { parseVisualSpec, renderCoursewareSvg, type VisualSpec } from '../../lib/coursewareVisuals';

export function CoursewareVisual({ spec, compact = false }: { spec: VisualSpec; compact?: boolean }) {
  if (spec.kind === 'image' && spec.src) {
    return (
      <figure className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${compact ? 'my-1' : 'my-2'}`}>
        <img src={spec.src} alt={spec.caption || '课件插图'} className="max-h-56 w-full object-contain bg-slate-50" />
        {spec.caption ? (
          <figcaption className="px-3 py-2 text-xs text-slate-500 border-t">
            {/\.gif(\?|$)/i.test(spec.src) ? '动态演示 · ' : '插图 · '}{spec.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  const svg = renderCoursewareSvg(spec, { animated: spec.motion || spec.kind === 'motion' || spec.kind === 'tangent' });
  if (!svg) return null;
  return (
    <figure className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${compact ? 'my-1' : 'my-2'}`}>
      <div className="bg-[#F8FAFC]" dangerouslySetInnerHTML={{ __html: svg }} />
      {spec.caption ? (
        <figcaption className="px-3 py-2 text-xs text-slate-500 border-t">
          {spec.motion || spec.kind === 'motion' ? '动态演示 · ' : '数形结合 · '}{spec.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function guessFileKind(href: string, text?: string) {
  const source = `${href} ${text || ''}`.toLowerCase();
  if (/\.(pdf)(\?|$)/.test(source) || source.includes('pdf')) return { label: 'PDF', color: '#dc2626' };
  if (/\.(docx?|wps)(\?|$)/.test(source)) return { label: 'Word', color: '#2563eb' };
  if (/\.(xlsx?|csv)(\?|$)/.test(source)) return { label: '表格', color: '#059669' };
  if (/\.(pptx?)(\?|$)/.test(source)) return { label: 'PPT', color: '#ea580c' };
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(source)) return { label: '图片', color: '#7c3aed' };
  if (/\.(mp3|wav|m4a)(\?|$)/.test(source)) return { label: '音频', color: '#0891b2' };
  if (/\.(mp4|mov|webm)(\?|$)/.test(source)) return { label: '视频', color: '#db2777' };
  if (/\.(json|ya?ml|xml|html?)(\?|$)/.test(source)) return { label: '数据', color: '#4f46e5' };
  if (/^https?:\/\//.test(href)) return { label: '链接', color: '#64748b' };
  return null;
}

function formatCodeText(language: string | undefined, text: string) {
  if (!language) return text;
  const lang = language.toLowerCase();
  if (lang === 'json') {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }
  return text;
}

function tryParseCsv(text: string): string[][] | null {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;
  const rows = lines.map((line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => cell.replace(/^"|"$/g, '').trim()));
  if (rows.some((row) => row.length < 2)) return null;
  const width = rows[0].length;
  if (!rows.every((row) => row.length === width)) return null;
  return rows;
}

function DataTableFromRows({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <div className="md-table-wrap md-data-table">
      <table>
        <thead>
          <tr>{header.map((cell, i) => <th key={i}>{cell}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 自定义代码块组件
export const CodeBlock: React.FC<{ language?: string; children: string }> = ({ language, children }) => {
  const lang = (language || '').toLowerCase();
  const text = formatCodeText(language, children);

  if (lang === 'csv') {
    const rows = tryParseCsv(text);
    if (rows) {
      return (
        <div className="md-code-block md-code-as-data">
          <div className="md-code-header">
            <span className="md-code-lang">CSV 表格</span>
          </div>
          <DataTableFromRows rows={rows} />
        </div>
      );
    }
  }

  if (lang === 'tsv') {
    const rows = text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split('\t'));
    if (rows.length >= 2 && rows[0].length >= 2) {
      return (
        <div className="md-code-block md-code-as-data">
          <div className="md-code-header">
            <span className="md-code-lang">TSV 表格</span>
          </div>
          <DataTableFromRows rows={rows} />
        </div>
      );
    }
  }

  return (
    <div className="md-code-block">
      <div className="md-code-header">
        <span className="md-code-lang">{language || 'code'}</span>
      </div>
      <pre className="md-code-body">
        <code>{text}</code>
      </pre>
    </div>
  );
};

// AI 生成标注组件
export const AIAnnotation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="ai-annotation">
      <Tag color="purple" icon={<InfoCircleOutlined />}>
        🤖 AI 生成
      </Tag>
      <div className="ai-annotation-content">{children}</div>
    </div>
  );
};

// 教师修改标注组件
export const TeacherEdit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="teacher-edit">
      <Tag color="orange" icon={<InfoCircleOutlined />}>
        ✏️ 教师修改
      </Tag>
      <div className="teacher-edit-content">{children}</div>
    </div>
  );
};

// 确认标注组件
export const ConfirmTag: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Tag color="success" icon={<CheckCircleOutlined />}>
      {children || '✅ 已确认'}
    </Tag>
  );
};

// 提示框组件
export const Callout: React.FC<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}> = ({ type = 'info', title, children }) => {
  const typeMap = {
    info: { color: 'blue', icon: <InfoCircleOutlined /> },
    success: { color: 'green', icon: <CheckCircleOutlined /> },
    warning: { color: 'gold', icon: <WarningOutlined /> },
    error: { color: 'red', icon: <WarningOutlined /> },
  };
  const config = typeMap[type];
  
  return (
    <Alert
      message={title}
      description={children}
      type={type}
      icon={config.icon}
      showIcon
      className="my-2"
    />
  );
};

// 步骤确认组件
export const StepConfirm: React.FC<{
  onConfirm: () => void;
  onModify?: () => void;
  onRegenerate?: () => void;
  confirmText?: string;
  disabled?: boolean;
}> = ({ onConfirm, onRegenerate, confirmText = '进入下一步', disabled = false }) => {
  return (
    <div className="step-actions">
      <button
        type="button"
        className="btn btn-primary"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) onConfirm();
        }}
      >
        ✅ {confirmText}
      </button>
      <button
        type="button"
        className="btn btn-outline"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) onRegenerate?.();
        }}
      >
        🔄 重新生成
      </button>
      <p className="desc">不满意可以继续对话调整</p>
    </div>
  );
};

function MarkdownLink({ href, children, ...props }: any) {
  const text = String(React.Children.toArray(children).join('') || '');
  const kind = href ? guessFileKind(String(href), text) : null;
  if (kind) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="md-file-chip"
        style={{ borderColor: `${kind.color}33`, color: kind.color }}
        {...props}
      >
        {kind.label === '链接' ? <LinkOutlined /> : <FileOutlined />}
        <span className="md-file-kind">{kind.label}</span>
        <span className="md-file-name">{text || href}</span>
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="md-link" {...props}>
      {children}
    </a>
  );
}

function MarkdownImage({ src, alt }: any) {
  if (!src) return null;
  return (
    <figure className="md-image">
      <img src={src} alt={alt || '图片'} />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

// 自定义组件映射
export const defaultCustomComponents = {
  code: ({ className, children, ...props }: any) => {
    const text = String(children ?? '').replace(/\n$/, '');
    const inline = !className && !text.includes('\n');
    if (inline) {
      return <code className="md-inline-code" {...props}>{children}</code>;
    }
    const language = /language-([\w+-]+)/.exec(String(className || ''))?.[1];
    if (language && /^(visual|figure|gif|graph)$/i.test(language)) {
      return <CoursewareVisual spec={parseVisualSpec(text)} />;
    }
    return <CodeBlock language={language}>{text}</CodeBlock>;
  },
  pre: ({ children }: any) => <>{children}</>,
  a: MarkdownLink,
  img: MarkdownImage,
  table: ({ children }: any) => (
    <div className="md-table-wrap">
      <table>{children}</table>
    </div>
  ),
  ai: AIAnnotation,
  teacher: TeacherEdit,
  confirm: ConfirmTag,
  callout: Callout,
  stepConfirm: StepConfirm,
};
