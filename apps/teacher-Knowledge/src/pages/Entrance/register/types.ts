// src/components/Register/types.ts

export type RoleType = 'teacher' | 'student' | 'parent' | 'admin';

export interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  realName: string;
  phone: string;
  email: string;
  role: RoleType;
  schoolName: string;
  grade: string;
  class: string;
  totpSecret: string;
  totpCode: string;
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
  totpEnabled: boolean;
  setTotpEnabled: (enabled: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleNextStep: () => void;
  handleRegister: () => void;
  handleReset: () => void;
}