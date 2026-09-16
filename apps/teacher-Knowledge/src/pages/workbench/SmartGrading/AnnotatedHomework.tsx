import React, { useState } from 'react';

export type MarkVerdict = 'correct' | 'incorrect' | 'partial' | 'unanswered';

export type MarkItem = {
  no?: string;
  verdict?: MarkVerdict | string;
  imageIndex?: number;
  image_index?: number;
  bbox?: { x: number; y: number; w: number; h: number; unit?: 'ratio' | 'px' } | number[];
};

type Box = { x: number; y: number; w: number; h: number };

const RED = '#dc2626';

function parseRaw(raw: MarkItem['bbox']): { x: number; y: number; w: number; h: number; unit?: 'ratio' | 'px' } | undefined {
  if (!raw) return undefined;
  let x: number;
  let y: number;
  let w: number;
  let h: number;
  let unit: 'ratio' | 'px' | undefined;
  if (Array.isArray(raw) && raw.length >= 4) {
    const [a, b, c, d] = raw.map(Number);
    if (c > a && d > b) {
      x = a;
      y = b;
      w = c - a;
      h = d - b;
    } else {
      x = a;
      y = b;
      w = c;
      h = d;
    }
  } else {
    const box = raw as {
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      width?: number;
      height?: number;
      unit?: 'ratio' | 'px';
    };
    x = Number(box.x);
    y = Number(box.y);
    w = Number(box.w ?? box.width);
    h = Number(box.h ?? box.height);
    unit = box.unit;
  }
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return undefined;
  return { x, y, w, h, unit };
}

/** Qwen3-VL 使用 0–1000 网格，不是原图像素。 */
function toRatio(raw: MarkItem['bbox'], imgW: number, imgH: number): Box | undefined {
  const parsed = parseRaw(raw);
  if (!parsed) return undefined;
  let { x, y, w, h, unit } = parsed;
  const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(x + w), Math.abs(y + h));

  if (unit === 'ratio' || max <= 1.5) {
    // already 0-1
  } else if (max <= 100) {
    x /= 100;
    y /= 100;
    w /= 100;
    h /= 100;
  } else if (max <= 1000) {
    x /= 1000;
    y /= 1000;
    w /= 1000;
    h /= 1000;
  } else if (imgW > 0 && imgH > 0) {
    x /= imgW;
    y /= imgH;
    w /= imgW;
    h /= imgH;
  } else {
    return undefined;
  }

  const minW = 0.03;
  const minH = 0.024;
  if (w < minW) {
    x -= (minW - w) / 2;
    w = minW;
  }
  if (h < minH) {
    y -= (minH - h) / 2;
    h = minH;
  }

  x = Math.min(Math.max(x, 0), 0.97);
  y = Math.min(Math.max(y, 0), 0.97);
  w = Math.min(Math.max(w, 0.02), 1 - x);
  h = Math.min(Math.max(h, 0.018), 1 - y);
  return { x, y, w, h };
}

function withFallback(items: MarkItem[], imgW: number, imgH: number): Array<MarkItem & { box: Box; verdict: MarkVerdict }> {
  const n = Math.max(items.length, 1);
  return items.map((item, index) => {
    const box = toRatio(item.bbox, imgW, imgH) || {
      x: 0.84,
      y: Math.min(0.08 + index * (0.84 / n), 0.9),
      w: 0.12,
      h: Math.max(0.045, 0.7 / n),
    };
    const verdict = (['correct', 'incorrect', 'partial', 'unanswered'].includes(String(item.verdict))
      ? item.verdict
      : 'incorrect') as MarkVerdict;
    return { ...item, box, verdict };
  });
}

function CheckMark({ box }: { box: Box }) {
  const size = Math.max(Math.min(box.w, box.h) * 1.85, 0.042);
  const left = box.x + box.w / 2 - size * 0.42;
  const top = box.y + box.h / 2 - size * 0.38;
  return (
    <svg
      className="pointer-events-none absolute overflow-visible"
      style={{ left: `${left * 100}%`, top: `${top * 100}%`, width: `${size * 100}%`, height: `${size * 140}%` }}
      viewBox="0 0 64 72"
      fill="none"
    >
      <path
        d="M6 34 L24 54 L60 8"
        stroke={RED}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(-8 32 36)"
      />
    </svg>
  );
}

