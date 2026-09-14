// index.tsx - 主页面
import React, { useState } from 'react';
import { Button, Tabs, Tag, message } from 'antd';
import { useLearningRecords } from './hooks/useLearningRecords';
import { useGradeRecords } from './hooks/useGradeRecords';
import { useRecordDetail } from './hooks/useRecordDetail';
import { StudentHeader } from './components/StudentHeader';
import { RecordStats } from './components/RecordStats';
import { RecordList } from './components/RecordList';
import { RecordDetail } from './components/RecordDetail';
import { GradeStats } from './components/GradeStats';
import { GradeUploadModal } from './components/GradeUploadForm';
import { GradeList } from './components/GradeList';
import type { GradeRecord, LearningRecord } from './types';
import AddRecordModal from './components/AddRecordModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useEffect } from 'react';

export const StudentLearningRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'grades'>('records');
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('id') || undefined;
  const [studentMeta, setStudentMeta] = useState({ name: '', className: '', studentNo: '', grade: '' });

  useEffect(() => {
    if (!studentId) return;
    studentsService.getDetail(studentId).then((res) => {
      const payload = extractPayload<{ student: any }>(res);
      const student = payload?.student || payload;
      setStudentMeta({
        name: student?.name || '',
        className: student?.class_name || '',
        studentNo: student?.student_no || '',
        grade: student?.grade_name || '',
      });
    }).catch(() => undefined);
  }, [studentId]);

  const { records, stats, loading: recordsLoading, refresh } = useLearningRecords(studentId);
  const {
    mode,
    selectedRecord,
    detailVisible,
    loading: detailLoading,
    isAddHistory,
    setIsAddHistory,
    openDetail,
    openSubmit,
    openGrade,
    openImages,
    closeDetail,
    confirmGrading,
    submitHomework,
  } = useRecordDetail();

  // 成绩记录
  const {
    grades,
    stats: gradeStats,
    loading: gradesLoading,
    formVisible,
    formData,
    setFormData,
    setFormVisible,
    submitGrade,
  } = useGradeRecords(studentId, undefined);
  const navigate = useNavigate();

  const handleViewImages = (record: LearningRecord) => {
    openImages(record);
  };

  const handleGrade = (record: LearningRecord) => {
    openGrade(record);
  };

  const handleSubmitHomework = async (recordId: string, data: { images: string[]; comment: string; rating: number }) => {
    const ok = await submitHomework(recordId, data);
    if (ok) {
      message.success('作业已提交');
      closeDetail();
      refresh();
    } else {
      message.error('提交失败，请稍后重试');
    }
  };

  const handleConfirmGrade = async (recordId: string, data: { score: number; feedback: string }) => {
    const ok = await confirmGrading(recordId, data);
    if (ok) {
      message.success('批改完成');
      closeDetail();
      refresh();
    } else {
      message.error('批改失败，请稍后重试');
    }
  };

  const handleSubmitGrade = async () => {
    if (!formData.name || !formData.score) {
      message.warning('请填写完整信息');
      return;
    }
    const success = await submitGrade(formData);
    if (success) {
      message.success('成绩上传成功');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 学生头部 */}
      <StudentHeader
        name={studentMeta.name || '学生'}
        className={studentMeta.className}
        studentNo={studentMeta.studentNo}
        grade={studentMeta.grade}
        status="active"
        onViewPortrait={() => navigate(`/workbench/studentPortrait?id=${studentId}`)}
        onAddRecord={() => setIsAddHistory(true)}
      />

      {/* Tab 切换 */}
      <Tabs
        activeKey={activeTab}
        className='flex-shrink-0'
        onChange={(key) => setActiveTab(key as 'records' | 'grades')}
        items={[
          { key: 'records', label: '📋 学习记录' },
          { key: 'grades', label: '📊 成绩记录' },
        ]}
      />

      {/* 学习记录 Tab */}
      {activeTab === 'records' && (
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <RecordStats total={stats.total} graded={stats.graded} pending={stats.pending} />
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <RecordList
                records={records}
                loading={recordsLoading}
                onViewDetail={openDetail}
                onViewImages={handleViewImages}
                onGrade={handleGrade} 
                onSubmit={openSubmit}
             />
          </div>
        </div>
      )}

      {/* 成绩记录 Tab */}
      {activeTab === 'grades' && (
        <div className='flex-1 min-h-0 overflow-y-auto'>
            <GradeStats
                total={gradeStats.total}
                average={gradeStats.average}
                improvement={gradeStats.improvement}
                uploadedImages={gradeStats.uploadedImages}
            />

            <GradeUploadModal
                open={formVisible}
                loading={gradesLoading}
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleSubmitGrade}
                onCancel={() => {
                setFormVisible(false);
                setFormData({
                    name: '',
                    score: '',
                    subject: '数学',
                    date: new Date().toISOString().slice(0, 10),
                    images: [],
                });
                }}
            />

            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">📋 成绩记录</span>
                <div className="flex gap-2">
                    <Tag color="default">共 {grades.length} 条</Tag>
                    <Button
                    type="primary"
                    size="small"
                    className="rounded-full"
                    onClick={() => setFormVisible(!formVisible)}
                    >
                    上传成绩
                    </Button>
                </div>
                </div>
                <GradeList grades={grades} loading={gradesLoading} handleSee={(props: GradeRecord) =>  setFormVisible(true)}  />
            </div>
        </div>
      )}

      {/* 记录详情弹窗 */}
      <RecordDetail
        mode={mode}
        open={detailVisible}
        record={selectedRecord}
        studentId={studentId}
        loading={detailLoading}
        onClose={closeDetail}
        onSubmit={handleSubmitHomework}
        onGrade={handleConfirmGrade}
      />
      <AddRecordModal 
        open={isAddHistory} 
        onClose={() => setIsAddHistory(false)}
        studentId={studentId}
        onSubmit={() => refresh()}
        />

      {/* 底部 */}
      <div className="flex-shrink-0 text-center text-xs text-gray-400 pt-4 border-t border-gray-100 mt-4">
        EducationOS V8.0 · 学生学习记录
      </div>
    </div>
  );
};

export default StudentLearningRecordsPage;