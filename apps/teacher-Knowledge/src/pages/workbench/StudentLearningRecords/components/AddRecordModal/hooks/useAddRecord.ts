// hooks/useAddRecord.ts
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import type { AddRecordFormData, LessonPlanOption } from '../types';
import { initialFormData } from '../constants';
import { learningService, processingService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

export const useAddRecord = (studentId?: string, onCreated?: () => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AddRecordFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanOption[]>([]);

  useEffect(() => {
    processingService
      .getList({ page: 1, page_size: 50 })
      .then((response) => {
        const payload = extractPayload<{ items?: any[] }>(response);
        setLessonPlans(
          (payload?.items || []).map((item) => ({
            id: item.id,
            title: item.topic || item.title || '未命名教案',
            subject: item.subject || '',
          })),
        );
      })
      .catch(() => setLessonPlans([]));
  }, []);

  // 更新表单数据
  const updateFormData = useCallback((data: Partial<AddRecordFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setSubmitted(false);
  }, []);

  // 下一步
  const nextStep = useCallback(() => {
    // 步骤1验证
    if (currentStep === 0) {
      const hasLessonPlan = !!formData.selectedLessonPlan;
      const hasUploadedFiles = formData.uploadedFiles.length > 0;
      const hasTitle = formData.documentTitle.trim();

      if (!hasLessonPlan && !(hasUploadedFiles && hasTitle)) {
        message.warning('请选择已有教案或上传新文档并填写标题');
        return;
      }
      setCurrentStep(1);
      return;
    }

    // 步骤2验证
    if (currentStep === 1) {
      if (formData.exerciseType === 'upload') {
        if (formData.exerciseFiles.length === 0) {
          message.warning('请上传练习题文件');
          return;
        }
      } else {
        if (!formData.aiPrompt.trim()) {
          message.warning('请输入AI生成指令');
          return;
        }
        if (!formData.aiGeneratedContent) {
          message.warning('请先点击AI生成按钮生成内容');
          return;
        }
      }
      // 提交
      handleSubmit();
    }
  }, [currentStep, formData]);

  // 上一步
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // 提交
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const selectedPlan = lessonPlans.find(p => p.id === formData.selectedLessonPlan);
      if (!studentId) {
        message.error('缺少学生信息');
        return;
      }
      await learningService.create({
        student_id: studentId,
        lesson_plan_id: formData.selectedLessonPlan || `lp-${Date.now()}`,
        assignment_title: selectedPlan?.title || formData.documentTitle || '课堂练习',
        common_questions: [],
      });
      setSubmitted(true);
      message.success('学习记录已创建');
      onCreated?.();
      
      setTimeout(() => {
        setSubmitted(false);
        resetForm();
        // 这里可以调用外部的 onSubmit
      }, 1500);
    } catch (error) {
      message.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [formData, lessonPlans, resetForm, studentId, onCreated]);

  // AI生成模拟
  const handleAIGenerate = useCallback(() => {
    if (!formData.aiPrompt.trim()) {
      message.warning('请输入生成指令');
      return;
    }

    updateFormData({ aiGenerating: true, aiProgress: 0 });
    
    const interval = setInterval(() => {
      setFormData(prev => {
        const newProgress = prev.aiProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            aiGenerating: false,
            aiProgress: 100,
            aiGeneratedContent: `# 练习题\n\n基于「${prev.aiPrompt}」生成以下练习：\n\n## 基础题（共40分）\n1. 求函数 y = x² 在 x = 1 处的导数\n2. 求曲线 y = 2x + 1 在点 (0, 1) 处的切线方程\n\n## 拓展题（共30分）\n3. 已知 f'(x) = 2x，且 f(0) = 1，求 f(x)\n4. 求曲线 y = eˣ 在点 (0, 1) 处的切线方程`,
          };
        }
        return { ...prev, aiProgress: newProgress };
      });
    }, 300);
  }, [formData.aiPrompt, updateFormData]);

  return {
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
    setCurrentStep,
  };
};