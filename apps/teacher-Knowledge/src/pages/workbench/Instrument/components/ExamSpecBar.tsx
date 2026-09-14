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
  if (counts.apply == null && counts.solve != null && types.some((item) => item.key === 'apply')) {
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

export function pickExamVisibleMarkdown(stepType: string, markdown: string) {
  const paper = splitExamMarkdown(markdown).paper;
  if (!paper.trim()) return '';
  const sections = splitMarkdownSections(paper);
  const matchTitles = (titles: string[]) => sections.filter((section) => (
    titles.some((title) => section.title.includes(title))
  ));
  if (stepType === 'init') {
    return serializeMarkdownSections(sections.filter((section) => {
      if (section.level === 1 && /试卷模板|试卷（校本）/.test(section.title)) return false;
      if (section.level >= 2 && /学情|题型与难度|选择|填空|解答|应用|阅读|完形|完型|作文|材料|问答|综合|参考答案/.test(section.title)) return false;
      return Boolean(section.body.replace(/（待填写）/g, '').trim() || (section.level === 0 && section.body.trim()));
    }));
  }
  if (stepType === 'analysis') {
    return serializeMarkdownSections(matchTitles(['学情与课标', '学情']));
  }
  if (stepType === 'outline') {
    return serializeMarkdownSections(matchTitles(['题型与难度']));
  }
  return serializeMarkdownSections(
    matchTitles(EXAM_QUESTION_TITLES).filter((section) => !/待填写|待定稿出题/.test(section.body)),
  );
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
