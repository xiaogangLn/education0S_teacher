// pages/Instrument/index.tsx
import React, { useCallback, useState } from 'react';
import { Allotment } from 'allotment';
import { LeftPanel } from '@/components/leftCard';
import { RightPanel } from '@/components/rightCard';
import { CenterPanel } from '@/components/centerCard';
import { useTemplateSelection } from './hooks/useTemplateSelection';
import type { TemplateType } from './types';
import 'allotment/dist/style.css';
import type { FileItem } from '@/components/leftCard/types';

export const Instrument: React.FC = () => {
  const {
    selectedTemplate,
    steps,
    currentStepIndex,
    hasSteps,
    isStreaming,
    isInitialized,
    sessionStarted,
    loading,
    progress,
    chatMessages,
    selectTemplate,
    sendMessage,
    confirmStep,
    reset,
  } = useTemplateSelection();
  
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  // 处理右侧面板选择模板
  const handleSelectTemplate = (template: TemplateType) => {
    selectTemplate(template);
  };

  // 处理左侧面板选择文件
  const handleSelectedFiles = useCallback((files: FileItem[]) => {
    setSelectedFiles((prev) => {
      if (prev.length === files.length && prev.every((f, i) => f.id === files[i]?.id)) {
        return prev;
      }
      return files;
    });
    console.log('选中的文件:', files);
  }, []);

  const handleFileClick = (file: FileItem) => {
    console.log('点击文件:', file);
  };

  return (
    <div className="overflow-hidden flex flex-col rounded-[16px] -mt-4" style={{ height: 'calc(100vh - 120px)' }}>
      <Allotment className="flex-1">
        <Allotment.Pane minSize={400} preferredSize="18%" snap>
          <LeftPanel 
            onFileSelect={(ids) => console.log('选中的文件ID:', ids)}
            onFileClick={handleFileClick}
            onSelectedFiles={handleSelectedFiles}
          />
        </Allotment.Pane>

        <Allotment.Pane minSize={1000} preferredSize="70%" snap>
          <CenterPanel
            steps={steps}
            currentStepIndex={currentStepIndex}
            hasSteps={hasSteps}
            isStreaming={isStreaming}
            isInitialized={isInitialized}
            sessionStarted={sessionStarted}
            loading={loading}
            progress={progress}
            selectedTemplate={selectedTemplate}
            chatMessages={chatMessages}
            onConfirmStep={confirmStep}
            onSendMessage={sendMessage}
          />
        </Allotment.Pane>

        <Allotment.Pane minSize={300} preferredSize="18%" snap>
          <RightPanel 
            selectedTemplate={selectedTemplate as any}
            onSelectTemplate={handleSelectTemplate}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default Instrument;