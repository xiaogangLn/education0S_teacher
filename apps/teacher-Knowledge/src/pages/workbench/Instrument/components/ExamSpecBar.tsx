import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, InputNumber, Modal, Radio, message } from 'antd';

export type ExamTypeDef = {
  subject?: string;
  key: string;
  label: string;
  defaultCount: number;
  sortOrder?: number;
};

export type ExamSpec = {
  level: 'easy' | 'medium' | 'hard';
  counts: Record<string, number>;
  types?: ExamTypeDef[];
};

export const FALLBACK_EXAM_TYPE_CATALOG: ExamTypeDef[] = [
  { subject: '数学', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '数学', key: 'blank', label: '填空题', defaultCount: 6, sortOrder: 2 },
  { subject: '数学', key: 'apply', label: '应用题', defaultCount: 3, sortOrder: 3 },
  { subject: '语文', key: 'choice', label: '选择题', defaultCount: 4, sortOrder: 1 },
  { subject: '语文', key: 'reading', label: '阅读理解', defaultCount: 2, sortOrder: 2 },
  { subject: '语文', key: 'essay', label: '作文', defaultCount: 1, sortOrder: 3 },
  { subject: '英语', key: 'choice', label: '选择题', defaultCount: 10, sortOrder: 1 },
  { subject: '英语', key: 'cloze', label: '完形填空', defaultCount: 1, sortOrder: 2 },
  { subject: '英语', key: 'reading', label: '阅读理解', defaultCount: 2, sortOrder: 3 },
  { subject: '英语', key: 'blank', label: '语法填空', defaultCount: 5, sortOrder: 4 },
  { subject: '物理', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '物理', key: 'blank', label: '填空题', defaultCount: 4, sortOrder: 2 },
  { subject: '物理', key: 'solve', label: '解答题', defaultCount: 3, sortOrder: 3 },
  { subject: '化学', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '化学', key: 'blank', label: '填空题', defaultCount: 4, sortOrder: 2 },
  { subject: '化学', key: 'solve', label: '解答题', defaultCount: 3, sortOrder: 3 },
  { subject: '生物', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '生物', key: 'blank', label: '填空题', defaultCount: 4, sortOrder: 2 },
  { subject: '生物', key: 'solve', label: '解答题', defaultCount: 2, sortOrder: 3 },
  { subject: '历史', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '历史', key: 'reading', label: '材料分析题', defaultCount: 2, sortOrder: 2 },
  { subject: '历史', key: 'solve', label: '问答题', defaultCount: 2, sortOrder: 3 },
  { subject: '政治', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '政治', key: 'reading', label: '材料分析题', defaultCount: 2, sortOrder: 2 },
  { subject: '政治', key: 'solve', label: '问答题', defaultCount: 2, sortOrder: 3 },
  { subject: '地理', key: 'choice', label: '选择题', defaultCount: 8, sortOrder: 1 },
  { subject: '地理', key: 'blank', label: '填空题', defaultCount: 4, sortOrder: 2 },
  { subject: '地理', key: 'solve', label: '综合题', defaultCount: 2, sortOrder: 3 },
];

export const DEFAULT_EXAM_SPEC: ExamSpec = {
  level: 'medium',
  counts: { choice: 8, blank: 6, apply: 3 },
  types: FALLBACK_EXAM_TYPE_CATALOG.filter((item) => item.subject === '数学'),
};

const LEVELS: Array<{ id: ExamSpec['level']; label: string }> = [
  { id: 'easy', label: '较易' },
  { id: 'medium', label: '中等' },
  { id: 'hard', label: '较难' },
];

const SUBJECT_ALIASES: Array<{ match: RegExp; subject: string }> = [
  { match: /数学|Math/i, subject: '数学' },
  { match: /语文|Chinese/i, subject: '语文' },
  { match: /英语|English/i, subject: '英语' },
  { match: /物理|Physics/i, subject: '物理' },
  { match: /化学|Chemistry/i, subject: '化学' },
  { match: /生物|Biology/i, subject: '生物' },
  { match: /历史|History/i, subject: '历史' },
  { match: /政治|思政|道德与法治/i, subject: '政治' },
  { match: /地理|Geography/i, subject: '地理' },
];

export function canonicalExamSubject(subject?: string) {
  const text = String(subject || '').trim();
  if (!text) return '数学';
  const hit = SUBJECT_ALIASES.find((item) => item.match.test(text));
  return hit?.subject || text;
}

