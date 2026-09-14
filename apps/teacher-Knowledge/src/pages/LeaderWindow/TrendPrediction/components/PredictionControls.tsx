import React from 'react';
import { Select, Button, Progress } from 'antd';
import { SUBJECT_OPTIONS, WEEK_OPTIONS } from '../constants';

interface PredictionControlsProps {
  subject: string;
  weeks: number;
  isStreaming: boolean;
  progress: number;
  subjectOptions?: string[];
  onSubjectChange: (value: string) => void;
  onWeeksChange: (value: number) => void;
  onStart: () => void;
  onStop: () => void;
}

export const PredictionControls: React.FC<PredictionControlsProps> = ({
  subject,
  weeks,
  isStreaming,
  progress,
  subjectOptions: subjectOptionList,
  onSubjectChange,
  onWeeksChange,
  onStart,
  onStop,
}) => {
  const subjectOptions = (subjectOptionList?.length ? subjectOptionList : [...SUBJECT_OPTIONS]).map((s) => ({ label: s, value: s }));
  const weekOptions = WEEK_OPTIONS.map((w) => ({ label: w.label, value: w.value }));

  return (
    <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3 overflow-y-auto">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">学科</span>
        <Select
          value={subject}
          onChange={onSubjectChange}
          options={subjectOptions}
          disabled={isStreaming}
          className="min-w-[100px]"
          size="middle"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">预测周期</span>
        <Select
          value={weeks}
          onChange={onWeeksChange}
          options={weekOptions}
          disabled={isStreaming}
          className="min-w-[120px]"
          size="middle"
        />
      </div>

      <div className="flex-1" />

      <Button
        type="primary"
        danger={isStreaming}
        onClick={isStreaming ? onStop : onStart}
        size="middle"
        className="rounded-full px-5"
      >
        {isStreaming ? '⏹ 停止预测' : '🚀 开始预测'}
      </Button>

      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Progress
            percent={Math.round(progress)}
            size="small"
            showInfo={false}
            className="w-24"
            strokeColor="#3b82f6"
          />
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};
