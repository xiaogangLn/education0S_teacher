// index.tsx - 主页面
import React from 'react';
import { Spin, Alert, Empty, Button } from 'antd';
import { useExamDetail } from './hooks/useExamDetail';
import { ExamHeader } from './components/ExamHeader';
import { ExamInfo } from './components/ExamInfo';
import { ExamActions } from './components/ExamActions';
import { ExamContent } from './components/ExamContent';
import { ExamStatus } from './components/ExamStatus';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ExamDetailPageProps {
  examId?: string;
  onBack?: () => void;
  showAnswer?: boolean;
}

export const ExamDetailPage: React.FC<ExamDetailPageProps> = ({
  examId: examIdProp,
  onBack,
  showAnswer = false,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = examIdProp || searchParams.get('id') || '';
  const {
    loading,
    exam,
    error,
    downloadExam,
    previewExam,
    shareExam,
    getStatusBadge,
    reload,
  } = useExamDetail(examId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载试卷详情..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={reload}>
            重试
          </Button>
        }
      />
    );
  }

  if (!exam) {
    return <Empty description="未找到试卷" />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <ExamHeader exam={exam} onBack={onBack || (() => navigate(-1))} />

      {/* 试卷信息 */}
      <ExamInfo exam={exam} />

      {/* 操作按钮 */}
      <ExamActions
        onDownload={downloadExam}
        onPreview={previewExam}
        onShare={shareExam}
        loading={loading}
      />

      {/* 状态卡片 */}
      <ExamStatus exam={exam} />

      <div className='flex-1 min-h-0 overflow-y-auto'>
        {/* 试卷内容 */}
        <ExamContent exam={exam} showAnswer={showAnswer} />
      </div>

      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100 mt-4">
        EducationOS V8.0 · 试卷详情 · 版本 v{exam.version}
      </div>
    </div>
  );
};

export default ExamDetailPage;