export function examTypesForSubject(subject?: string, catalog?: ExamTypeDef[]): ExamTypeDef[] {
  const source = catalog?.length ? catalog : FALLBACK_EXAM_TYPE_CATALOG;
  const text = String(subject || '').trim();
  const exact = source.filter((item) => item.subject === text);
  if (exact.length) return [...exact].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const canonical = canonicalExamSubject(text);
  const byCanonical = source.filter((item) => item.subject === canonical);
  if (byCanonical.length) return [...byCanonical].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const fuzzy = source.filter((item) => text && (text.includes(item.subject || '') || (item.subject || '').includes(text)));
  if (fuzzy.length) return [...fuzzy].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  if (catalog?.length && !catalog.some((item) => item.subject)) {
    return [...catalog].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
  return examTypesForSubject('数学', FALLBACK_EXAM_TYPE_CATALOG);
}

export function defaultExamSpecForSubject(subject?: string, catalog?: ExamTypeDef[]): ExamSpec {
  const types = examTypesForSubject(subject, catalog);
  return {
    level: 'medium',
    counts: Object.fromEntries(types.map((item) => [item.key, item.defaultCount])),
    types,
  };
}

export function specCount(spec: ExamSpec, key: string) {
  return clampCount(spec.counts?.[key] ?? (spec as any)[key] ?? 0);
}

export function normalizeExamSpec(raw?: any, catalog?: ExamTypeDef[]): ExamSpec {
  const types = Array.isArray(raw?.types) && raw.types.length
    ? raw.types.map((item: any) => ({
      subject: item.subject,
      key: String(item.key || '').trim(),
      label: String(item.label || item.key || '').trim(),
      defaultCount: clampCount(item.defaultCount ?? item.default_count ?? 0),
      sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    })).filter((item: ExamTypeDef) => item.key)
    : examTypesForSubject(undefined, catalog);
  const counts: Record<string, number> = {};
  if (raw?.counts && typeof raw.counts === 'object') {
    for (const [key, value] of Object.entries(raw.counts)) {
      counts[key] = clampCount(Number(value));
    }
  }
  const legacyKeys = ['choice', 'blank', 'solve', 'apply', 'reading', 'cloze', 'essay', 'app'];
  for (const key of legacyKeys) {
    const mapped = key === 'app' ? 'apply' : key;
    if (raw?.[key] != null && counts[mapped] == null) {
      counts[mapped] = clampCount(Number(raw[key]));
    }
  }
  if (counts.apply == null && counts.solve != null && types.some((item: ExamTypeDef) => item.key === 'apply')) {
    counts.apply = counts.solve;
  }
  if (!Object.keys(counts).length) {
    for (const item of types) counts[item.key] = item.defaultCount;
  }
  return {
    level: ['easy', 'medium', 'hard'].includes(String(raw?.level)) ? raw.level : 'medium',
    counts,
    types,
  };
}

export function formatExamSpecMarkdown(spec: ExamSpec, subject?: string, catalog?: ExamTypeDef[]) {
  const level = LEVELS.find((item) => item.id === spec.level)?.label || '中等';
  const types = spec.types?.length ? spec.types : examTypesForSubject(subject, catalog);
  const lines = types
    .filter((item) => specCount(spec, item.key) > 0)
    .map((item) => `- **${item.label}**: ${specCount(spec, item.key)} 题`);
  return `## 题型与难度\n\n- **整体难度**: ${level}\n${lines.join('\n') || '- （未选择题型）'}\n\n将按上述题型与题量出学生卷；参考答案在右侧单独卡片。`;
}

export function splitExamMarkdown(markdown: string) {
  const text = String(markdown || '');
  const idx = text.search(/^##\s*参考答案\s*$/m);
  if (idx < 0) {
    return { paper: text.trim(), answers: '' };
  }
  const answers = text
    .slice(idx)
    .replace(/^#{1,3}\s*参考答案\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return {
    paper: text.slice(0, idx).replace(/\s+$/, ''),
    answers,
  };
}

const EXAM_OPTION_LINE_RE = /^[A-D]\s*[.．、]/;
const EXAM_STEM_LINE_RE = /^\d+\s*[.．、)]/;

/** 题号统一成全角「1．」：避免 markdown 把「1. 」解析成有序列表后序号被全局样式隐藏 */
function formatExamStemLine(line: string): string {
  return line.replace(/^(\d+)\s*[.．、)]\s*/, '$1．');
}

