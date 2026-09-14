import React, { useState, useEffect, useRef } from 'react';
import { PredictionHeader } from './components/PredictionHeader';
import { PredictionControls } from './components/PredictionControls';
import { PredictionProgress } from './components/PredictionProgress';
import { PredictionStepItem } from './components/PredictionStepItem';
import { PredictionEmptyState } from './components/PredictionEmptyState';
import { PredictionComplete } from './components/PredictionComplete';
import { useSSEPrediction } from './hooks/useSSEPrediction';
import { useOrgContext } from '@/hooks/useOrgContext';
import { Alert, Modal, message } from 'antd';
import { dashboardService, predictionService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { SUBJECT_OPTIONS } from './constants';

function cohortLabel(year?: string) {
  if (!year) return '未选择届别';
  const range = String(year).match(/^(\d{4})-(\d{4})$/);
  return range ? `${range[1]}届` : `${year}届`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export const TrendPredictionPage: React.FC = () => {
  const org = useOrgContext();
  const [subject, setSubject] = useState('数学');
  const [weeks, setWeeks] = useState(12);
  const [subjects, setSubjects] = useState<string[]>([...SUBJECT_OPTIONS]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const enrollmentYear = org.enrollmentYear || '';

  const { steps, isStreaming, progress, error, startPrediction, stopPrediction } = useSSEPrediction({
    grade: enrollmentYear,
    enrollment_year: enrollmentYear,
    subject,
    weeks,
  });

  const stepsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dashboardService.getTrend({ enrollment_year: enrollmentYear || undefined }).then((res) => {
      const payload = extractPayload<{ subjects?: string[] }>(res);
      const next = (payload?.subjects || []).filter(Boolean);
      if (next.length) {
        setSubjects(next);
        if (!next.includes(subject)) setSubject(next[0]);
      }
    }).catch(() => undefined);
  }, [enrollmentYear]);

  useEffect(() => {
    if (stepsEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = stepsEndRef.current;
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (targetRect.bottom > containerRect.bottom) {
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [steps]);

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const res = await predictionService.getReport({
        grade: enrollmentYear,
        subject,
        weeks: weeks as 4 | 8 | 12,
        enrollment_year: enrollmentYear,
      });
      const payload = extractPayload<any>(res);
      const summary = payload?.summary || payload?.data?.summary || {};
      const classes = Array.isArray(summary.classes)
        ? summary.classes.map((item: any) => `- ${item.class_name}：${item.avg_mastery}%（${item.student_count}人）`).join('\n')
        : '暂无班级';
      setReportText([
        `# ${summary.cohort_label || cohortLabel(enrollmentYear)} ${summary.subject || subject} 趋势报告`,
        '',
        `- 学生人数：${summary.student_count ?? 0}`,
        `- 当前掌握度：${summary.avg_mastery ?? '--'}%`,
        `- ${summary.weeks || weeks} 周后预估：${summary.forecast_mastery ?? '--'}%`,
        `- 优秀 / 薄弱：${summary.excellent_count ?? 0} / ${summary.weak_count ?? 0}`,
        `- 数据来源：${summary.source === 'model' ? '模型建议 + 学情统计' : '学情统计兜底'}`,
        '',
        '## 班级',
        classes,
        '',
        '## 预警',
        (summary.alerts || []).map((item: string) => `- ${item}`).join('\n') || '- 无',
        '',
        '## 建议',
        summary.advice || '暂无建议',
      ].join('\n'));
      return summary;
    } finally {
      setReportLoading(false);
    }
  };

  const handleViewReport = async () => {
    if (!enrollmentYear) {
      message.warning('请先在顶部选择「哪一届」');
      return;
    }
    await loadReport();
    setReportOpen(true);
  };

  const handleExport = async () => {
    if (!enrollmentYear) {
      message.warning('请先在顶部选择「哪一届」');
      return;
    }
    const summary = await loadReport();
    downloadJson(`趋势预测-${cohortLabel(enrollmentYear)}-${subject}.json`, summary);
    message.success('已导出预测报告');
  };

  return (
    <div className="m-w-auto h-screen flex flex-col">
      <div className="flex-shrink-0">
        <PredictionHeader />
      </div>

      <div className="flex-shrink-0 mt-4">
        <PredictionControls
          subject={subject}
          weeks={weeks}
          isStreaming={isStreaming}
          progress={progress}
          subjectOptions={subjects}
          onSubjectChange={setSubject}
          onWeeksChange={setWeeks}
          onStart={() => {
            if (!enrollmentYear) {
              message.warning('请先在顶部选择「哪一届」');
              return;
            }
            startPrediction();
          }}
          onStop={stopPrediction}
        />
      </div>

      {error && (
        <div className="flex-shrink-0 mt-3">
          <Alert type="error" showIcon message="预测失败" description={error} />
        </div>
      )}

      {isStreaming && (
        <div className="flex-shrink-0 mt-3">
          <PredictionProgress />
        </div>
      )}

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

      {steps.length > 0 && !isStreaming && (
        <div className="flex-shrink-0 mt-3">
          <PredictionComplete
            stepCount={steps.length}
            onViewReport={handleViewReport}
            onExport={handleExport}
          />
        </div>
      )}

      <Modal
        open={reportOpen}
        title={`${cohortLabel(enrollmentYear)} 完整预测报告`}
        onCancel={() => setReportOpen(false)}
        footer={null}
        width={720}
        confirmLoading={reportLoading}
      >
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
          {reportText || '暂无报告'}
        </pre>
      </Modal>

      <div className="flex-shrink-0 text-center text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
        EducationOS V8.0 · SSE 流式预测 · 配置有效模型 key 后自动生成建议
      </div>
    </div>
  );
};

export default TrendPredictionPage;
