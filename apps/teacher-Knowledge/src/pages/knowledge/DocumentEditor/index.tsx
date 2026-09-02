// index.tsx - 主页面更新
import React, { useState } from 'react';
import { message } from 'antd';
import { useDocumentEditor } from './hooks/useDocumentEditor';
import { useDocumentSave } from './hooks/useDocumentSave';
import { useDocumentPermission } from './hooks/useDocumentPermission';
import { useDocumentCollaboration } from './hooks/useDocumentCollaboration';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorContent } from './components/EditorContent';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { PermissionDropdown } from './components/PermissionDropdown';
import { OutlineSidebar } from './components/OutlineSidebar';
import { VersionHistory } from './components/VersionHistory';
import { DEFAULT_DOCUMENT } from './constants';

const initialContent = `
<h1>导数的几何意义与切线方程</h1>
<p>本文档为教学教案，包含教学目标、重难点、教学过程、课堂小结和作业布置。</p>
<h2>一、教学目标</h2>
<p>1. 理解导数的几何意义——切线斜率</p>
<p>2. 掌握切线方程的求法（点斜式）</p>
<p>3. 体会极限思想在导数中的应用</p>
<h2>二、教学重难点</h2>
<p><strong>重点：</strong>导数几何意义的理解</p>
<p><strong>难点：</strong>极限思想的建立与切线方程的推导</p>
<h2>三、教学过程</h2>
<h3>1. 情境导入</h3>
<p>展示气温变化曲线，引导学生观察"陡峭程度"</p>
<p><strong>教师修改：</strong>调整为"赛车加速"情境，更贴近学生认知</p>
<h3>2. 平均变化率 → 瞬时变化率</h3>
<p>计算函数 f(x)=x² 在 x=1 附近的平均变化率</p>
<p>当 Δx→0 时，平均变化率趋近于 2，由此引入导数的定义</p>
<h3>3. 导数的几何意义</h3>
<p>导数 f'(x₀) 表示曲线 y=f(x) 在点 (x₀, f(x₀)) 处的切线斜率</p>
<p><strong>AI生成内容：</strong>切线是割线的极限位置</p>
<h2>四、课堂小结</h2>
<p>导数 = 切线斜率 · 切线方程 = 点斜式 · 极限思想是核心</p>
<h2>五、作业布置</h2>
<p>1. 完成课后练习题 1-4 题</p>
<p>2. 预习下一节：导数的运算</p>
`;

const DocumentEditorPage: React.FC = () => {
  const [title, setTitle] = useState(DEFAULT_DOCUMENT.title);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 协作 Hook
  const {
    isConnected,
    onlineUsers,
    getCollaborationExtensions,
    getCurrentUser,
    disconnect,
  } = useDocumentCollaboration({
    documentId: DEFAULT_DOCUMENT.id,
    userName: DEFAULT_DOCUMENT.author,
    userColor: '#4f46e5',
    websocketUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:1234',
  });

  // 编辑器 Hook - 传入协作扩展
  const { 
    editor, 
    wordCount, 
    outline, 
    getContent, 
    insertAIAnnotation,
    insertMathBlock,
  } = useDocumentEditor(
    initialContent,
    DEFAULT_DOCUMENT,
    getCollaborationExtensions() // 传入协作扩展
  );

  const { permission, changePermission } = useDocumentPermission(
    DEFAULT_DOCUMENT.permission
  );

  const { isSaving, lastSavedAt, saveDocument } = useDocumentSave(
    DEFAULT_DOCUMENT.id,
    DEFAULT_DOCUMENT
  );
  

  const handleSave = async () => {
    if (!editor) return;
    const content = getContent();
    await saveDocument(content, {
      ...DEFAULT_DOCUMENT,
      title,
      permission,
      updatedAt: new Date().toLocaleString('zh-CN'),
    });
    message.success('文档已保存');
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
        console.log('工具栏动作:', actionId);
    }
  };

  // 获取在线用户列表显示
  const onlineUserNames = onlineUsers.map(u => u.name);

  return (
    <div className="bg-gray-50 rounded-2xl flex flex-col p-4 h-full">
        {/* 编辑器主体 */}
        <DocumentHeader
            title={title}
            onTitleChange={setTitle}
            metadata={{
                isSaving,
                isConnected,
                author: DEFAULT_DOCUMENT.author,
                date: DEFAULT_DOCUMENT.createdAt,
                source: DEFAULT_DOCUMENT.source,
                difficulty: DEFAULT_DOCUMENT.difficulty === 'medium' ? '中' : '易',
                knowledgePoints: DEFAULT_DOCUMENT.knowledgePoints,
                permissionLabel: permission === 'school' ? '学校级' : permission === 'grade' ? '年级级' : permission === 'class' ? '班级级' : '个人级',
                permissionIcon: permission === 'school' ? '🏛️' : permission === 'grade' ? '📚' : permission === 'class' ? '🏫' : '👤',
            }}
            handleSave={handleSave}
        />

        <EditorToolbar className='mb-4 flex-shrink-0' onAction={handleToolbarAction} />

        <EditorContent editor={editor}  />

        <DocumentFooter
          wordCount={wordCount}
          knowledgePointCount={DEFAULT_DOCUMENT.knowledgePoints.length}
          version={DEFAULT_DOCUMENT.version}
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

export {
    DocumentEditorPage
};