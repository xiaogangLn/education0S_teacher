/**
 * 流式 Markdown 稳定化：补全未闭合的 fence / 表格 / 公式，避免 SSE 半截语法把整段打乱。
 * 完成后（streaming=false）原样返回，不做补全。
 */
export function stabilizeStreamingMarkdown(input: string, streaming = false): string {
  let text = String(input || '');
  if (!text) return text;
  if (!streaming) return text;

  // 去掉末尾半截 HTML 标签（如 <callout type="in）
  text = text.replace(/<\/?[A-Za-z][^>\n]*$/g, '');

  // 未闭合代码围栏（按 ``` 出现次数配对）
  const fenceCount = (text.match(/```/g) || []).length;
  if (fenceCount % 2 === 1) {
    text = `${text.replace(/\s*$/, '')}\n\`\`\``;
  }

  // 未闭合 $$ 块级公式
  const blockMath = text.match(/\$\$/g);
  if (blockMath && blockMath.length % 2 === 1) {
    text = `${text.replace(/\s*$/, '')}\n$$`;
  }

  // 行内 $...$ ：忽略已成对的，处理末尾落单的 $
  text = closeTrailingInlineMath(text);

  // GFM 表格：有表头行但还没分隔行时，先补一行
  text = ensureTableSeparator(text);

  // 未闭合加粗 **（不在代码块内时粗略处理）
  if (!isInsideOpenFence(text)) {
    const stars = text.match(/\*\*/g);
    if (stars && stars.length % 2 === 1) {
      text = `${text}**`;
    }
  }

  return text;
}

function isInsideOpenFence(text: string) {
  const fences = text.match(/```/g);
  return Boolean(fences && fences.length % 2 === 1);
}

function closeTrailingInlineMath(text: string) {
  const openBlock = (text.match(/\$\$/g) || []).length % 2 === 1;
  if (openBlock) return text;
  let stripped = text.replace(/\$\$[\s\S]*?\$\$/g, '');
  stripped = stripped.replace(/\$[^$\n]+\$/g, '');
  const leftovers = stripped.match(/\$/g);
  if (leftovers && leftovers.length % 2 === 1) {
    return `${text}$`;
  }
  return text;
}

function ensureTableSeparator(text: string) {
  const lines = text.split('\n');
  let end = lines.length - 1;
  while (end >= 0 && !lines[end].trim()) end -= 1;
  if (end < 0) return text;

  let start = end;
  while (start >= 0 && /^\|.+\|/.test(lines[start].trim())) start -= 1;
  start += 1;
  if (start > end) return text;

  const block = lines.slice(start, end + 1).map((line) => line.trim());
  if (!block.length || !/^\|.+\|$/.test(block[0])) return text;
  if (block.some((line) => /^\|?\s*:?-{3,}/.test(line))) return text;

  const cols = block[0].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  if (!cols.length) return text;
  const sep = `| ${cols.map(() => '---').join(' | ')} |`;
  lines.splice(start + 1, 0, sep);
  return lines.join('\n');
}
