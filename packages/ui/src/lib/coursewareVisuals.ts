export type VisualKind =
  | 'function'
  | 'tangent'
  | 'triangle'
  | 'circle'
  | 'unit-circle'
  | 'number-line'
  | 'vector'
  | 'motion'
  | 'image';

export type VisualSpec = {
  kind: VisualKind;
  caption?: string;
  fn?: string;
  point?: number;
  motion?: boolean;
  a?: number;
  b?: number;
  c?: number;
  angle?: number;
  src?: string;
  title?: string;
  steps?: string[];
};

const KIND_ALIAS: Record<string, VisualKind> = {
  function: 'function',
  fn: 'function',
  graph: 'function',
  parabola: 'function',
  函数: 'function',
  图像: 'function',
  抛物: 'function',
  二次: 'function',
  tangent: 'tangent',
  secant: 'tangent',
  切线: 'tangent',
  割线: 'tangent',
  导数: 'tangent',
  变化率: 'tangent',
  triangle: 'triangle',
  三角: 'triangle',
  勾股: 'triangle',
  circle: 'circle',
  圆: 'circle',
  'unit-circle': 'unit-circle',
  unitcircle: 'unit-circle',
  单位圆: 'unit-circle',
  正弦: 'unit-circle',
  余弦: 'unit-circle',
  'number-line': 'number-line',
  numberline: 'number-line',
  数轴: 'number-line',
  vector: 'vector',
  向量: 'vector',
  motion: 'motion',
  gif: 'motion',
  scene: 'motion',
  动态: 'motion',
  动画: 'motion',
  image: 'image',
  img: 'image',
};

function esc(text: string) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toNum(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function mapKind(raw: string): VisualKind {
  const key = String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
  if (KIND_ALIAS[key]) return KIND_ALIAS[key];
  const names = Object.keys(KIND_ALIAS)
    .filter((name) => name.length >= 2 && !['fn', 'img'].includes(name))
    .sort((a, b) => b.length - a.length);
  const hit = names.find((name) => key.includes(name));
  return hit ? KIND_ALIAS[hit] : 'function';
}

export function parseVisualSpec(source: string, caption = ''): VisualSpec {
  const text = String(source || '').trim();
  if (!text) return { kind: 'function', caption, fn: 'x^2', motion: true };
  if (text.startsWith('{')) {
    try {
      const json = JSON.parse(text);
      return normalizeSpec(json, caption);
    } catch {
      // fall through
    }
  }
  const fields: Record<string, string> = {};
  text.split('\n').forEach((line) => {
    const matched = /^\s*([A-Za-z_\u4e00-\u9fa5]+)\s*[:：]\s*(.+?)\s*$/.exec(line);
    if (matched) fields[matched[1].trim().toLowerCase()] = matched[2].trim();
  });
  const steps = (fields.steps || fields.frames || '')
    .split(/[;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return normalizeSpec({
    kind: fields.kind || fields.type || fields.图 || 'function',
    caption: fields.caption || fields.title || fields.说明 || caption,
    fn: fields.fn || fields.expr || fields.函数,
    point: fields.point || fields.at || fields.x,
    motion: fields.motion || fields.gif || fields.动态,
    a: fields.a,
    b: fields.b,
    c: fields.c,
    angle: fields.angle || fields.deg,
    src: fields.src || fields.url,
    title: fields.title,
    steps,
  }, caption);
}

function truthy(value: unknown) {
  const text = String(value ?? '').trim().toLowerCase();
  return value === true || text === 'true' || text === '1' || text === 'yes' || text === '是';
}

function normalizeSpec(raw: Record<string, unknown>, caption: string): VisualSpec {
  const steps = Array.isArray(raw.steps) ? raw.steps.map((item) => String(item)) : [];
  const kind = mapKind(String(raw.kind || raw.type || 'function'));
  return {
    kind,
    caption: String(raw.caption || raw.title || caption || '').trim(),
    fn: String(raw.fn || raw.expr || (kind === 'triangle' ? '' : 'x^2')).trim() || 'x^2',
    point: toNum(raw.point ?? raw.at, 1),
    motion: kind === 'motion' || truthy(raw.motion) || truthy(raw.gif),
    a: toNum(raw.a, 3),
    b: toNum(raw.b, 4),
    c: toNum(raw.c, 5),
    angle: toNum(raw.angle, 60),
    src: String(raw.src || raw.url || '').trim(),
    title: String(raw.title || '').trim(),
    steps,
  };
}

export function parseVisualQuery(src: string, caption = ''): VisualSpec {
  const raw = String(src || '').replace(/^visual:/i, '');
  const [kindPart, query = ''] = raw.split('?');
  const fields: Record<string, string> = { kind: kindPart };
  query.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) fields[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  return normalizeSpec(fields, caption);
}

function compileFn(expr: string): (x: number) => number {
  const source = String(expr || 'x^2')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\^/g, '**')
    .replace(/pi|π/g, 'Math.PI')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/(\d)x/g, '$1*x')
    .replace(/x(\d)/g, 'x*$1');
  if (!/^[x0-9+\-*/().,MathsincotaqrbPIe_]+$/.test(source.replace(/\*\*/g, ''))) {
    return (x) => x * x;
  }
  try {
    const fn = new Function('x', `"use strict"; return (${source});`);
    return (x) => {
      const y = Number(fn(x));
      return Number.isFinite(y) ? y : NaN;
    };
  } catch {
    return (x) => x * x;
  }
}

function sampleFn(fn: (x: number) => number, min = -3, max = 3, count = 80) {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= count; i += 1) {
    const x = min + (max - min) * (i / count);
    const y = fn(x);
    if (Number.isFinite(y) && Math.abs(y) < 40) pts.push({ x, y });
  }
  return pts;
}

