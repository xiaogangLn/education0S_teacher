import type { UploadFile } from "antd";

// types.ts
export interface AddRecordFormData {
    // 步骤1
    selectedLessonPlan: string;
    uploadedFiles: UploadFile[];
    documentTitle: string;
    
    // 步骤2
    exerciseType: 'upload' | 'ai';
    exerciseFiles: UploadFile[];
    aiPrompt: string;
    aiGeneratedContent: string;
    aiGenerating: boolean;
    aiProgress: number;
  }
  
  export interface LessonPlanOption {
    id: string;
    title: string;
    subject: string;
  }
  
  export interface AddRecordModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
    studentId?: string;
    className?: string;
  }
  
  export interface StepSelectLessonProps {
    formData: AddRecordFormData;
    onChange: (data: Partial<AddRecordFormData>) => void;
    lessonPlans: LessonPlanOption[];
  }
  
  export interface StepUploadExerciseProps {
    formData: AddRecordFormData;
    onChange: (data: Partial<AddRecordFormData>) => void;
    onAIGenerate: () => void;
    aiGenerating: boolean;
  }