export type ExportFormat = 'doc' | 'ppt' | 'pdf' | 'xls' | 'txt';

export interface ExportSpec {
  format: ExportFormat;
  ext: string;
  mime: string;
  label: string;
}

type MarkdownSection = { level: number; title: string; body: string };

export function resolveExportSpec(kind?: string, builtinType?: string): ExportSpec {
  const token = `${kind || ''} ${builtinType || ''}`.toLowerCase();
  if (token.includes('pdf')) {
    return { format: 'pdf', ext: 'pdf', mime: 'application/pdf', label: 'PDF' };
  }
  if (token.includes('excel') || token.includes('xls')) {
    return { format: 'xls', ext: 'xls', mime: 'application/vnd.ms-excel', label: 'Excel' };
  }
  if (token.includes('courseware') || token.includes('课件') || token.includes('ppt')) {
    return {
      format: 'ppt',
      ext: 'pptx',
      mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      label: 'PPT',
    };
  }
  if (token.includes('audio') || token.includes('mp3') || token.includes('mp4') || token.includes('video')) {
    return { format: 'txt', ext: 'txt', mime: 'text/plain;charset=utf-8', label: '文本' };
  }
  return { format: 'doc', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word' };
}

function safeName(title: string) {
  return (title || '生成记录').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
}

function escapeHtml(text: string) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripDecor(text: string) {
  return String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[📝📊📌📄✨🎨💡✅]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeading(title: string) {
  return stripDecor(title)
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[·:：\-—_|]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function isGenericTitle(title: string) {
  const text = stripDecor(title);
  if (/模板|初始化|精修定稿|生成完成|教案生成|课件设计/.test(text)) return true;
  return /^(.*?)?(教案|课件|试卷)（校本）$/.test(text);
}

function isPlaceholder(body: string) {
  const text = String(body || '').replace(/<[^>]+>/g, '').trim();
  if (!text) return true;
  if (/^（?待.{0,16}填写）?$/.test(text)) return true;
  if (/按模板排版|待定稿出题|结合本校.+编写/.test(text) && text.length < 40) return true;
  if (/^围绕[「『"].+?[」』"]展开/.test(text) && text.length < 80) return true;
  return false;
}

function isProcessSectionTitle(title: string) {
  const text = stripDecor(title);
  return /^(本阶段结果|基本信息|学科\s*\/\s*班级|选用模板|素材库已选资源|班级画像数字|已确认大纲|本阶段任务|当前已填写的模板全文|待精修正文|课题[（(]教学落点[）)]|提示)$/.test(text)
    || /素材库已选|班级画像数字|选用模板|本阶段结果|系统提交/.test(text);
}

function isCoursewareDesignTitle(title: string) {
  const text = stripDecor(title);
  return /^(基本信息|内容分析|框架设计|学生分析|教学分析|当前知识的问题|老师能力的分析|教学决策|页面结构|交互与呈现)$/.test(text);
}

function stripProcessEcho(text: string) {
  return String(text || '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^围绕[「『"].+?[」』"]展开[：:]/.test(trimmed)) return false;
      if (/系统提交课题为/.test(trimmed)) return false;
      if (/本课落点定为/.test(trimmed)) return false;
      if (/依据班级薄弱点/.test(trimmed) && /落点/.test(trimmed)) return false;
      if (/帮我生成(教案|课件|试卷)/.test(trimmed)) return false;
      if (/^(课题[（(]教学落点[）)]|学科\s*\/\s*班级|选用模板|素材库已选资源|班级画像数字|提示)\s*[:：]/.test(trimmed.replace(/\*+/g, '').trim())) return false;
      return true;
    })
    .join('\n');
}

function parseSections(markdown: string): MarkdownSection[] {
  const lines = String(markdown || '').split('\n');
  const sections: MarkdownSection[] = [{ level: 0, title: '', body: '' }];
  let current = sections[0];
  for (const line of lines) {
    const matched = /^(#{1,2})\s+(.+)\s*$/.exec(line);
    if (matched) {
      current = { level: matched[1].length, title: stripDecor(matched[2]), body: '' };
      sections.push(current);
    } else {
      current.body += `${current.body ? '\n' : ''}${line}`;
    }
  }
  return sections;
}

function serializeSections(sections: MarkdownSection[]) {
  return sections
    .map((section) => {
      const body = section.body.replace(/^\n+/, '').replace(/\n+$/, '');
      if (!section.title) return body;
      return body
        ? `${'#'.repeat(Math.max(1, section.level))} ${section.title}\n${body}`
        : `${'#'.repeat(Math.max(1, section.level))} ${section.title}`;
    })
    .filter((item) => item.trim())
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function pickCoursewareVisibleMarkdown(stepType: string, markdown: string) {
  const raw = String(markdown || '');
  if (!raw.trim()) return '';
  const sections = parseSections(raw);
  const match = (titles: string[]) => sections.filter((section) => (
    section.level >= 2 && titles.some((title) => section.title.includes(title)) && !isPlaceholder(section.body)
  ));
  if (stepType === 'analysis') {
    return serializeSections(match(['内容分析', '学生分析']));
  }
  if (stepType === 'outline') {
    return serializeSections(match(['框架设计', '教学决策', '页面结构', '交互与呈现']));
  }
  if (stepType === 'content' || stepType === 'refine' || stepType === 'confirm') {
    // 只展示本阶段页面/正文产出，不回显初始化/分析/框架
    return serializeSections(sections.filter((section) => {
      if (isProcessSectionTitle(section.title)) return false;
      if (section.level === 1 && /课件模板|课件（校本）|课件设计/.test(section.title)) return false;
      if (/基本信息|内容分析|学生分析|教学分析|框架设计|教学决策/.test(section.title)) return false;
      if (isPlaceholder(section.body)) return false;
      if (section.level >= 2 && !String(section.body || '').trim()) return false;
      return Boolean(String(section.body || '').trim()) || (section.level === 0 && Boolean(section.body.trim()));
    }));
  }
  return serializeSections(sections.filter((section) => {
    if (section.level === 1 && /课件模板|课件（校本）|课件设计/.test(section.title)) return false;
    if (section.level >= 2) {
      if (/内容分析|框架设计|学生分析|教学分析|教学决策|页面结构|交互/.test(section.title)) {
        return false;
      }
      return /基本信息|课题/.test(section.title) && !isPlaceholder(section.body);
    }
    if (section.level === 1) return !isPlaceholder(section.body);
    return !isPlaceholder(section.body);
  }));
}

/** 对话区只展示本阶段有效输出，不展示空模板壳；完整稿在生成记录预览 */
export function pickLessonPlanVisibleMarkdown(stepType: string, markdown: string) {
  const raw = String(markdown || '');
  if (!raw.trim()) return '';

  const sections = parseSections(raw);
  const hasBody = (section: MarkdownSection) => Boolean(String(section.body || '').replace(/（待.*?）/g, '').trim());
  const isTemplateShellTitle = (title: string) => /教案模板|教案（校本）|系统教案/.test(stripDecor(title));
  const isEmptyColumnTitle = (title: string) => /教学目标|教学重难点|教学过程|板书设计|作业布置|例题讲解/.test(stripDecor(title));
  const keepInitTitle = (title: string) => /基本信息|课题|学科|学段|素材|选用模板|初始化/.test(title);
  const isEarlierStageTitle = (title: string) => /基本信息|课题|初始化|学情|课标/.test(stripDecor(title));
  const isContentStageTitle = (title: string) => (
    /教学目标|教学重难点|教学过程|板书|作业|例题|教学反思|课堂小结|变式|导入|巩固/.test(stripDecor(title))
  );

  if (stepType === 'analysis') {
    // 本阶段栏目尚未写出时返回空，绝不回退到上一阶段正文
    return serializeSections(sections.filter((section) => (
      section.level >= 2
      && /学情|课标/.test(section.title)
      && !isPlaceholder(section.body)
      && hasBody(section)
    )));
  }
  if (stepType === 'outline') {
    return serializeSections(sections.filter((section) => (
      section.level >= 2
      && /教学过程|大纲/.test(section.title)
      && !isPlaceholder(section.body)
      && hasBody(section)
    )));
  }
  if (stepType === 'content' || stepType === 'refine' || stepType === 'confirm') {
    return serializeSections(sections.filter((section) => {
      if (isProcessSectionTitle(section.title) && !keepInitTitle(section.title)) return false;
      if (section.level === 1 && isTemplateShellTitle(section.title)) return false;
      if (isEarlierStageTitle(section.title)) return false;
      if (isPlaceholder(section.body) || !hasBody(section)) return false;
      if (section.level >= 2) return isContentStageTitle(section.title);
      return hasBody(section);
    }));
  }

  // init：必须保留「基本信息」等已填内容（不可被 process 段误杀）
  return serializeSections(sections.filter((section) => {
    if (section.level === 1 && isTemplateShellTitle(section.title)) return false;
    if (section.level >= 2 && isEmptyColumnTitle(section.title)) return false;
    if (isProcessSectionTitle(section.title) && !keepInitTitle(section.title)) return false;
    if (isPlaceholder(section.body)) return false;
    if (section.level >= 2) {
      return keepInitTitle(section.title) && hasBody(section);
    }
    if (section.level === 1) {
      return /初始化|教案/.test(section.title) || hasBody(section);
    }
    return hasBody(section);
  }));
}

export function cleanExportMarkdown(markdown: string, title?: string) {
  let text = stripProcessEcho(String(markdown || '')
    .replace(/<\/?callout[^>]*>/gi, '')
    .replace(/<\/?ai>/gi, '')
    .replace(/<\/?teacher>/gi, '')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/^\s*\*\*生成时间\*\*.*$/gm, '')
    .replace(/^\s*\*\*版本\*\*.*$/gm, '')
    .replace(/^\s*\*\*字数\*\*.*$/gm, ''));

  const sections = parseSections(text);
  const merged: MarkdownSection[] = [];
  const h2Index = new Map<string, number>();
  let h1: MarkdownSection | null = null;

  for (const section of sections) {
    const cleanedBody = stripProcessEcho(section.body);
    if (section.level === 0) {
      if (cleanedBody.trim()) merged.push({ ...section, body: cleanedBody });
      continue;
    }
    if (section.level === 1) {
      if (isProcessSectionTitle(section.title)) {
        if (cleanedBody.trim() && !h1) {
          h1 = { level: 1, title: title ? stripDecor(title) : section.title, body: cleanedBody };
        }
        continue;
      }
      if (!h1) {
        h1 = {
          ...section,
          title: isGenericTitle(section.title) && title ? stripDecor(title) : section.title,
          body: cleanedBody,
        };
        continue;
      }
      if (isGenericTitle(h1.title) && !isGenericTitle(section.title)) {
        h1 = { ...section, body: [h1.body, cleanedBody].filter((item) => item.trim()).join('\n') };
        continue;
      }
      if (isGenericTitle(section.title)) {
        if (cleanedBody.trim() && isPlaceholder(h1.body)) h1 = { ...h1, body: cleanedBody };
        continue;
      }
      if (cleanedBody.trim().length > h1.body.trim().length) h1 = { ...section, body: cleanedBody };
      continue;
    }
    if (isProcessSectionTitle(section.title)) continue;
    const key = normalizeHeading(section.title);
    if (!key) continue;
    const next = { ...section, body: cleanedBody };
    const existing = h2Index.get(key);
    if (existing != null) {
      const prev = merged[existing];
      if (isPlaceholder(prev.body) || (!isPlaceholder(next.body) && next.body.trim().length >= prev.body.trim().length)) {
        merged[existing] = { ...next, title: prev.title || next.title };
      }
      continue;
    }
    if (isPlaceholder(next.body)) continue;
    h2Index.set(key, merged.length);
    merged.push(next);
  }

  const topic = stripDecor(title || '');
  const heading: MarkdownSection[] = [];
  if (h1 && !isGenericTitle(h1.title)) {
    heading.push(h1);
  } else if (topic) {
    heading.push({ level: 1, title: topic, body: h1?.body || '' });
  }

  const rest = merged.filter((item) => item.level !== 1);
  return serializeSections([...heading, ...rest]);
}

function inlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function splitTableRow(line: string) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function markdownToHtml(markdown: string) {
  const lines = String(markdown || '').split('\n');
  const out: string[] = [];
  let i = 0;
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      out.push(listType === 'ul' ? '</ul>' : '</ol>');
      listType = null;
    }
  };

  const openList = (type: 'ul' | 'ol') => {
    if (listType === type) return;
    closeList();
    out.push(type === 'ul' ? '<ul>' : '<ol>');
    listType = type;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      i += 1;
      continue;
    }
    if (/^[-*]{3,}$/.test(trimmed) || trimmed === '---') {
      closeList();
      out.push('<hr/>');
      i += 1;
      continue;
    }
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1].trim())) {
      closeList();
      const headers = splitTableRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && !isTableDivider(lines[i].trim())) {
        rows.push(splitTableRow(lines[i].trim()));
        i += 1;
      }
      out.push('<table>');
      out.push(`<tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr>`);
      rows.forEach((row) => {
        out.push(`<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`);
      });
      out.push('</table>');
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      openList('ul');
      out.push(`<li>${inlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      i += 1;
      continue;
    }
    if (/^\d+[\.、．]\s+/.test(trimmed)) {
      openList('ol');
      out.push(`<li>${inlineMarkdown(trimmed.replace(/^\d+[\.、．]\s+/, ''))}</li>`);
      i += 1;
      continue;
    }
    closeList();
    if (trimmed.startsWith('# ')) out.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
    else if (trimmed.startsWith('## ')) out.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
    else if (trimmed.startsWith('### ')) out.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
    else if (trimmed.startsWith('> ')) out.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
    else out.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    i += 1;
  }
  closeList();
  return out.join('\n');
}

function documentCss() {
  return `
    @page { size: A4; margin: 2.4cm 2.2cm 2.2cm; }
    body { font-family: '宋体', SimSun, serif; font-size: 12pt; line-height: 1.85; color: #222; }
    h1 { font-family: '黑体', SimHei, sans-serif; font-size: 18pt; text-align: center; margin: 0 0 18pt; font-weight: 700; }
    h2 { font-family: '黑体', SimHei, sans-serif; font-size: 14pt; margin: 16pt 0 8pt; padding-bottom: 4pt; border-bottom: 1px solid #d0d0d0; }
    h3 { font-family: '黑体', SimHei, sans-serif; font-size: 12pt; margin: 12pt 0 6pt; }
    p { margin: 0 0 8pt; text-indent: 2em; }
    h1 + p, h2 + p, h3 + p { text-indent: 2em; }
    ul, ol { margin: 0 0 10pt 1.6em; padding: 0; }
    li { margin: 0 0 4pt; }
    li p, td p, th p { text-indent: 0; margin: 0; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; font-size: 11pt; }
    th, td { border: 1px solid #444; padding: 6px 8px; text-align: left; }
    th { background: #f3f4f6; font-family: '黑体', SimHei, sans-serif; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 16pt 0; }
    blockquote { margin: 8pt 0; padding: 6pt 12pt; border-left: 3px solid #94a3b8; color: #444; background: #f8fafc; }
    code { font-family: Consolas, monospace; }
  `;
}

function wrapHtml(title: string, body: string) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${escapeHtml(title)}</title>
<style>${documentCss()}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function coursewareSlideMarkdown(markdown: string) {
  const sections = parseSections(markdown).filter((section) => {
    if (section.level === 0) return Boolean(section.body.trim());
    if (section.level === 1) return true;
    return !isCoursewareDesignTitle(section.title);
  });
  return serializeSections(sections);
}

export function prepareCoursewareMarkdown(markdown: string, title?: string) {
  return coursewareSlideMarkdown(cleanExportMarkdown(markdown, title));
}

async function exportDoc(title: string, markdown: string) {
  const { exportLessonDocx } = await import('./exportLessonDocx');
  await exportLessonDocx(title, markdown);
}

function exportXls(title: string, markdown: string) {
  const rows = String(markdown || '')
    .split('\n')
    .map((line) => line.replace(/^#{1,6}\s+/, '').replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
    .map((line) => `<tr><td>${escapeHtml(line)}</td></tr>`)
    .join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8"></head>
<body><table><tr><th>${escapeHtml(title)}</th></tr>${rows}</table></body></html>`;
  downloadBlob(`${safeName(title)}.xls`, new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' }));
}

async function exportPpt(title: string, markdown: string) {
  const { exportCoursewarePptx } = await import('./exportCoursewarePptx');
  await exportCoursewarePptx(title, coursewareSlideMarkdown(markdown));
}

function exportPdf(title: string, markdown: string) {
  const popup = window.open('', '_blank', 'width=900,height=700');
  const html = wrapHtml(title, markdownToHtml(markdown));
  if (!popup) {
    downloadBlob(`${safeName(title)}.html`, new Blob([html], { type: 'text/html' }));
    return;
  }
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 300);
}

function exportTxt(title: string, markdown: string) {
  downloadBlob(`${safeName(title)}.txt`, new Blob([markdown || ''], { type: 'text/plain;charset=utf-8' }));
}

export async function exportByTemplate(options: {
  title: string;
  markdown: string;
  kind?: string;
  builtinType?: string;
}): Promise<ExportSpec> {
  const spec = resolveExportSpec(options.kind, options.builtinType);
  const markdown = cleanExportMarkdown(options.markdown, options.title);
  if (spec.format === 'ppt') await exportPpt(options.title, markdown);
  else if (spec.format === 'pdf') exportPdf(options.title, markdown);
  else if (spec.format === 'xls') exportXls(options.title, markdown);
  else if (spec.format === 'txt') exportTxt(options.title, markdown);
  else await exportDoc(options.title, markdown);
  return spec;
}
