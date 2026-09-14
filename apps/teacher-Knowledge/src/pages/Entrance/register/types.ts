// src/pages/Entrance/register/types.ts

export type RoleType = 'teacher' | 'student' | 'parent' | 'admin';

export interface FormData {
  password: string;
  confirmPassword: string;
  realName: string;
  phone: string;
  email: string;
  role: RoleType;
  schoolName: string;
  /** 任教学段：小学 / 初中 / 高中 */
  stage: string;
  /** 任教学科（可多选） */
  subjects: string[];
  grade: string;
  class: string;
  /** @deprecated 已改为邮箱确认，保留字段避免旧表单残留 */
  smsCode: string;
  agreeTerms: boolean;
}

export interface School {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  value: RoleType;
  label: string;
  desc: string;
}

export interface RegisterHookReturn {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formErrors: Record<string, string>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  /** @deprecated 短信倒计时已下线，恒为 0 */
  countdown: number;
  /** @deprecated 短信发送状态已下线 */
  sendingCode: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  toggleSubject: (subject: string) => void;
  handleNextStep: () => void;
  /** @deprecated 短信验证码已下线 */
  sendSmsCode: () => Promise<void>;
  handleRegister: () => void;
  handleReset: () => void;
}
