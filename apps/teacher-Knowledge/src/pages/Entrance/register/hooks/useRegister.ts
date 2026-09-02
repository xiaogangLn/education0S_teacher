// src/hooks/useRegister.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormData, RegisterHookReturn } from '../types';

const initialFormData: FormData = {
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  role: 'teacher',
  schoolName: '',
  grade: '',
  class: '',
  totpSecret: '',
  totpCode: '',
  agreeTerms: false,
};

export const useRegister = (): RegisterHookReturn => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [totpEnabled, setTotpEnabled] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const countdownTimerRef = useRef<any | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));

      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [formErrors]
  );

  const validateStep1 = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = '请输入账号';
    } else if (formData.username.length < 4) {
      errors.username = '账号至少4个字符';
    }

    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      errors.password = '密码至少8个字符';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致';
    }

    if (!formData.realName.trim()) {
      errors.realName = '请输入真实姓名';
    }

    if (!formData.phone.trim()) {
      errors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      errors.phone = '请输入正确的手机号';
    }

    if (!formData.schoolName) {
      errors.schoolName = '请选择学校';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = '请同意用户协议';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleNextStep = useCallback(() => {
    if (!validateStep1()) return;
    
    const secret = 'ABCDEFGHIJKLMNOP' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, totpSecret: secret }));
    setTotpEnabled(true);
    setCurrentStep(2);
  }, [validateStep1]);

  const handleRegister = useCallback(() => {
    if (!formData.totpCode || formData.totpCode.length < 6) {
      alert('请输入完整的验证码');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
    }, 1500);
  }, [formData.totpCode]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setTotpEnabled(false);
    setFormErrors({});
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, []);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    formErrors,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    totpEnabled,
    setTotpEnabled,
    canvasRef,
    handleInputChange,
    handleNextStep,
    handleRegister,
    handleReset,
  };
};