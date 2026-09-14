import PptxGenJS from 'pptxgenjs';
import { renderCoursewareSvg, svgToPptData } from '@ui/lib/coursewareVisuals';
import {
  buildCoursewareSlides,
  cleanSlideText,
  type CoursewareBlock,
  type CoursewareSlide,
} from './coursewareSlides';

const W = 13.333;
const H = 7.5;
const FONT = 'Microsoft YaHei';

const C = {
  navy: '0F2C59',
  navyDeep: '0A1F40',
  gold: 'D4A017',
  goldSoft: 'F5E6B8',
  ink: '1F2937',
  muted: '64748B',
  line: 'E2E8F0',
  page: 'F6F8FC',
  white: 'FFFFFF',
  card: 'FFFFFF',
  blue: '1D4ED8',
};

function addDecorBar(slide: PptxGenJS.PresSlide) {
  slide.addShape('rect', { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.gold } });
}

function addFooter(slide: PptxGenJS.PresSlide, topic: string, page: number, total: number) {
  slide.addShape('rect', { x: 0, y: 7.18, w: W, h: 0.32, fill: { color: C.navy } });
  slide.addText(topic, {
    x: 0.45, y: 7.18, w: 10.2, h: 0.32,
    fontFace: FONT, fontSize: 11, color: C.goldSoft, valign: 'middle', margin: 0,
  });
  slide.addText(`${page} / ${total}`, {
    x: 11.1, y: 7.18, w: 1.8, h: 0.32,
    fontFace: FONT, fontSize: 11, color: C.white, align: 'right', valign: 'middle', margin: 0,
  });
}

function addHeader(slide: PptxGenJS.PresSlide, title: string, subtitle?: string) {
  slide.addShape('rect', { x: 0, y: 0, w: W, h: subtitle ? 1.28 : 1.05, fill: { color: C.navy } });
  slide.addShape('rect', { x: 0, y: subtitle ? 1.28 : 1.05, w: W, h: 0.07, fill: { color: C.gold } });
  slide.addText(title, {
    x: 0.5, y: 0.22, w: 12.3, h: subtitle ? 0.58 : 0.66,
    fontFace: FONT, fontSize: 24, bold: true, color: C.white, valign: 'middle', margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.78, w: 12.3, h: 0.38,
      fontFace: FONT, fontSize: 14, color: C.goldSoft, valign: 'middle', margin: 0,
    });
  }
}

function addCover(pptx: PptxGenJS, draft: CoursewareSlide, topic: string) {
  const slide = pptx.addSlide();
  slide.addShape('rect', { x: 0, y: 0, w: W, h: H, fill: { color: C.navyDeep } });
  slide.addShape('rect', { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.gold } });
  slide.addShape('ellipse', {
    x: 10.6, y: -1.6, w: 4.2, h: 4.2,
    fill: { color: C.navy, transparency: 30 },
  });
  slide.addShape('ellipse', {
    x: 11.4, y: 5.1, w: 3.2, h: 3.2,
    fill: { color: C.navy, transparency: 18 },
  });
  slide.addText('教学课件', {
    x: 0.9, y: 1.7, w: 11, h: 0.4,
    fontFace: FONT, fontSize: 16, color: C.gold, margin: 0, charSpacing: 6,
  });
  slide.addText(draft.title, {
    x: 0.9, y: 2.2, w: 11.4, h: 1.5,
    fontFace: FONT, fontSize: 40, bold: true, color: C.white, valign: 'middle', margin: 0,
  });
  slide.addShape('rect', { x: 0.9, y: 3.82, w: 2.4, h: 0.08, fill: { color: C.gold } });
  const lines = draft.blocks.flatMap((block) => {
    if (block.type === 'p') return [block.text];
    if (block.type === 'ul' || block.type === 'ol') return block.items;
    return [];
  }).filter(Boolean).slice(0, 3);
  if (lines.length) {
    slide.addText(lines.map((line) => ({ text: line, options: { breakLine: true } })), {
      x: 0.9, y: 4.15, w: 11, h: 1.5,
      fontFace: FONT, fontSize: 16, color: 'E5E7EB', valign: 'top', margin: 0,
    });
  }
  slide.addText(topic ? `${topic}  ·  EducationOS 教师工作台` : 'EducationOS 教师工作台', {
    x: 0.9, y: 6.7, w: 11, h: 0.35,
    fontFace: FONT, fontSize: 13, color: '94A3B8', margin: 0,
  });
}

function collectPoints(blocks: CoursewareBlock[]) {
  return blocks.flatMap((block) => {
    if (block.type === 'ul' || block.type === 'ol') return block.items;
    if (block.type === 'p') return [block.text];
    if (block.type === 'h3') return [block.text];
    return [];
  }).filter(Boolean);
}

