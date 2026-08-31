import React, { useState, useCallback, useRef } from 'react';

const RegisterHook = () => {
     // 步骤控制：1-填写信息，2-验证身份，3-注册成功
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // 表单数据
  const [formData, setFormData] = useState({
    // 基本信息
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    email: '',
    // 角色选择
    role: 'teacher' as 'teacher' | 'student' | 'parent' | 'admin',
    // 组织信息
    schoolName: '',
    grade: '',
    class: '',
    // 2FA
    totpSecret: '',
    totpCode: '',
    // 协议
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codeCountdown, setCodeCountdown] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // TOTP 相关
  const [totpEnabled, setTotpEnabled] = useState<boolean>(false);
  const [totpQRCode, setTotpQRCode] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==================== 表单处理 ====================
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      // 清除对应字段错误
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [formErrors]
  );

  // ==================== 表单验证 ====================
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

  // ==================== 步骤控制 ====================
  const handleNextStep = useCallback(() => {
    if (!validateStep1()) return;
    // 模拟生成 TOTP 密钥
    const secret = 'ABCDEFGHIJKLMNOP' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, totpSecret: secret }));
    setTotpEnabled(true);
    setCurrentStep(2);
  }, [validateStep1]);

  // ==================== 发送验证码 ====================
  const handleSendCode = useCallback(() => {
    if (codeCountdown > 0) return;
    if (!formData.phone) {
      alert('请先填写手机号');
      return;
    }
    alert('验证码已发送至您的手机');
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [codeCountdown, formData.phone]);

  // ==================== 注册提交 ====================
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

  // ==================== 重新开始 ====================
  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setFormData({
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
    });
    setTotpEnabled(false);
    setFormErrors({});
  }, []);



  return {
    handleReset,
    handleRegister,
    handleSendCode,
    handleNextStep,
    handleInputChange,
    currentStep,
    formData,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    totpEnabled,
    totpQRCode,
    setTotpQRCode,
    canvasRef,
    codeCountdown,
    setCurrentStep,
    setTotpEnabled,
    setFormData,
    formErrors
  }
}

export {
    RegisterHook
}