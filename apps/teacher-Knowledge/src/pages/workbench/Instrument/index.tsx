// pages/Instrument/index.tsx
import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Allotment } from 'allotment';
import { LeftPanel } from '@/components/leftCard';
import { RightPanel } from '@/components/rightCard';
import { CenterPanel } from '@/components/centerCard';
import { useTemplateSelection } from './hooks/useTemplateSelection';
import { useResearchChat } from './hooks/useResearchChat';
import type { TemplateType } from './types';
import 'allotment/dist/style.css';
import type { FileItem } from '@/components/leftCard/types';
import type { WorkbenchTemplate } from '@/components/rightCard/useSchoolTemplates';

export const Instrument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isResearch = searchParams.get('mode') === 'research';
  const research = useResearchChat();
  const {
    selectedTemplate,
    selectedTemplateMeta,
    steps,
    currentStepIndex,
    hasSteps,
    isStreaming,
    isInitialized,
    sessionStarted,
    loading,
    progress,
    chatMessages,
    historyMaterials,
    currentTaskId,
    topic,
    examSpec,
    examSubject,
    examSpecOpen,
    examTypeCatalog,
    examPaperMarkdown,
    examAnswerMarkdown,
    setExamSpecOpen,
    setExamSpec,
    exportMarkdown,
    selectTemplate,
    sendMessage,
    confirmStep,
    confirmExamSpec,
    regenerateStep,
  } = useTemplateSelection();

  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  const handleSelectTemplate = (template: TemplateType, meta?: WorkbenchTemplate) => {
    if (sessionStarted) return;
    selectTemplate(template, meta);
  };

  const handleSelectedFiles = useCallback((files: FileItem[]) => {
    setSelectedFiles((prev) => {
      if (prev.length === files.length && prev.every((item, index) => item.id === files[index]?.id)) {
        return prev;
      }
      return files;
    });
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    return sendMessage(text, {
      template: selectedTemplateMeta,
      materials: selectedFiles,
    });
  }, [sendMessage, selectedTemplateMeta, selectedFiles]);

  if (isResearch) {
    return (
      <div className="overflow-hidden flex flex-col rounded-[16px] -mt-4" style={{ height: 'calc(100vh - 120px)' }}>
        <CenterPanel
          variant="research"
          sessionStarted
          isInitialized
          loading={research.loading}
          chatMessages={research.chatMessages}
          savingToKnowledge={research.saving}
          onSendMessage={research.sendMessage}
          onSaveToKnowledge={research.saveToKnowledge}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex flex-col rounded-[16px] -mt-4" style={{ height: 'calc(100vh - 120px)' }}>
      <Allotment className="flex-1">
        <Allotment.Pane minSize={400} preferredSize="18%" snap>
          <LeftPanel
            onFileClick={() => undefined}
            onSelectedFiles={handleSelectedFiles}
            initialPlannedFiles={historyMaterials}
            historyMode={sessionStarted}
          />
        </Allotment.Pane>

        <Allotment.Pane minSize={700} preferredSize="70%" snap>
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
            selectedTemplateTitle={selectedTemplateMeta?.title || selectedTemplate}
            chatMessages={chatMessages}
            examSpec={examSpec}
            examSubject={examSubject}
            examTypeCatalog={examTypeCatalog}
            examSpecOpen={examSpecOpen}
            onExamSpecChange={setExamSpec}
            onExamSpecSubmit={confirmExamSpec}
            onExamSpecOpenChange={setExamSpecOpen}
            onConfirmStep={confirmStep}
            onRegenerateStep={regenerateStep}
            onSendMessage={handleSendMessage}
          />
        </Allotment.Pane>

        <Allotment.Pane minSize={400} preferredSize="18%" snap>
          <RightPanel
            selectedTemplate={selectedTemplate as any}
            selectedTemplateMeta={selectedTemplateMeta}
            onSelectTemplate={handleSelectTemplate}
            currentTaskId={currentTaskId}
            recordTitle={topic}
            recordMarkdown={selectedTemplate === '试卷模板' ? examPaperMarkdown : exportMarkdown}
            answerMarkdown={selectedTemplate === '试卷模板' ? examAnswerMarkdown : ''}
            hideTemplates={sessionStarted && selectedTemplate === '试卷模板'}
            onOptimize={(text) => { void handleSendMessage(text); }}
            optimizeMode={
              steps.length > 0 && (steps.every((step) => step.status === 'completed') || steps[currentStepIndex]?.type === 'refine')
                ? 'final'
                : 'stage'
            }
            optimizeStageTitle={steps[currentStepIndex]?.title}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default Instrument;
