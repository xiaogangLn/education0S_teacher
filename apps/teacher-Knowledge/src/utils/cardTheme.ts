// utils/cardTheme.ts
// 工作台卡片主题：按 item 的类型与学科确定性生成装饰背景（无任何随机）。
// 设计原则：贴合整体极简视觉——极淡主题色底 + 右下角低饱和线条图形，
// 不使用彩色 emoji / 重渐变，保证与 AntD + Tailwind 的克制的 SaaS 风格一致。

export type CardTheme = {
  /** 卡片底色（实色淡渐变，不叠透明度，避免与页面灰底融为一体） */
  gradient: string;
  /** 主题色细边框（带透明度，与卡片渐变底色叠合成上深下浅的过渡效果，不抢戏） */
  borderClass: string;
  /** 类型文字（教案/试卷/课件/查资料），卡片时间行上方展示 */
  label: string;
  /** 类型文字的主题色 class */
  accentTextClass: string;
  /** 主色 class（列表色条等小元素用） */
  accentClass: string;
  /** 右下角线条装饰（CSS background-image，data-uri SVG，no-repeat） */
  decor: string;
};

/** 类型主题：颜色 + 专属线条图形（右下角） */
const THEMES: Record<string, { gradient: string; borderClass: string; label: string; accentTextClass: string; accentClass: string; accentHex: string }> = {
  exam: { gradient: 'from-indigo-50 to-white', borderClass: 'border-indigo-200/50', label: '试卷', accentTextClass: 'text-indigo-500', accentClass: 'bg-indigo-400', accentHex: '%236366f1' },
  courseware: { gradient: 'from-violet-50 to-white', borderClass: 'border-violet-200/50', label: '课件', accentTextClass: 'text-violet-500', accentClass: 'bg-violet-400', accentHex: '%238b5cf6' },
  research: { gradient: 'from-emerald-50 to-white', borderClass: 'border-emerald-200/50', label: '查资料', accentTextClass: 'text-emerald-600', accentClass: 'bg-emerald-400', accentHex: '%2310b981' },
  lesson_plan: { gradient: 'from-amber-50 to-white', borderClass: 'border-amber-200/50', label: '教案', accentTextClass: 'text-amber-600', accentClass: 'bg-amber-400', accentHex: '%23f59e0b' },
};

/** 各类型专属装饰图形：统一 2px 线条、0.2~0.38 透明度（在近白底上清晰可辨又不抢眼） */
function decorSvg(type: string, hex: string): string {
  const open = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140' fill='none'%3E`;
  const close = `%3C/svg%3E`;
  let body = '';
  if (type === 'exam') {
    // 试卷：勾选框 + 选项线
    body = `%3Crect x='150' y='52' width='26' height='26' rx='6' stroke='${hex}' stroke-opacity='0.38' stroke-width='2'/%3E%3Cpath d='M156 65l6 6 11-12' stroke='${hex}' stroke-opacity='0.42' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M118 96h72M118 108h52' stroke='${hex}' stroke-opacity='0.24' stroke-width='2' stroke-linecap='round'/%3E`;
  } else if (type === 'courseware') {
    // 课件：播放圆环
    body = `%3Ccircle cx='168' cy='82' r='34' stroke='${hex}' stroke-opacity='0.32' stroke-width='2'/%3E%3Cpath d='M162 70l20 12-20 12z' stroke='${hex}' stroke-opacity='0.38' stroke-width='2' stroke-linejoin='round'/%3E`;
  } else if (type === 'research') {
    // 查资料：放大镜
    body = `%3Ccircle cx='162' cy='72' r='24' stroke='${hex}' stroke-opacity='0.34' stroke-width='2'/%3E%3Cpath d='M179 89l20 20' stroke='${hex}' stroke-opacity='0.4' stroke-width='2.5' stroke-linecap='round'/%3E`;
  } else {
    // 教案（默认）：笔记本横线 + 装订点
    body = `%3Cpath d='M120 58h78M120 76h78M120 94h58' stroke='${hex}' stroke-opacity='0.34' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='112' cy='58' r='2.5' fill='${hex}' fill-opacity='0.42'/%3E%3Ccircle cx='112' cy='76' r='2.5' fill='${hex}' fill-opacity='0.42'/%3E%3Ccircle cx='112' cy='94' r='2.5' fill='${hex}' fill-opacity='0.42'/%3E`;
  }
  return `url("data:image/svg+xml,${open}${body}${close}")`;
}

/** 按内容确定性取主题：同一记录始终同一装饰，无随机因素 */
export function getCardTheme(item: any): CardTheme {
  const type = String(item?.type || 'lesson_plan');
  const theme = THEMES[type] || THEMES.lesson_plan;
  return {
    gradient: theme.gradient,
    borderClass: theme.borderClass,
    label: theme.label,
    accentTextClass: theme.accentTextClass,
    accentClass: theme.accentClass,
    decor: decorSvg(type, theme.accentHex),
  };
}
