// extensions/MathBlock.ts
import { Node, type CommandProps } from '@tiptap/core';

export const MathBlockExtension = Node.create({
  name: 'mathBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex') || element.textContent,
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        'data-math-block': '',
        'data-latex': node.attrs.latex,
        class: 'math-block bg-gray-50 p-4 rounded-lg text-center text-lg font-semibold my-2',
      },
      node.attrs.latex,
    ];
  },

  addCommands() {
    return {
      insertMathBlock: (latex: string) => ({ chain }: CommandProps) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { latex },
          })
          .run();
      },
    } as any;
  },
});