import { parseVisualQuery, parseVisualSpec, type VisualSpec } from '@ui/lib/coursewareVisuals';

export type CoursewareBlock =
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'visual'; spec: VisualSpec };

export type CoursewareSlide = {
  kind: 'cover' | 'content' | 'summary' | 'goals';
  title: string;
  subtitle?: string;
  blocks: CoursewareBlock[];
};

export function cleanSlideText(text: string) {
  return String(text || '')
    .replace(/\$\$([\s\S]+?)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line: string) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cleanSlideText(cell));
}

function parseBlocks(body: string): CoursewareBlock[] {
  const lines = String(body || '').split('\n');
  const blocks: CoursewareBlock[] = [];
  let i = 0;
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (list?.items.length) blocks.push(list);
    list = null;
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      flushList();
      i += 1;
      continue;
    }
    if (trimmed.startsWith('```')) {
      flushList();
      const lang = trimmed.replace(/^```+/, '').trim().toLowerCase();
      const bodyLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        bodyLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      if (/^(visual|figure|gif|graph)?$/.test(lang) || /visual|figure|gif|graph/.test(lang)) {
        blocks.push({ type: 'visual', spec: parseVisualSpec(bodyLines.join('\n')) });
      }
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)/.exec(trimmed);
    if (image) {
      flushList();
      const caption = image[1].trim();
      const src = image[2].trim();
      if (/^visual:/i.test(src)) {
        blocks.push({ type: 'visual', spec: parseVisualQuery(src, caption) });
      } else {
        blocks.push({
          type: 'visual',
          spec: { kind: 'image', src, caption, motion: /\.gif(\?|$)/i.test(src) },
        });
      }
      i += 1;
      continue;
    }
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1].trim())) {
      flushList();
      const rows = [splitTableRow(trimmed)];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|') && !isTableDivider(lines[i].trim())) {
        rows.push(splitTableRow(lines[i].trim()));
        i += 1;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      if (list?.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(cleanSlideText(trimmed.replace(/^[-*]\s+/, '')));
      i += 1;
      continue;
    }
    if (/^\d+[\.、．]\s+/.test(trimmed)) {
      if (list?.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(cleanSlideText(trimmed.replace(/^\d+[\.、．]\s+/, '')));
      i += 1;
      continue;
    }
    flushList();
    if (trimmed.startsWith('### ')) blocks.push({ type: 'h3', text: cleanSlideText(trimmed.slice(4)) });
    else if (!/^#{1,2}\s+/.test(trimmed)) blocks.push({ type: 'p', text: cleanSlideText(trimmed) });
    i += 1;
  }
  flushList();
  return blocks.filter((block) => {
    if (block.type === 'visual') return Boolean(block.spec);
    if (block.type === 'table') return block.rows.length > 0;
    if (block.type === 'ul' || block.type === 'ol') return block.items.length > 0;
    return Boolean(block.text);
  });
}

function parseH2Sections(markdown: string) {
  const lines = String(markdown || '').split('\n');
  const sections: { level: number; title: string; body: string }[] = [];
  let current: { level: number; title: string; body: string } | null = null;
  const preamble: string[] = [];
  for (const line of lines) {
    const matched = /^(#{1,2})\s+(.+)\s*$/.exec(line);
    if (matched) {
      if (current) sections.push(current);
      current = { level: matched[1].length, title: cleanSlideText(matched[2]), body: '' };
    } else if (current) {
      current.body += `${current.body ? '\n' : ''}${line}`;
    } else if (line.trim()) {
      preamble.push(line);
    }
  }
  if (current) sections.push(current);
  return { sections, preamble: preamble.join('\n') };
}

function kindOf(title: string): CoursewareSlide['kind'] {
  if (/封面/.test(title)) return 'cover';
  if (/学习目标|教学目标/.test(title)) return 'goals';
  if (/小结|总结|回顾/.test(title)) return 'summary';
  return 'content';
}

function splitByH3(title: string, blocks: CoursewareBlock[], kind: CoursewareSlide['kind']): CoursewareSlide[] {
  const groups: { subtitle?: string; blocks: CoursewareBlock[] }[] = [{ blocks: [] }];
  for (const block of blocks) {
    if (block.type === 'h3') {
      if (groups[groups.length - 1].blocks.length) groups.push({ subtitle: block.text, blocks: [] });
      else groups[groups.length - 1].subtitle = block.text;
      continue;
    }
    groups[groups.length - 1].blocks.push(block);
  }
  const filled = groups.filter((group) => group.blocks.length || group.subtitle);
  if (!filled.length) return [{ kind, title, blocks: [] }];
  return filled.map((group) => ({
    kind,
    title,
    subtitle: group.subtitle,
    blocks: group.blocks,
  }));
}

function chunkDraft(draft: CoursewareSlide): CoursewareSlide[] {
  const unitCount = (blocks: CoursewareBlock[]) =>
    blocks.reduce((sum, block) => {
      if (block.type === 'ul' || block.type === 'ol') return sum + block.items.length;
      if (block.type === 'table' || block.type === 'visual') return sum + 4;
      return sum + 1;
    }, 0);

  if (unitCount(draft.blocks) <= 7) return [draft];
  const chunks: CoursewareSlide[] = [];
  let current: CoursewareBlock[] = [];
  const push = () => {
    if (!current.length) return;
    chunks.push({
      ...draft,
      title: chunks.length ? `${draft.title}（续）` : draft.title,
      blocks: current,
    });
    current = [];
  };
  for (const block of draft.blocks) {
    if (block.type === 'ul' || block.type === 'ol') {
      let items = block.items;
      while (items.length) {
        const room = Math.max(1, 7 - unitCount(current));
        current.push({ ...block, items: items.slice(0, room) });
        items = items.slice(room);
        if (unitCount(current) >= 7) push();
      }
      continue;
    }
    if (unitCount(current) >= 6) push();
    current.push(block);
  }
  push();
  return chunks.length ? chunks : [draft];
}

export function buildCoursewareSlides(title: string, markdown: string): CoursewareSlide[] {
  const { sections, preamble } = parseH2Sections(markdown);
  const h1 = sections.find((item) => item.level === 1);
  const coverSection = sections.find((item) => item.level === 2 && kindOf(item.title) === 'cover');
  const coverTitle = coverSection?.title && coverSection.title !== '封面'
    ? coverSection.title
    : cleanSlideText(h1?.title || title).replace(/（校本）$/, '');
  const cover: CoursewareSlide = {
    kind: 'cover',
    title: coverTitle || title,
    blocks: parseBlocks(coverSection?.body || h1?.body || preamble),
  };
  const rest = sections.filter((item) => item.level === 2 && kindOf(item.title) !== 'cover');
  const content = rest.flatMap((item) => {
    const kind = kindOf(item.title);
    return splitByH3(item.title, parseBlocks(item.body), kind).flatMap(chunkDraft);
  });
  return [cover, ...content];
}
