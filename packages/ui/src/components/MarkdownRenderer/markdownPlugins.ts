import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import 'katex/dist/katex.min.css';

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'callout',
    'ai',
    'teacher',
    'confirm',
  ],
  attributes: {
    ...defaultSchema.attributes,
    callout: ['dataType', 'dataTitle', 'type', 'title', 'className'],
    ai: ['className'],
    teacher: ['className'],
    confirm: ['className'],
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
  },
};

export const markdownRemarkPlugins = [remarkGfm, remarkMath];
export const markdownRehypePlugins = [
  rehypeRaw,
  [rehypeSanitize, sanitizeSchema],
  rehypeKatex,
] as any[];
