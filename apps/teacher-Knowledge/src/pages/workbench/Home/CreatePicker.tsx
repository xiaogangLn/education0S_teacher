import React from 'react';

export type GenerateType = 'lesson_plan' | 'courseware' | 'exam';

interface CreatePickerProps {
  onSelectGenerate: (type: GenerateType) => void;
  onResearch: () => void;
  onLibrary: () => void;
}

const OPTIONS: Array<{
  type: GenerateType;
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'lesson_plan',
    title: '教案',
    desc: '结构化 · 单元设计',
    icon: (
      <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
        <rect x="12" y="8" width="26" height="34" rx="3" fill="#F4F7FB" stroke="#D5DEE8" />
        <rect x="16" y="14" width="18" height="2" rx="1" fill="#C5D0DC" />
        <rect x="16" y="20" width="14" height="2" rx="1" fill="#C5D0DC" />
        <rect x="16" y="26" width="16" height="2" rx="1" fill="#C5D0DC" />
        <path d="M30 34l12-16 5 4-12 16-6 2 1-6z" fill="#F5C542" stroke="#E2A80D" strokeLinejoin="round" />
        <path d="M33 31l5 4" stroke="#C48A0A" />
      </svg>
    ),
  },
  {
    type: 'courseware',
    title: '课件',
    desc: '动态 · 视觉素材',
    icon: (
      <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
        <rect x="10" y="32" width="10" height="14" rx="2" fill="#4C8DFF" />
        <rect x="23" y="18" width="10" height="28" rx="2" fill="#F26B6B" />
        <rect x="36" y="24" width="10" height="22" rx="2" fill="#3CB371" />
      </svg>
    ),
  },
  {
    type: 'exam',
    title: '试卷',
    desc: '题库 · 分层练习',
    icon: (
      <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
        <rect x="16" y="10" width="24" height="32" rx="3" fill="#F7F9FC" stroke="#D5DEE8" />
        <rect x="20" y="6" width="16" height="8" rx="2" fill="#EEF2F6" stroke="#D5DEE8" />
        <rect x="21" y="22" width="14" height="2" rx="1" fill="#C5D0DC" />
        <rect x="21" y="28" width="10" height="2" rx="1" fill="#C5D0DC" />
        <rect x="21" y="34" width="12" height="2" rx="1" fill="#C5D0DC" />
      </svg>
    ),
  },
];

export const CreatePicker: React.FC<CreatePickerProps> = ({
  onSelectGenerate,
  onResearch,
  onLibrary,
}) => {
  return (
    <div className="flex h-full flex-col px-3 py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF4D6] text-[9px]">
          ✦
        </span>
        <h3 className="text-[12px] font-semibold tracking-wide text-[#243047]">
          生成教案 · 课件 · 试卷
        </h3>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
        {OPTIONS.map((item) => (
          <button
            key={item.type}
            type="button"
            className="flex flex-col items-center justify-center rounded-lg border border-[#e8edf3] bg-white px-1 py-1 text-center transition hover:border-[#c9d6e6] hover:shadow-sm"
            onClick={() => onSelectGenerate(item.type)}
          >
            {item.icon}
            <div className="mt-0.5 text-[12px] font-semibold text-[#243047]">{item.title}</div>
            <div className="text-[9px] leading-tight text-[#8b96a8]">{item.desc}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-[#e8edf3] bg-[#f7f9fc] px-2 py-1 text-left transition hover:border-[#c9d6e6] hover:bg-white"
        onClick={onResearch}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#6b778c] shadow-sm">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#6b778c" strokeWidth="1.8" />
              <path d="M13.5 13.5L17 17" stroke="#6b778c" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold leading-none text-[#243047]">查资料</div>
            <div className="mt-0.5 text-[9px] leading-none text-[#8b96a8]">学术 · 素材 · 参考</div>
          </div>
        </div>
        <span
          className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#e8edf3] bg-white px-1.5 py-0.5 text-[10px] text-[#5b6576]"
          onClick={(event) => {
            event.stopPropagation();
            onLibrary();
          }}
        >
          <svg width="12" height="10" viewBox="0 0 18 16" fill="none">
            <rect x="1" y="3" width="4" height="12" rx="1" fill="#5B8DEF" />
            <rect x="6" y="1" width="5" height="14" rx="1" fill="#F26B6B" />
            <rect x="12" y="4" width="5" height="11" rx="1" fill="#3CB371" />
          </svg>
          资源库
        </span>
      </button>

      <div className="pt-1 text-right text-[9px] text-[#9aa5b5]">✦ 智能备课 · 轻量重构</div>
    </div>
  );
};