/** 把一行里挤在一起的选项拆开："（ ）A. xx B. xx" → 换行分隔（不拆英文单词） */
function splitInlineExamOptions(line: string): string[] {
  return String(line || '')
    .replace(/([^\nA-Za-z])[ \t]*(?=[A-D]\s*[.．、])/g, '$1\n')
    .split('\n')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * 试卷排版：题干与每个选项独立成段。
 * markdown 会把连续非空行合并成一段，导致选择题选项全部挤成一行；
 * 在渲染/导出前把题干、选项规范成独立段落，题干和选项即可明显区分。
 */
export function layoutExamQuestions(text: string): string {
  const source = String(text || '');
  if (!source.trim()) return source;
  const out: string[] = [];
  const blankBefore = () => {
    if (out.length && out[out.length - 1] !== '') out.push('');
  };
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    // 标题/引用/表格/列表等结构行原样保留
    if (/^(#{1,6}\s|>\s|\||[-*+]\s)/.test(line)) {
      blankBefore();
      out.push(rawLine);
      continue;
    }
    if (line) {
      const segments = splitInlineExamOptions(line);
      // 行中任意位置出现选项标记（题干+A、C+D 等）都拆开
      const midLineOption = segments.length > 1 && segments.slice(1).some((part) => EXAM_OPTION_LINE_RE.test(part));
      if (midLineOption) {
        for (const part of segments) {
          blankBefore();
          out.push(formatExamStemLine(part));
        }
        continue;
      }
      if (EXAM_OPTION_LINE_RE.test(line) || EXAM_STEM_LINE_RE.test(line)) {
        // 单独的选项行 / 题干行：独立成段
        blankBefore();
        out.push(formatExamStemLine(line));
        continue;
      }
    }
    out.push(rawLine);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

type MarkdownSection = { level: number; title: string; body: string };

function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = String(markdown || '').split('\n');
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection = { level: 0, title: '', body: '' };
  const push = () => {
    if (current.title || current.body.trim()) {
      sections.push({ ...current, body: current.body.replace(/^\n+/, '') });
    }
  };
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      push();
      current = { level: match[1].length, title: match[2].trim(), body: '' };
    } else {
      current.body += `${current.body ? '\n' : ''}${line}`;
    }
  }
  push();
  return sections;
}

function serializeMarkdownSections(sections: MarkdownSection[]) {
  return sections
    .map((section) => {
      if (!section.title) return section.body.trim();
      return `${'#'.repeat(Math.max(1, section.level))} ${section.title}\n${section.body}`.trim();
    })
    .filter(Boolean)
    .join('\n\n');
}

const EXAM_QUESTION_TITLES = ['选择题', '填空题', '解答题', '应用题', '阅读理解', '完形填空', '完型填空', '作文', '材料分析题', '问答题', '综合题', '语法填空'];

function stripDecor(text: string) {
  return String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')  // 移除 emoji
    .replace(/[📝📊📌📄✨🎨💡✅]/g, '')                            // 移除常见装饰符号
    .replace(/\s+/g, ' ')                                       // 多空格合并
    .trim();
}

