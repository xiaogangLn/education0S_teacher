// components/EditorContent.tsx
import React from 'react';
import { EditorContent as TiptapEditorContent } from '@tiptap/react';
import { Spin, Empty } from 'antd';

interface EditorContentProps {
  editor: any;
  loading?: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({ editor, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载文档..." />
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="flex justify-center items-center h-64">
        <Empty description="编辑器加载失败" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-10 max-h-[500px] flex-1 overflow-y-auto">
      <TiptapEditorContent editor={editor}/>
    </div>
  );
};