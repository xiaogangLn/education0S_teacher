// index.tsx - 优化 Steps 样式
import React from 'react';
import { Modal, Steps, Button, Spin } from 'antd';
import { StepSelectLesson } from './components/StepSelectLesson';
import { StepUploadExercise } from './components/StepUploadExercise';
import { useAddRecord } from './hooks/useAddRecord';
import type { AddRecordModalProps } from './types';
import { CheckOutlined } from '@ant-design/icons';

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  open,
  onClose,
  onSubmit,
  studentId,
  className = '',
}) => {
  const {
    currentStep,
    formData,
    loading,
    submitted,
    lessonPlans,
    updateFormData,
    nextStep,
    prevStep,
    resetForm,
    handleAIGenerate,
  } = useAddRecord(studentId, onSubmit);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      nextStep();
    } else {
      nextStep();
    }
  };

  const isStep1Valid = () => {
    const hasLessonPlan = !!formData.selectedLessonPlan;
    const hasUploadedFiles = formData.uploadedFiles.length > 0;
    const hasTitle = formData.documentTitle.trim();
    return hasLessonPlan || (hasUploadedFiles && hasTitle);
  };

  const isStep2Valid = () => {
    if (formData.exerciseType === 'upload') {
      return formData.exerciseFiles.length > 0;
    }
    return !!formData.aiGeneratedContent;
  };

  // 生成完成状态
  if (submitted) {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={560}
        centered
        className={className}
      >
        <div className="text-center py-8">
          <div className="text-6xl text-green-500 mb-4">✅</div>
          <div className="text-xl font-bold text-gray-800">生成完成！</div>
          <div className="text-gray-500 mt-2">已为全班 45 名学生生成学习记录</div>
          <div className="flex gap-3 justify-center mt-6">
            <Button className="rounded-full" onClick={handleClose}>
              📋 查看记录
            </Button>
            <Button type="primary" className="rounded-full" onClick={handleClose}>
              ✅ 确认
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div>
          <span className="text-lg font-bold">📝 添加学习记录</span>
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            两步流程
          </span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width="50%"
      centered
      className={className}
      destroyOnClose
    >
      <Spin spinning={loading} tip="生成中...">

        {/* ===== 简化步骤条 ===== */}
        <div className="flex items-center justify-center gap-2 mb-6 mt-4">
          {/* 步骤1 */}
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300
              ${currentStep >= 0 ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-gray-200 text-gray-400'}
              ${currentStep === 0 ? 'ring-4 ring-blue-100' : ''}
            `}>
              {currentStep > 0 ? <CheckOutlined className="text-xs" /> : '1'}
            </div>
            <span className={`ml-2 text-sm font-medium ${currentStep >= 0 ? 'text-gray-700' : 'text-gray-400'}`}>
              选择教案
            </span>
          </div>

          {/* 连接线 */}
          <div className="w-20 h-0.5 mx-1 relative">
            <div className="absolute inset-0 bg-gray-200 rounded-full" />
            <div 
              className={`absolute inset-0 bg-blue-400 rounded-full transition-all duration-500 ${
                currentStep > 0 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          {/* 步骤2 */}
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300
              ${currentStep >= 1 ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-gray-200 text-gray-400'}
              ${currentStep === 1 ? 'ring-4 ring-blue-100' : ''}
            `}>
              {currentStep > 1 ? <CheckOutlined className="text-xs" /> : '2'}
            </div>
            <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-gray-700' : 'text-gray-400'}`}>
              上传练习题
            </span>
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="min-h-[320px]">
          {currentStep === 0 && (
            <StepSelectLesson
              formData={formData}
              onChange={updateFormData}
              lessonPlans={lessonPlans}
            />
          )}
          {currentStep === 1 && (
            <StepUploadExercise
              formData={formData}
              onChange={updateFormData}
              onAIGenerate={handleAIGenerate}
              aiGenerating={formData.aiGenerating}
            />
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-400">
            {currentStep === 0
              ? `📚 将为全班 45 名学生生成记录`
              : `📌 关联：${
                  formData.selectedLessonPlan
                    ? lessonPlans.find(p => p.id === formData.selectedLessonPlan)?.title
                    : formData.documentTitle || '新文档'
                }`}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                onClick={prevStep} 
                className="rounded-full border-gray-200 hover:border-gray-300"
              >
                上一步
              </Button>
            )}
            <Button 
              onClick={handleClose} 
              className="rounded-full border-gray-200 hover:border-gray-300"
            >
              取消
            </Button>
            <Button
              type="primary"
              className="rounded-full px-6"
              onClick={handleNext}
              disabled={
                currentStep === 0
                  ? !isStep1Valid()
                  : currentStep === 1
                  ? !isStep2Valid()
                  : false
              }
            >
              {currentStep === 1 ? '🚀 生成记录' : '下一步 →'}
            </Button>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default AddRecordModal;