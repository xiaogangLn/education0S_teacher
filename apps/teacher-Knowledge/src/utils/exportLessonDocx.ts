import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';

const PAGE_W = convertMillimetersToTwip(210);
const PAGE_H = convertMillimetersToTwip(297);
const MARGIN = convertMillimetersToTwip(22);
const CONTENT_W = PAGE_W - MARGIN * 2;

const FONT_BODY = { ascii: 'Times New Roman', eastAsia: '宋体', hAnsi: 'Times New Roman' };
const FONT_HEAD = { ascii: 'SimHei', eastAsia: '黑体', hAnsi: 'SimHei' };

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '666666' };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function cleanText(text: string) {
  return String(text || '')
    .replace(/\$\$([\s\S]+?)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function runs(text: string, options: { bold?: boolean; font?: typeof FONT_BODY; size?: number } = {}) {
  const source = cleanText(text);
  const parts = source.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const font = options.font || FONT_BODY;
  const size = options.size ?? 24;
  if (!parts.length) {
    return [new TextRun({ text: '', font, size, bold: options.bold })];
  }
  return parts.map((part) => {
    const matched = /^\*\*(.+)\*\*$/.exec(part);
    return new TextRun({
      text: matched ? matched[1] : part,
      bold: Boolean(options.bold || matched),
      font,
      size,
    });
  });
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line: string) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { line: 444, after: 80 },
    indent: { firstLine: 480 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs(text),
  });
}

function headingParagraph(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], size: number) {
  return new Paragraph({
    heading: level,
    spacing: {
      before: level === HeadingLevel.HEADING_1 ? 0 : 280,
      after: level === HeadingLevel.HEADING_1 ? 240 : 120,
    },
    alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
    border: level === HeadingLevel.HEADING_2
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D0D0D0', space: 4 } }
      : undefined,
    children: runs(text, { bold: true, font: FONT_HEAD, size }),
  });
}

function makeTable(rows: string[][]) {
  const cols = Math.max(...rows.map((row) => row.length), 1);
  const cellW = Math.floor(CONTENT_W / cols);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: Array.from({ length: cols }, () => cellW),
    rows: rows.map((row, rowIndex) => new TableRow({
      children: Array.from({ length: cols }, (_, col) => new TableCell({
        width: { size: cellW, type: WidthType.DXA },
        borders: CELL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        shading: rowIndex === 0 ? { fill: 'F3F4F6' } : undefined,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0, line: 360 },
            children: runs(row[col] || '', { bold: rowIndex === 0, font: rowIndex === 0 ? FONT_HEAD : FONT_BODY, size: 22 }),
          }),
        ],
      })),
    })),
  });
}

function parseChildren(markdown: string) {
  const lines = String(markdown || '').split('\n');
  const children: Array<Paragraph | Table> = [];
  let i = 0;
  let olInstance = 0;
  let ulOpen = false;
  let olOpen = false;

  const closeLists = () => {
    ulOpen = false;
    olOpen = false;
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      closeLists();
      i += 1;
      continue;
    }
    if (/^[-*]{3,}$/.test(trimmed) || trimmed === '---') {
      closeLists();
      children.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDDDDD', space: 1 } },
        spacing: { before: 120, after: 120 },
        children: [],
      }));
      i += 1;
      continue;
    }
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1].trim())) {
      closeLists();
      const rows = [splitTableRow(trimmed)];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|') && !isTableDivider(lines[i].trim())) {
        rows.push(splitTableRow(lines[i].trim()));
        i += 1;
      }
      children.push(makeTable(rows));
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      if (!ulOpen) {
        closeLists();
        ulOpen = true;
      }
      children.push(new Paragraph({
        numbering: { reference: 'lesson-ul', level: 0 },
        spacing: { line: 400, after: 40 },
        children: runs(trimmed.replace(/^[-*]\s+/, '')),
      }));
      i += 1;
      continue;
    }
    if (/^\d+[\.、．]\s+/.test(trimmed)) {
      if (!olOpen) {
        closeLists();
        olOpen = true;
        olInstance += 1;
      }
      children.push(new Paragraph({
        numbering: { reference: 'lesson-ol', level: 0, instance: olInstance },
        spacing: { line: 400, after: 40 },
        children: runs(trimmed.replace(/^\d+[\.、．]\s+/, '')),
      }));
      i += 1;
      continue;
    }
    closeLists();
    if (trimmed.startsWith('# ')) children.push(headingParagraph(trimmed.slice(2), HeadingLevel.HEADING_1, 36));
    else if (trimmed.startsWith('## ')) children.push(headingParagraph(trimmed.slice(3), HeadingLevel.HEADING_2, 28));
    else if (trimmed.startsWith('### ')) children.push(headingParagraph(trimmed.slice(4), HeadingLevel.HEADING_3, 24));
    else if (trimmed.startsWith('> ')) {
      children.push(new Paragraph({
        indent: { left: 240 },
        spacing: { line: 400, after: 80 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: '94A3B8', space: 8 } },
        children: runs(trimmed.slice(2)),
      }));
    } else {
      children.push(bodyParagraph(trimmed));
    }
    i += 1;
  }
  return children;
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

export async function exportLessonDocx(title: string, markdown: string) {
  const topic = String(title || '教案').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
  const children = parseChildren(markdown);
  if (!children.length) {
    children.push(headingParagraph(topic, HeadingLevel.HEADING_1, 36));
  }

  const doc = new Document({
    title: topic,
    creator: 'EducationOS',
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 24 },
          paragraph: { spacing: { line: 444 } },
        },
        heading1: {
          run: { font: FONT_HEAD, size: 36, bold: true },
          paragraph: { spacing: { after: 240 }, alignment: AlignmentType.CENTER },
        },
        heading2: {
          run: { font: FONT_HEAD, size: 28, bold: true },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
        heading3: {
          run: { font: FONT_HEAD, size: 24, bold: true },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'lesson-ul',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 } } },
          }],
        },
        {
          reference: 'lesson-ol',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(`${topic}.docx`, blob);
}
