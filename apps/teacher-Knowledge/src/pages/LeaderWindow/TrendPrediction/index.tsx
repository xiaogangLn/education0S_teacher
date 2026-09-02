// index.tsx - 主页面
import React, { useState, useEffect, useRef } from 'react';
import { PredictionHeader } from './components/PredictionHeader';
import { PredictionControls } from './components/PredictionControls';
import { PredictionProgress } from './components/PredictionProgress';
import { PredictionStepItem } from './components/PredictionStepItem';
import { PredictionEmptyState } from './components/PredictionEmptyState';
import { PredictionComplete } from './components/PredictionComplete';
import { useSSEPrediction } from './hooks/useSSEPrediction'

export const TrendPredictionPage: React.FC = () => {
  const [grade, setGrade] = useState('九年级');
  const [subject, setSubject] = useState('数学');
  const [weeks, setWeeks] = useState(12);

  const { steps, isStreaming, progress, startPrediction, stopPrediction } = useSSEPrediction({
    grade,
    subject,
    weeks,
  });

  const stepsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新步骤
  useEffect(() => {
    if (stepsEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = stepsEndRef.current;
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // 如果目标在容器可视区域下方，滚动到目标位置
      if (targetRect.bottom > containerRect.bottom) {
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [steps]);

  const handleViewReport = () => {
    console.log('查看完整报告');
  };

  const handleExport = () => {
    console.log('导出数据');
  };

  return (
    <div className="m-w-auto h-screen flex flex-col">
      {/* 页面标题 - 固定不滚动 */}
      <div className="flex-shrink-0">
        <PredictionHeader />
      </div>

      {/* 控制面板 - 固定不滚动 */}
      <div className="flex-shrink-0 mt-4">
        <PredictionControls
          grade={grade}
          subject={subject}
          weeks={weeks}
          isStreaming={isStreaming}
          progress={progress}
          onGradeChange={setGrade}
          onSubjectChange={setSubject}
          onWeeksChange={setWeeks}
          onStart={startPrediction}
          onStop={stopPrediction}
        />
      </div>

      {/* 进度指示器 - 固定不滚动 */}
      {isStreaming && (
        <div className="flex-shrink-0 mt-3">
          <PredictionProgress />
        </div>
      )}

      {/* 预测结果列表 - Y轴可滚动 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 mt-3 space-y-3 pr-2"
        style={{ 
          scrollBehavior: 'smooth',
          maxHeight: 'calc(100vh - 420px)',
        }}
      >
        {steps.length === 0 && !isStreaming && (
          <div className="h-full flex items-center justify-center">
            <PredictionEmptyState />
          </div>
        )}

        {steps.map((step) => (
          <PredictionStepItem key={step.id} step={step} />
        ))}

        <div ref={stepsEndRef} />
      </div>

      {/* 完成状态 - 固定在底部 */}
      {steps.length > 0 && !isStreaming && (
        <div className="flex-shrink-0 mt-3">
          <PredictionComplete
            stepCount={steps.length}
            onViewReport={handleViewReport}
            onExport={handleExport}
          />
        </div>
      )}

      {/* 底部信息 - 固定在底部 */}
      <div className="flex-shrink-0 text-center text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
        EducationOS V8.0 · SSE 流式预测 · 数据每周日 03:00 自动更新
      </div>
    </div>
  );
};

export default TrendPredictionPage;