import { MarkdownRenderer } from '@ui/components/MarkdownRenderer';
import { CoursewareVisual } from '@ui/components/MarkdownRenderer/CustomComponents';
import type { ExportFormat } from '@/utils/exportByTemplate';
import { cleanExportMarkdown, prepareCoursewareMarkdown } from '@/utils/exportByTemplate';
import { buildCoursewareSlides, type CoursewareBlock, type CoursewareSlide } from '@/utils/coursewareSlides';

function BlockList({ blocks }: { blocks: CoursewareBlock[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === 'visual') {
          return <CoursewareVisual key={index} spec={block.spec} compact />;
        }
        if (block.type === 'h3') {
          return <div key={index} className="text-lg font-semibold text-[#0F2C59]">{block.text}</div>;
        }
        if (block.type === 'p') {
          return <p key={index} className="text-[17px] leading-8 text-gray-800 m-0">{block.text}</p>;
        }
        if (block.type === 'ul' || block.type === 'ol') {
          const Tag = block.type === 'ol' ? 'ol' : 'ul';
          return (
            <Tag key={index} className={`${block.type === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 m-0 space-y-1.5 text-[17px] leading-8 text-gray-800`}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
            </Tag>
          );
        }
        return (
          <table key={index} className="w-full text-sm border-collapse">
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-[#0F2C59] text-white' : rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-slate-200 px-2 py-1.5 text-center">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}

function SlideView({ slide, index, total, topic }: { slide: CoursewareSlide; index: number; total: number; topic: string }) {
  if (slide.kind === 'cover' && index === 0) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#0A1F40] text-white shadow-lg">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#D4A017]" />
        <div className="flex h-full flex-col justify-center px-10 py-8">
          <div className="mb-3 text-xs tracking-[0.35em] text-[#D4A017]">教学课件</div>
          <h2 className="m-0 text-3xl font-bold leading-snug">{slide.title}</h2>
          <div className="mt-4 h-1 w-16 rounded bg-[#D4A017]" />
          {slide.blocks.length > 0 && (
            <div className="mt-5 space-y-1 text-sm text-slate-200">
              {slide.blocks.flatMap((block) => (
                block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : []
              )).slice(0, 3).map((line) => <div key={line}>{line}</div>)}
            </div>
          )}
          <div className="absolute bottom-4 left-10 text-xs text-slate-400">{topic} · EducationOS</div>
        </div>
      </div>
    );
  }

  const visuals = slide.blocks.filter((block) => block.type === 'visual');
  const rest = slide.blocks.filter((block) => block.type !== 'visual');
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#F6F8FC] shadow-lg">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[#D4A017]" />
      <div className={`${slide.subtitle ? 'h-[18%]' : 'h-[15%]'} bg-[#0F2C59] px-6 py-3 text-white`}>
        <div className="text-lg font-semibold leading-tight">{slide.title}</div>
        {slide.subtitle ? <div className="mt-1 text-xs text-[#F5E6B8]">{slide.subtitle}</div> : null}
      </div>
      <div className="h-[0.6%] bg-[#D4A017]" />
      <div className={`h-[76%] overflow-auto px-6 py-4 ${visuals.length ? 'flex gap-4' : ''}`}>
        <div className={visuals.length ? 'min-w-0 flex-1' : ''}>
          <BlockList blocks={visuals.length ? rest : slide.blocks} />
        </div>
        {visuals.length ? (
          <div className="w-[46%] flex-shrink-0">
            {visuals.slice(0, 2).map((block, index) => (
              block.type === 'visual' ? <CoursewareVisual key={index} spec={block.spec} compact /> : null
            ))}
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-0 left-0 flex h-[7%] w-full items-center justify-between bg-[#0F2C59] px-5 text-[11px] text-[#F5E6B8]">
        <span className="truncate">{topic}</span>
        <span className="text-white">{index + 1} / {total}</span>
      </div>
    </div>
  );
}

function PptPreview({ title, markdown }: { title: string; markdown: string }) {
  const slides = buildCoursewareSlides(title, prepareCoursewareMarkdown(markdown, title));
  return (
    <div className="space-y-4 rounded-xl bg-[#111827] p-4">
      <div className="text-xs text-slate-400">PPT 预览 · 共 {slides.length} 页 · 与导出文件版式一致</div>
      {slides.map((slide, index) => (
        <SlideView key={`${slide.title}-${index}`} slide={slide} index={index} total={slides.length} topic={title} />
      ))}
    </div>
  );
}

function DocPreview({ title, markdown }: { title: string; markdown: string }) {
  const content = cleanExportMarkdown(markdown, title);
  return (
    <div className="rounded-xl bg-[#e5e7eb] p-4">
      <div className="mb-3 text-xs text-gray-500">Word 预览 · .docx 版式 · 与导出文件接近</div>
      <div
        className="mx-auto min-h-[960px] w-full max-w-[794px] bg-white px-[68px] py-[72px] shadow-lg"
        style={{ fontFamily: "'Songti SC','SimSun',serif", fontSize: 16, lineHeight: 1.9, color: '#222' }}
      >
        <style>{`
          .word-preview h1 { font-family: 'Heiti SC','SimHei',sans-serif; font-size: 24px; text-align: center; margin: 0 0 18px; }
          .word-preview h2 { font-family: 'Heiti SC','SimHei',sans-serif; font-size: 18px; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d0d0d0; }
          .word-preview h3 { font-family: 'Heiti SC','SimHei',sans-serif; font-size: 17px; margin: 12px 0 6px; }
          .word-preview p { text-indent: 2em; margin: 0 0 8px; }
          .word-preview ul, .word-preview ol { padding-left: 1.6em; margin: 0 0 10px; }
          .word-preview li p { text-indent: 0; }
          .word-preview table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 15px; }
          .word-preview th, .word-preview td { border: 1px solid #444; padding: 6px 8px; }
          .word-preview th { background: #f3f4f6; font-family: 'Heiti SC','SimHei',sans-serif; }
        `}</style>
        <div className="word-preview prose max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}

export function ArtifactPreview({
  format,
  title,
  markdown,
}: {
  format: ExportFormat;
  title: string;
  markdown: string;
}) {
  if (format === 'ppt') return <PptPreview title={title} markdown={markdown} />;
  if (format === 'doc') return <DocPreview title={title} markdown={markdown} />;
  return (
    <div className="prose max-w-none text-[17px] leading-8">
      <MarkdownRenderer content={markdown || ''} />
    </div>
  );
}