/** 对话区只展示本阶段有效输出，不展示空模板壳；完整稿在生成记录预览 */
export function pickExamVisibleMarkdown(
  stepType: string, 
  markdown: string,
) {

  const paper = splitExamMarkdown(markdown).paper;
  if (!paper.trim()) return '';
  const sections = splitMarkdownSections(paper);

  // ──────────────────────────────────────────────
  // 占位符 / 空壳过滤
  // ──────────────────────────────────────────────
  const PLACEHOLDER_RE =
    /（\s*待[^）]*）|（\s*答案在单独卡片[^）]*）|（\s*待精修[^）]*）|（\s*待补充[^）]*）|待填写|待定稿出题|待定稿|待生成|按模板排版/;

  const isPlaceholderBody = (body: string) => {
    const text = String(body || '').replace(/<[^>]+>/g, '').trim();
    if (!text) return true;
    if (PLACEHOLDER_RE.test(text)) return true;
    const stripped = text.replace(PLACEHOLDER_RE, '').replace(/[\s\-—·:：]/g, '');
    return stripped.length === 0;
  };

  const hasBody = (section: { body: string }) =>
    Boolean(String(section.body || '').trim()) && !isPlaceholderBody(section.body);

  // ──────────────────────────────────────────────
  // 模板壳 / 过程段 / 答案段 判定
  // ──────────────────────────────────────────────
  const isTemplateShellTitle = (title: string) => {
    const t = stripDecor(title);
    return /试卷模板|试卷（校本）|系统试卷|试卷基本信息|试卷名称模板|试卷壳|模板$/.test(t);
  };

  const isProcessSectionTitle = (title: string) => {
    const t = stripDecor(title);
    return (
      /^(本阶段结果|基本信息|学科\s*\/\s*班级|选用模板|素材库已选资源|班级画像数字|已确认大纲|本阶段任务|当前已填写的模板全文|待精修正文|课题[（(]教学落点[）)]|提示|系统提交)/.test(t)
      || /素材库已选|班级画像数字|选用模板|本阶段结果|系统提交/.test(t)
    );
  };

  const isAnswerSection = (title: string) =>
    /参考答案|答案与解析|答案/.test(stripDecor(title));

  // ──────────────────────────────────────────────
  // 各阶段白名单
  // 说明：白名单命中才展示；未命中一律丢弃
  // ──────────────────────────────────────────────
  const STAGE_TITLE_WHITELIST: Record<string, RegExp> = {
    init: /^(试卷名称|学科|学段|班级|选用模板|素材库|初始化|考试范围|命题依据|考查重点)/,
    analysis: /^(学情|课标|命题依据|考查重点|教材分析|学生分析)/,
    outline: /^(题型|难度|分值|题量|大纲|结构|时间分配)/,
    content: new RegExp(`^(${EXAM_QUESTION_TITLES.join('|')})`),
    refine: new RegExp(
      `^(${EXAM_QUESTION_TITLES.join('|')}|参考答案|答案与解析|全文|正文|终稿)`,
    ),
    confirm: new RegExp(
      `^(${EXAM_QUESTION_TITLES.join('|')}|参考答案|答案与解析|全文|正文|终稿)`,
    ),
  };

  const whitelist = STAGE_TITLE_WHITELIST[stepType];
  // 未知 stepType：什么都不展示，避免误回退到全部内容
  if (!whitelist) return '';

  const kept = sections.filter((section) => {
    // ✅ level 0：无标题首段。只有 init 阶段才作为正文保留。
    if (section.level === 0) {
      return stepType === 'init' && hasBody(section);
    }

    // ✅ 模板壳标题（# 试卷模板 / # 试卷（校本） / # 系统试卷 等）：一律不展示
    if (isTemplateShellTitle(section.title)) return false;

    // ✅ 过程段（选用模板 / 班级画像数字 / 本阶段结果 等）：一律不展示
    if (isProcessSectionTitle(section.title)) return false;

    // ✅ 空标题不展示
    if (!stripDecor(section.title).trim()) return false;

    // ✅ 空内容 / 占位符不展示
    if (!hasBody(section)) return false;

    // ✅ content 阶段不展示答案区（避免提前泄露答案）
    if (stepType === 'content' && isAnswerSection(section.title)) return false;

    // ✅ level >= 2：只保留白名单命中的 section
    if (section.level >= 2) {
      return whitelist.test(stripDecor(section.title));
    }

    // ✅ level 1：只有 init 阶段允许展示「初始化/基本信息/试卷名称/课题」这类顶层壳；
    // 其余阶段一律不展示任何 level 1 标题。
    if (section.level === 1) {
      if (stepType !== 'init') return false;
      // 再一次防模板壳漏出
      if (isTemplateShellTitle(section.title)) return false;
      return /初始化|基本信息|试卷名称|课题/.test(stripDecor(section.title));
    }

    return false;
  });

  return serializeMarkdownSections(kept);
}

export function examSpecTotal(spec: ExamSpec, subject?: string, catalog?: ExamTypeDef[]) {
  const types = spec.types?.length ? spec.types : examTypesForSubject(subject, catalog);
  return types.reduce((sum, item) => sum + specCount(spec, item.key), 0);
}

function clampCount(value: number) {
  return Math.max(0, Math.min(20, Math.round(Number(value) || 0)));
}

function suggestedCount(key: string, fallback = 6) {
  if (key === 'essay' || key === 'cloze') return 1;
  if (key === 'solve' || key === 'apply' || key === 'reading') return 2;
  return fallback;
}

interface ExamSpecBarProps {
  spec: ExamSpec;
  subject?: string;
  catalog?: ExamTypeDef[];
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (spec: ExamSpec) => void;
}

