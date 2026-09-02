// packages/ui/src/components/MarkdownRenderer/hooks/useStepRenderer.ts
import { useState, useCallback, useEffect } from 'react';
import { StepData } from '../types';

export const useStepRenderer = (initialSteps: StepData[]) => {
  const [steps, setSteps] = useState<StepData[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = steps[currentStepIndex] || null;

  // 更新步骤状态
  const updateStepStatus = useCallback((index: number, status: StepData['status']) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, status } : step
      )
    );
  }, []);

  // 标记当前步骤为完成
  const completeCurrentStep = useCallback(() => {
    if (currentStep) {
      updateStepStatus(currentStepIndex, 'completed');
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsComplete(true);
      }
    }
  }, [currentStep, currentStepIndex, steps.length, updateStepStatus]);

  // 跳转到指定步骤
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  // 重置所有步骤
  const resetSteps = useCallback(() => {
    setSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending' as const }))
    );
    setCurrentStepIndex(0);
    setIsComplete(false);
  }, []);

  // 获取步骤状态统计
  const getStats = useCallback(() => {
    const total = steps.length;
    const completed = steps.filter((s) => s.status === 'completed').length;
    const processing = steps.filter((s) => s.status === 'processing').length;
    const pending = steps.filter((s) => s.status === 'pending').length;
    return { total, completed, processing, pending, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [steps]);

  return {
    steps,
    currentStep,
    currentStepIndex,
    isComplete,
    updateStepStatus,
    completeCurrentStep,
    goToStep,
    resetSteps,
    getStats,
  };
};