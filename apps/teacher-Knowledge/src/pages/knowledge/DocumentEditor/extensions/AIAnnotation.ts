// extensions/AIAnnotation.ts - 简化版本
import { Extension } from '@tiptap/core';

export const AIAnnotationExtension = Extension.create({
  name: 'aiAnnotation',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          'data-ai-annotation': {
            default: null,
            parseHTML: element => element.getAttribute('data-ai-annotation'),
            renderHTML: attributes => {
              if (attributes['data-ai-annotation'] === 'true') {
                return { 'data-ai-annotation': 'true' };
              }
              return {};
            },
          },
        },
      },
    ];
  },

  addPasteRules() {
    return [
      {
        find: /🤖 AI生成：(.+)/g,
        handler: ({ match, chain }) => {
          const text = match[1];
          chain()
            .insertContent({
              type: 'paragraph',
              attrs: { 'data-ai-annotation': 'true' },
              content: [
                {
                  type: 'text',
                  text: `🤖 AI生成：${text}`,
                  marks: [{ type: 'italic' }],
                },
              ],
            })
            .run();
        },
      },
    ];
  },
});