export const ExamSpecBar: React.FC<ExamSpecBarProps> = ({ spec, subject, catalog, disabled, readOnly, onChange }) => {
  const types = spec.types?.length ? spec.types : examTypesForSubject(subject, catalog);
  const updateCount = (key: string, delta: number) => {
    if (disabled || readOnly) return;
    onChange({
      ...spec,
      counts: { ...spec.counts, [key]: clampCount(specCount(spec, key) + delta) },
      types,
    });
  };

  return (
    <div className="mb-3 rounded-xl border border-indigo-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2">
        <div className="text-sm font-semibold text-gray-800">已确认的题型结构</div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {readOnly ? '学生卷按此结构出题，答案在右侧单独卡片' : '请选择要生成的题型和题量'}
        </div>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500 w-14">难度</span>
        {LEVELS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled || readOnly}
            className={`rounded-full px-3 py-1 text-xs ${
              spec.level === item.id
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-gray-600 border border-indigo-100'
            } disabled:opacity-50`}
            onClick={() => !disabled && !readOnly && onChange({ ...spec, level: item.id, types })}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {types.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-20">{item.label}</span>
            <button
              type="button"
              disabled={disabled || readOnly || specCount(spec, item.key) <= 0}
              className="h-6 w-6 rounded-full border border-indigo-200 text-sm text-indigo-600 disabled:opacity-40"
              onClick={() => updateCount(item.key, -1)}
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-800">{specCount(spec, item.key)}</span>
            <button
              type="button"
              disabled={disabled || readOnly || specCount(spec, item.key) >= 20}
              className="h-6 w-6 rounded-full border border-indigo-200 text-sm text-indigo-600 disabled:opacity-40"
              onClick={() => updateCount(item.key, 1)}
            >
              +
            </button>
            <span className="text-[11px] text-gray-400">题</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ExamSpecModalProps {
  open: boolean;
  spec: ExamSpec;
  subject?: string;
  catalog?: ExamTypeDef[];
  confirmLoading?: boolean;
  onCancel: () => void;
  onOk: (spec: ExamSpec) => void;
}

export const ExamSpecModal: React.FC<ExamSpecModalProps> = ({
  open,
  spec,
  subject,
  catalog,
  confirmLoading,
  onCancel,
  onOk,
}) => {
  const types = useMemo(() => (
    spec.types?.length ? spec.types : examTypesForSubject(subject, catalog)
  ), [spec.types, subject, catalog]);
  const [draft, setDraft] = useState<ExamSpec>(spec);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const nextTypes = spec.types?.length ? spec.types : examTypesForSubject(subject, catalog);
    const next = normalizeExamSpec(spec, nextTypes);
    setDraft({ ...next, types: nextTypes });
    setEnabled(Object.fromEntries(nextTypes.map((item) => [item.key, specCount(next, item.key) > 0])));
  }, [open, spec, subject, catalog]);

  const toggleType = (key: string, checked: boolean) => {
    setEnabled((prev) => ({ ...prev, [key]: checked }));
    if (checked && specCount(draft, key) <= 0) {
      const type = types.find((item) => item.key === key);
      setDraft((prev) => ({
        ...prev,
        counts: { ...prev.counts, [key]: type?.defaultCount || suggestedCount(key) },
        types,
      }));
    }
    if (!checked) {
      setDraft((prev) => ({ ...prev, counts: { ...prev.counts, [key]: 0 }, types }));
    }
  };

  const handleOk = () => {
    const counts = Object.fromEntries(types.map((item) => [
      item.key,
      enabled[item.key] ? clampCount(specCount(draft, item.key) || item.defaultCount || suggestedCount(item.key)) : 0,
    ]));
    const next: ExamSpec = { level: draft.level, counts, types };
    if (examSpecTotal(next, subject, catalog) <= 0) {
      message.warning('请至少勾选一种题型，并填写题量');
      return;
    }
    onOk(next);
  };

  return (
    <Modal
      title="选择题型与题量"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确认并开始出题"
      cancelText="稍后"
      confirmLoading={confirmLoading}
      destroyOnClose
      maskClosable={false}
    >
      <p className="text-sm text-gray-500 mb-4">学情已确认。请选择要生成的题型，并填写每种题型的题量。</p>
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">整体难度</div>
        <Radio.Group
          value={draft.level}
          onChange={(event) => setDraft((prev) => ({ ...prev, level: event.target.value }))}
          optionType="button"
          buttonStyle="solid"
          options={LEVELS.map((item) => ({ label: item.label, value: item.id }))}
        />
      </div>
      <div className="space-y-3">
        {types.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
            <Checkbox
              checked={!!enabled[item.key]}
              onChange={(event) => toggleType(item.key, event.target.checked)}
            >
              {item.label}
            </Checkbox>
            <div className="flex items-center gap-2">
              <InputNumber
                min={1}
                max={20}
                disabled={!enabled[item.key]}
                value={enabled[item.key] ? specCount(draft, item.key) : 0}
                onChange={(value) => setDraft((prev) => ({
                  ...prev,
                  counts: { ...prev.counts, [item.key]: clampCount(Number(value || 0)) },
                  types,
                }))}
              />
              <span className="text-xs text-gray-400">题</span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
