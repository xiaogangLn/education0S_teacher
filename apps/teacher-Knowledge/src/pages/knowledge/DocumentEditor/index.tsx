// index.tsx - 主页面更新
import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useDocumentEditor } from './hooks/useDocumentEditor';
import { useDocumentSave } from './hooks/useDocumentSave';
import { useDocumentPermission } from './hooks/useDocumentPermission';
import { useDocumentCollaboration } from './hooks/useDocumentCollaboration';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorContent } from './components/EditorContent';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { VersionHistory } from './components/VersionHistory';
import { DEFAULT_DOCUMENT } from './constants';
import type { DocumentMetadata, PermissionType } from './types';
import { knowledgeService } from '@api/index';
import { extractPayload, formatDateTime, normalizePermission } from '@/utils/knowledgeMapper';
import { useAppSelector } from '@/store/hooks';
import { getUserDisplayName } from '@/utils/currentUser';

const fallbackHtml = `<h1>${DEFAULT_DOCUMENT.title}</h1><p></p>`;

const DocumentEditorInner: React.FC<{ metadata: DocumentMetadata; html: string }> = ({ metadata, html }) => {
  const [title, setTitle] = useState(metadata.title);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { isConnected, onlineUsers } = useDocumentCollaboration({
    documentId: metadata.id,
    userName: metadata.author,
    userColor: '#4f46e5',
    websocketUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:1234',
    enableLocalStorage: false,
    persistToApi: false,
  });

  return (
    <DocumentEditorBody
      metadata={metadata}
      html={html}
      title={title}
      setTitle={setTitle}
      showVersionHistory={showVersionHistory}
      setShowVersionHistory={setShowVersionHistory}
      isConnected={isConnected}
      onlineUsers={onlineUsers}
    />
  );
};

const DocumentEditorBody: React.FC<{
  metadata: DocumentMetadata;
  html: string;
  title: string;
  setTitle: (value: string) => void;
  showVersionHistory: boolean;
  setShowVersionHistory: (value: boolean) => void;
  isConnected: boolean;
  onlineUsers: Array<{ name: string }>;
}> = ({
  metadata,
  html,
  title,
  setTitle,
  showVersionHistory,
  setShowVersionHistory,
  isConnected,
  onlineUsers,
}) => {

  const {
    editor,
    wordCount,
    getContent,
    insertAIAnnotation,
    insertMathBlock,
  } = useDocumentEditor(
    html || `<h1>${metadata.title}</h1><p></p>`,
    metadata,
  );

  const { permission, changePermission } = useDocumentPermission(
    metadata.permission,
    metadata.id
  );

  const { isSaving, lastSavedAt, saveDocument } = useDocumentSave(
    metadata.id,
    metadata
  );

  const handleSave = async () => {
    if (!editor) return;
    const content = getContent();
    try {
      await saveDocument(content, {
        ...metadata,
        title,
        permission,
        updatedAt: new Date().toLocaleString('zh-CN'),
      });
      message.success('文档已保存');
    } catch {
      message.error('保存失败');
    }
  };

  const handleToolbarAction = (actionId: string) => {
    if (!editor) return;
    switch (actionId) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'heading':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'taskList':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'math':
        const latex = prompt('请输入 LaTeX 公式：', 'y = f(x)');
        if (latex) insertMathBlock(latex);
        break;
      case 'aiGenerate':
        insertAIAnnotation('根据当前内容，建议补充例题变式训练');
        break;
      default:
        break;
    }
  };

  const onlineUserNames = onlineUsers.map(u => u.name);

  return (
    <div className="bg-gray-50 rounded-2xl flex flex-col p-4 h-full">
        <DocumentHeader
            title={title}
            onTitleChange={setTitle}
            permission={permission}
            onPermissionChange={(next) => { void changePermission(next); }}
            metadata={{
                isSaving,
                isConnected,
                author: metadata.author,
                date: metadata.createdAt,
                source: metadata.source,
                difficulty: metadata.difficulty === 'medium' ? '中' : '易',
                knowledgePoints: metadata.knowledgePoints,
                permissionLabel: permission === 'school' ? '学校级' : permission === 'grade' ? '年级级' : permission === 'class' ? '班级级' : '个人级',
                permissionIcon: permission === 'school' ? '🏛️' : permission === 'grade' ? '📚' : permission === 'class' ? '🏫' : '👤',
            }}
            handleSave={handleSave}
        />

        <EditorToolbar className='mb-4 flex-shrink-0' onAction={handleToolbarAction} />

        <EditorContent editor={editor}  />

        <DocumentFooter
          wordCount={wordCount}
          knowledgePointCount={metadata.knowledgePoints.length}
          version={metadata.version}
          lastSavedAt={lastSavedAt}
          isSaving={isSaving}
          collaborators={onlineUserNames}
          onlineCount={onlineUserNames.length + 1}
        />
        <VersionHistory
            open={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            onRestore={(version) => {
                message.success(`已恢复到 v${version.version}`);
                setShowVersionHistory(false);
            } }
            versions={[]}
        />
    </div>
  );
};

const DocumentEditorPage: React.FC = () => {
  const [params] = useSearchParams();
  const docId = params.get('id');
  const currentUser = useAppSelector((state) => state.user.current);
  const [loading, setLoading] = useState(!!docId);
  const [html, setHtml] = useState(fallbackHtml);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    ...DEFAULT_DOCUMENT,
    id: docId || DEFAULT_DOCUMENT.id,
    author: getUserDisplayName(currentUser),
  });

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    knowledgeService.getDetail(docId).then((response) => {
      if (cancelled) return;
      const payload = extractPayload<{ document: any }>(response);
      const document = payload.document || payload;
      setMetadata({
        ...DEFAULT_DOCUMENT,
        id: document.id,
        title: document.title || DEFAULT_DOCUMENT.title,
        author: document.creator_name || getUserDisplayName(currentUser),
        createdAt: formatDateTime(document.created_at) || DEFAULT_DOCUMENT.createdAt,
        updatedAt: formatDateTime(document.updated_at) || DEFAULT_DOCUMENT.updatedAt,
        permission: normalizePermission(document.permission) as PermissionType,
        knowledgePoints: document.tags || DEFAULT_DOCUMENT.knowledgePoints,
        source: document.category || DEFAULT_DOCUMENT.source,
      });
      setHtml(document.content || `<h1>${document.title || ''}</h1><p></p>`);
    }).catch(() => {
      message.error('文档加载失败');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [docId, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return <DocumentEditorInner key={metadata.id} metadata={metadata} html={html} />;
};

export {
    DocumentEditorPage
};
