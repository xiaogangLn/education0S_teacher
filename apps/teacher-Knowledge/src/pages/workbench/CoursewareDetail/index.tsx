// index.tsx - 主页面
import React from 'react';
import { Spin, Alert, Empty, Button } from 'antd';
import { useCoursewareDetail } from './hooks/useCoursewareDetail';
import { CoursewareHeader } from './components/CoursewareHeader';
import { CoursewareInfo } from './components/CoursewareInfo';
import { CoursewareActions } from './components/CoursewareActions';
import { CoursewarePreview } from './components/CoursewarePreview';
import { AIAnnotation } from './components/AIAnnotation';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface CoursewareDetailPageProps {
  coursewareId?: string;
  onBack?: () => void;
}

export const CoursewareDetailPage: React.FC<CoursewareDetailPageProps> = ({
  coursewareId: coursewareIdProp,
  onBack,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const coursewareId = coursewareIdProp || searchParams.get('id') || '';
  const {
    loading,
    courseware,
    error,
    expanded,
    displaySlides,
    toggleExpand,
    downloadCourseware,
    previewCourseware,
    shareCourseware,
    reload,
  } = useCoursewareDetail(coursewareId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载课件详情..." />
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

  if (!courseware) {
    return <Empty description="未找到课件" />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <CoursewareHeader courseware={courseware} onBack={onBack || (() => navigate(-1))} />

      {/* 课件信息 */}
      <CoursewareInfo courseware={courseware} />

      {/* 操作按钮 */}
      <CoursewareActions
        onDownload={downloadCourseware}
        onPreview={previewCourseware}
        onShare={shareCourseware}
        loading={loading}
      />

      <div className='flex-1 min-h-0 overflow-y-auto'>
        {/* 课件预览 */}
        <CoursewarePreview
            slides={displaySlides}
            totalPages={courseware.totalPages}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            onSlideClick={(slide) => {
            console.log('点击幻灯片:', slide);
            }}
        />

        {/* AI生成标注 */}
        <AIAnnotation
            isAIGenerated={courseware.isAIGenerated}
            prompt={courseware.aiPrompt}
        />
      </div>

      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100 mt-4">
        EducationOS V8.0 · 课件详情 · 版本 v{courseware.version}
      </div>
    </div>
  );
};

export default CoursewareDetailPage;