function wrapSvg(inner: string, animated = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 280" width="100%" height="100%" role="img">
    <rect width="420" height="280" rx="16" fill="#F8FAFC"/>
    ${inner}
    ${animated ? `<circle cx="392" cy="24" r="8" fill="#DC2626"><animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite"/></circle>
      <text x="368" y="28" font-size="11" fill="#DC2626" text-anchor="end">GIF</text>` : ''}
  </svg>`;
}

function axes(x0: number, y0: number, x1 = 400, y1 = 36) {
  return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="#94A3B8" stroke-width="1.5"/>
    <line x1="${x0}" y1="${y1}" x2="${x0}" y2="250" stroke="#94A3B8" stroke-width="1.5"/>`;
}

function plotFunction(spec: VisualSpec, animated: boolean) {
  const fn = compileFn(spec.fn || 'x^2');
  const pts = sampleFn(fn);
  const ys = pts.map((p) => p.y);
  const yMin = Math.min(-1, ...ys) - 0.6;
  const yMax = Math.max(1, ...ys) + 0.6;
  const xMin = -3;
  const xMax = 3;
  const toX = (x: number) => 40 + ((x - xMin) / (xMax - xMin)) * 340;
  const toY = (y: number) => 240 - ((y - yMin) / (yMax - yMin)) * 200;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ');
  const a = spec.point ?? 1;
  const ya = fn(a);
  const h = 1.2;
  const yb = fn(a + h);
  const deriv = (fn(a + 0.05) - fn(a - 0.05)) / 0.1;
  const tan = (x: number) => ya + deriv * (x - a);
  const showTan = spec.kind === 'tangent' || spec.motion;
  const tanLine = showTan
    ? `<line x1="${toX(-2.6)}" y1="${toY(tan(-2.6))}" x2="${toX(2.6)}" y2="${toY(tan(2.6))}" stroke="#D4A017" stroke-width="2.5"/>`
    : '';
  const secLine = showTan
    ? `<line x1="${toX(a)}" y1="${toY(ya)}" x2="${toX(a + h)}" y2="${toY(yb)}" stroke="#2563EB" stroke-width="2" stroke-dasharray="6 4">
        ${animated ? `<animate attributeName="x2" values="${toX(a + 1.8)};${toX(a + 0.18)};${toX(a + 1.8)}" dur="2.8s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="${toY(fn(a + 1.8))};${toY(fn(a + 0.18))};${toY(fn(a + 1.8))}" dur="2.8s" repeatCount="indefinite"/>` : ''}
      </line>`
    : '';
  return wrapSvg(`${axes(toX(0), toY(0))}
    <path d="${d}" fill="none" stroke="#0F2C59" stroke-width="3"/>
    ${tanLine}${secLine}
    <circle cx="${toX(a)}" cy="${toY(ya)}" r="5" fill="#DC2626"/>
    <text x="${toX(a) + 8}" y="${toY(ya) - 8}" font-size="12" fill="#0F2C59">P</text>
    <text x="52" y="28" font-size="13" fill="#334155">y = ${esc(spec.fn || 'x^2')}</text>
  `, animated && showTan);
}

function plotTriangle(spec: VisualSpec) {
  const a = Math.max(1, spec.a || 3);
  const b = Math.max(1, spec.b || 4);
  const scale = 150 / Math.max(a, b);
  const x0 = 80;
  const y0 = 230;
  const x1 = x0 + b * scale;
  const y1 = y0 - a * scale;
  return wrapSvg(`
    <polygon points="${x0},${y0} ${x1},${y0} ${x0},${y1}" fill="#DBEAFE" stroke="#0F2C59" stroke-width="3"/>
    <rect x="${x0 - a * scale}" y="${y1}" width="${a * scale}" height="${a * scale}" fill="#FEF3C7" stroke="#D4A017" stroke-width="2" opacity="0.9"/>
    <rect x="${x0}" y="${y0}" width="${b * scale}" height="${b * scale * 0.55}" fill="#FCE7F3" stroke="#BE185D" stroke-width="2" opacity="0.75"/>
    <text x="${x0 + 12}" y="${y0 - 12}" font-size="13" fill="#0F2C59">${a}² + ${b}² = ${spec.c || 5}²</text>
    <text x="${(x0 + x1) / 2}" y="${y0 + 18}" font-size="12" fill="#64748B">${b}</text>
    <text x="${x0 - 18}" y="${(y0 + y1) / 2}" font-size="12" fill="#64748B">${a}</text>
  `);
}

function plotUnitCircle(spec: VisualSpec, animated: boolean) {
  const deg = spec.angle || 60;
  const rad = (deg * Math.PI) / 180;
  const cx = 210;
  const cy = 150;
  const r = 90;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  return wrapSvg(`${axes(cx, cy, 370, 40)}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#0F2C59" stroke-width="2.5"/>
    <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#D4A017" stroke-width="3">
      ${animated ? `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="4s" repeatCount="indefinite"/>` : ''}
    </line>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${cy}" stroke="#2563EB" stroke-width="2" stroke-dasharray="5 4"/>
    <line x1="${cx}" y1="${cy}" x2="${x}" y2="${cy}" stroke="#DC2626" stroke-width="2" stroke-dasharray="5 4"/>
    <circle cx="${x}" cy="${y}" r="5" fill="#DC2626"/>
    <text x="40" y="28" font-size="13" fill="#334155">单位圆 · ${deg}°</text>
    <text x="${x + 8}" y="${y - 8}" font-size="12" fill="#0F2C59">sin / cos</text>
  `, animated);
}

function plotNumberLine(spec: VisualSpec, animated: boolean) {
  const from = -1;
  const to = 3;
  const mark = spec.point ?? 1;
  const toX = (x: number) => 50 + ((x - from) / (to - from)) * 320;
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5];
  return wrapSvg(`
    <line x1="40" y1="150" x2="390" y2="150" stroke="#0F2C59" stroke-width="3"/>
    ${ticks.map((t) => `<line x1="${toX(t)}" y1="142" x2="${toX(t)}" y2="158" stroke="#0F2C59"/><text x="${toX(t)}" y="178" font-size="12" text-anchor="middle" fill="#64748B">${t}</text>`).join('')}
    <circle cx="${toX(mark)}" cy="150" r="7" fill="#DC2626">
      ${animated ? `<animate attributeName="cx" values="${toX(0.4)};${toX(mark)};${toX(0.4)}" dur="2.4s" repeatCount="indefinite"/>` : ''}
    </circle>
    <text x="40" y="40" font-size="13" fill="#334155">数轴上的逼近</text>
  `, animated);
}

function plotVector() {
  return wrapSvg(`
    ${axes(70, 220)}
    <line x1="70" y1="220" x2="210" y2="120" stroke="#2563EB" stroke-width="3" marker-end="url(#arr)"/>
    <line x1="210" y1="120" x2="300" y2="80" stroke="#D4A017" stroke-width="3"/>
    <line x1="70" y1="220" x2="300" y2="80" stroke="#DC2626" stroke-width="3" stroke-dasharray="7 5"/>
    <text x="150" y="186" font-size="13" fill="#2563EB">a⃗</text>
    <text x="250" y="92" font-size="13" fill="#D4A017">b⃗</text>
    <text x="210" y="168" font-size="13" fill="#DC2626">a⃗+b⃗</text>
    <text x="48" y="36" font-size="13" fill="#334155">向量的几何加法</text>
  `);
}

function plotMotion(spec: VisualSpec, animated: boolean) {
  const steps = spec.steps?.length
    ? spec.steps.slice(0, 3)
    : ['看图', '对照式子', '动态逼近'];
  return wrapSvg(`
    ${steps.map((step, index) => {
      const x = 36 + index * 126;
      return `<g>
        <rect x="${x}" y="58" width="110" height="150" rx="12" fill="#fff" stroke="#0F2C59" stroke-width="2"/>
        <text x="${x + 55}" y="88" text-anchor="middle" font-size="12" fill="#D4A017">0${index + 1}</text>
        <text x="${x + 55}" y="140" text-anchor="middle" font-size="13" fill="#0F2C59">${esc(step.slice(0, 8))}</text>
      </g>`;
    }).join('')}
    <polygon points="148,128 160,133 148,138" fill="#D4A017"/>
    <polygon points="274,128 286,133 274,138" fill="#D4A017"/>
    <text x="36" y="36" font-size="13" fill="#334155">${esc(spec.title || '动态演示帧')}</text>
  `, animated);
}

function plotCircle() {
  return wrapSvg(`
    <circle cx="210" cy="150" r="88" fill="#DBEAFE" stroke="#0F2C59" stroke-width="3"/>
    <line x1="210" y1="150" x2="298" y2="150" stroke="#DC2626" stroke-width="2.5"/>
    <text x="240" y="142" font-size="13" fill="#DC2626">r</text>
    <circle cx="210" cy="150" r="4" fill="#0F2C59"/>
    <text x="40" y="36" font-size="13" fill="#334155">圆的半径与圆心</text>
  `);
}

export function renderCoursewareSvg(spec: VisualSpec, options?: { animated?: boolean }) {
  const animated = Boolean(options?.animated && spec.motion);
  if (spec.kind === 'image') return '';
  if (spec.kind === 'triangle') return plotTriangle(spec);
  if (spec.kind === 'unit-circle') return plotUnitCircle(spec, animated || spec.motion);
  if (spec.kind === 'number-line') return plotNumberLine(spec, animated || spec.motion);
  if (spec.kind === 'vector') return plotVector();
  if (spec.kind === 'circle') return plotCircle();
  if (spec.kind === 'motion') return plotMotion(spec, true);
  return plotFunction(spec, animated || spec.kind === 'tangent');
}

export function svgToPptData(svg: string) {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `image/svg+xml;base64,${btoa(binary)}`;
}