function addPointCards(slide: PptxGenJS.PresSlide, points: string[], startY: number) {
  const shown = points.slice(0, 6);
  const cols = shown.length > 3 ? 2 : 1;
  const cardW = cols === 2 ? 5.85 : 12.1;
  const cardH = shown.length > 4 ? 1.15 : 1.35;
  shown.forEach((point, index) => {
    const col = cols === 2 ? index % 2 : 0;
    const row = cols === 2 ? Math.floor(index / 2) : index;
    const x = 0.55 + col * 6.15;
    const y = startY + row * (cardH + 0.16);
    slide.addShape('roundRect', {
      x, y, w: cardW, h: cardH,
      fill: { color: C.white },
      rectRadius: 0.1,
      shadow: { type: 'outer', color: '0F172A', blur: 8, offset: 2, opacity: 0.08 },
    });
    slide.addShape('ellipse', {
      x: x + 0.18, y: y + cardH / 2 - 0.22, w: 0.44, h: 0.44,
      fill: { color: C.navy },
    });
    slide.addText(String(index + 1).padStart(2, '0'), {
      x: x + 0.18, y: y + cardH / 2 - 0.22, w: 0.44, h: 0.44,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle', margin: 0,
    });
    slide.addText(point, {
      x: x + 0.78, y: y + 0.12, w: cardW - 0.96, h: cardH - 0.24,
      fontFace: FONT, fontSize: 15, color: C.ink, valign: 'middle', margin: 0,
    });
  });
}

function addBodyBlocks(slide: PptxGenJS.PresSlide, blocks: CoursewareBlock[], startY: number, width = 12.2) {
  const textItems: PptxGenJS.TextProps[] = [];
  blocks.forEach((block) => {
    if (block.type === 'visual') return;
    if (block.type === 'h3') {
      textItems.push({ text: block.text, options: { bold: true, breakLine: true, fontSize: 18, color: C.navy } });
      return;
    }
    if (block.type === 'p') {
      textItems.push({ text: block.text, options: { breakLine: true, fontSize: 16 } });
      return;
    }
    if (block.type === 'ul' || block.type === 'ol') {
      block.items.forEach((item, index) => {
        textItems.push({
          text: item,
          options: {
            breakLine: true,
            fontSize: 16,
            bullet: block.type === 'ol' ? { type: 'number' } : { characterCode: '25CF' },
            paraSpaceBefore: index === 0 ? 4 : 2,
            paraSpaceAfter: 6,
          },
        });
      });
    }
  });
  if (textItems.length) {
    slide.addText(textItems, {
      x: 0.55, y: startY, w: width, h: 7.1 - startY,
      fontFace: FONT, color: C.ink, valign: 'top', margin: 0,
    });
  }
  const table = blocks.find((block) => block.type === 'table');
  if (table && table.type === 'table') {
    const rows = table.rows.map((row, rowIndex) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fill: { color: rowIndex === 0 ? C.navy : rowIndex % 2 ? 'F8FAFC' : C.white },
          color: rowIndex === 0 ? C.white : C.ink,
          bold: rowIndex === 0,
          align: 'center' as const,
          valign: 'middle' as const,
        },
      })),
    );
    slide.addTable(rows, {
      x: 0.55,
      y: textItems.length ? Math.min(startY + 2.6, 4.35) : startY,
      w: width,
      colW: rows[0]?.map(() => width / Math.max(rows[0].length, 1)),
      border: [{ pt: 0.6, color: C.line }],
      fontFace: FONT,
      fontSize: 13,
      valign: 'middle',
    });
  }
}

function addContentSlide(
  pptx: PptxGenJS,
  draft: CoursewareSlide,
  topic: string,
  page: number,
  total: number,
) {
  const slide = pptx.addSlide();
  slide.addShape('rect', { x: 0, y: 0, w: W, h: H, fill: { color: C.page } });
  addDecorBar(slide);
  addHeader(slide, draft.title, draft.subtitle);
  addFooter(slide, topic, page, total);
  const startY = draft.subtitle ? 1.55 : 1.32;
  const visuals = draft.blocks.filter((block) => block.type === 'visual');
  const rest = draft.blocks.filter((block) => block.type !== 'visual');
  const points = collectPoints(rest);
  const hasTable = rest.some((block) => block.type === 'table');
  if (!visuals.length && (draft.kind === 'goals' || draft.kind === 'summary') && points.length > 0 && points.length <= 6 && !hasTable) {
    addPointCards(slide, points, startY);
    return;
  }
  addBodyBlocks(slide, rest, startY, visuals.length ? 6.3 : 12.2);
  const visual = visuals[0];
  if (visual && visual.type === 'visual') {
    const svg = renderCoursewareSvg(visual.spec, { animated: false });
    if (svg) {
      slide.addImage({
        data: svgToPptData(svg),
        x: 7.05,
        y: startY,
        w: 5.6,
        h: 4.6,
      });
    }
    if (visual.spec.caption) {
      slide.addText((visual.spec.motion ? '动态演示 · ' : '数形结合 · ') + visual.spec.caption, {
        x: 7.05, y: 6.55, w: 5.6, h: 0.42,
        fontFace: FONT, fontSize: 11, color: C.muted, margin: 0,
      });
    }
  }
}

export async function exportCoursewarePptx(title: string, markdown: string) {
  const topic = cleanSlideText(title) || '教学课件';
  const drafts = buildCoursewareSlides(topic, markdown);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'EDU_WIDE', width: W, height: H });
  pptx.layout = 'EDU_WIDE';
  pptx.title = topic;
  pptx.author = 'EducationOS';
  pptx.subject = '教学课件';

  const total = drafts.length;
  drafts.forEach((draft, index) => {
    if (draft.kind === 'cover' && index === 0) addCover(pptx, draft, topic);
    else addContentSlide(pptx, draft, topic, index + 1, total);
  });

  const fileName = `${(topic || '课件').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60)}.pptx`;
  await pptx.writeFile({ fileName, compression: true });
}
