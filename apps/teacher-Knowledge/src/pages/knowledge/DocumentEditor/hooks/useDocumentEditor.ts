import { useState, useCallback } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import type { DocumentMetadata, DocumentContent, OutlineItem } from '../types';
import { AIAnnotationExtension } from '../extensions/AIAnnotation';
import { MathBlockExtension } from '../extensions/MathBlock';
import { Markdown } from '@tiptap/markdown';

export const useDocumentEditor = (
  initialContent: string,
  metadata: DocumentMetadata,
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown,
      Placeholder.configure({
        placeholder: "输入 '/' 快速插入块，或开始编写...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TaskList,
      TaskItem,
      AIAnnotationExtension,
      MathBlockExtension,
    ],
    content: initialContent || '<p></p>',
    contentType: initialContent ? 'markdown' : undefined,
    editorProps: {
      attributes: {
        class: 'outline-none text-gray-800 leading-relaxed min-h-[500px]',
      },
    },
    onUpdate: ({ editor: instance }) => {
      const text = instance.getText();
      const words = text.trim() ? text.split(/\s+/).length : 0;
      setWordCount(words);
      updateOutline(instance);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const updateOutline = useCallback((instance: Editor) => {
    const items: OutlineItem[] = [];
    const json = instance.getJSON();
    if (json.content) {
      traverseNodes(json.content, items);
    }
    setOutline(items);
  }, []);

  const traverseNodes = (nodes: any[], items: OutlineItem[]) => {
    nodes.forEach((node, index) => {
      if (node.type === 'heading') {
        const level = node.attrs.level as 1 | 2 | 3;
        const text = node.content?.[0]?.text || `标题 ${index + 1}`;
        items.push({
          id: `heading-${items.length}`,
          level,
          text,
        });
      }
      if (node.content) {
        traverseNodes(node.content, items);
      }
    });
  };

  const getContent = useCallback((): DocumentContent => {
    if (!editor) {
      return { json: null, html: '', text: '', wordCount: 0, knowledgePointCount: 0 };
    }
    return {
      json: editor.getJSON(),
      html: editor.getHTML(),
      text: editor.getText(),
      wordCount,
      knowledgePointCount: metadata.knowledgePoints.length,
    };
  }, [editor, wordCount, metadata.knowledgePoints]);

  const insertAIAnnotation = useCallback((text: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'paragraph',
      attrs: { 'data-ai-annotation': 'true' },
      content: [{ type: 'text', text: `🤖 AI生成：${text}` }],
    }).run();
  }, [editor]);

  const insertMathBlock = useCallback((latex: string) => {
    if (!editor) return;
    (editor.commands as any).insertMathBlock(latex);
  }, [editor]);

  return {
    editor,
    isFocused,
    wordCount,
    outline,
    getContent,
    insertAIAnnotation,
    insertMathBlock,
  };
};