function RedCircle({ box }: { box: Box }) {
  const padX = Math.max(box.w * 0.28, 0.01);
  const padY = Math.max(box.h * 0.35, 0.01);
  return (
    <div
      className="pointer-events-none absolute rounded-[50%] border-[3px]"
      style={{
        left: `${Math.max(box.x - padX, 0) * 100}%`,
        top: `${Math.max(box.y - padY, 0) * 100}%`,
        width: `${(box.w + padX * 2) * 100}%`,
        height: `${(box.h + padY * 2) * 100}%`,
        borderColor: RED,
        transform: 'rotate(-6deg)',
      }}
    />
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

function drawCheck(ctx: CanvasRenderingContext2D, box: Box, imgW: number, imgH: number) {
  const size = Math.max(Math.min(box.w, box.h) * 1.85, 0.042);
  const left = (box.x + box.w / 2 - size * 0.42) * imgW;
  const top = (box.y + box.h / 2 - size * 0.38) * imgH;
  const w = size * imgW;
  const h = size * 1.4 * imgH;
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.lineWidth = Math.max(w * 0.12, 4);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(left + w * 0.1, top + h * 0.48);
  ctx.lineTo(left + w * 0.38, top + h * 0.72);
  ctx.lineTo(left + w * 0.92, top + h * 0.14);
  ctx.stroke();
  ctx.restore();
}

function drawCircle(ctx: CanvasRenderingContext2D, box: Box, imgW: number, imgH: number) {
  const padX = Math.max(box.w * 0.28, 0.01);
  const padY = Math.max(box.h * 0.35, 0.01);
  const x = Math.max(box.x - padX, 0) * imgW;
  const y = Math.max(box.y - padY, 0) * imgH;
  const w = (box.w + padX * 2) * imgW;
  const h = (box.h + padY * 2) * imgH;
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.lineWidth = Math.max(Math.min(w, h) * 0.08, 3);
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, (-6 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 在原图上绘制批注并导出 JPEG Blob（下载与上传 OSS 共用） */
export async function renderAnnotatedBlobs(
  pages: Array<{ src: string; items: MarkItem[] }>,
  baseName = '原图批注',
): Promise<Array<{ blob: Blob; fileName: string }>> {
  const safeName = String(baseName || '原图批注').replace(/[\\/:*?"<>|]+/g, '_');
  const results: Array<{ blob: Blob; fileName: string }> = [];
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const img = await loadImage(page.src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法导出图片');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const marks = withFallback(page.items, canvas.width, canvas.height);
    marks.forEach((item) => {
      if (item.verdict === 'correct' || item.verdict === 'partial') {
        drawCheck(ctx, item.box, canvas.width, canvas.height);
      }
      if (item.verdict === 'incorrect' || item.verdict === 'unanswered' || item.verdict === 'partial') {
        drawCircle(ctx, item.box, canvas.width, canvas.height);
      }
    });
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('导出失败'))), 'image/jpeg', 0.92);
    });
    const fileName = pages.length > 1 ? `${safeName}-${index + 1}.jpg` : `${safeName}.jpg`;
    results.push({ blob, fileName });
  }
  return results;
}

export async function downloadAnnotatedPages(
  pages: Array<{ src: string; items: MarkItem[] }>,
  baseName = '原图批注',
) {
  const rendered = await renderAnnotatedBlobs(pages, baseName);
  for (let index = 0; index < rendered.length; index += 1) {
    triggerDownload(rendered[index].blob, rendered[index].fileName);
    if (index < rendered.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
  }
}

export default function AnnotatedHomework({
  src,
  items,
}: {
  src: string;
  items: MarkItem[];
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const marks = withFallback(items, size.w, size.h);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative">
        <img
          src={src}
          alt="作业批改"
          className="block w-full select-none"
          onLoad={(event) => {
            setSize({
              w: event.currentTarget.naturalWidth,
              h: event.currentTarget.naturalHeight,
            });
          }}
        />
        <div className="absolute inset-0">
          {marks.map((item, index) => (
            <React.Fragment key={`${item.no || index}-${item.verdict}`}>
              {item.verdict === 'correct' || item.verdict === 'partial' ? <CheckMark box={item.box} /> : null}
              {item.verdict === 'incorrect' || item.verdict === 'unanswered' || item.verdict === 'partial' ? (
                <RedCircle box={item.box} />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-red-600">✓</span> 红色对钩：正确
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border-2 border-red-600" /> 红色画圈：错误
        </span>
      </div>
    </div>
  );
}
