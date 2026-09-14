import { useState, useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';
import { authService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import type { ImageCaptchaValue } from '@/components/ImageCaptchaField';
import type { FormData, RegisterHookReturn } from '../types';

const initialFormData: FormData = {
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  role: 'teacher',
  schoolName: '',
  stage: '',
  subjects: [],
  grade: '',
  class: '',
  smsCode: '',
  agreeTerms: false,
};

/**
 * 能力：商业注册流程状态机（资料 → 邮箱+图码 → 等待确认）。
 * 输入：用户表单交互。
 * 输出：步骤状态与提交/校验方法。
 */
export const useRegister = (): RegisterHookReturn & {
  captcha: ImageCaptchaValue;
  setCaptcha: (v: ImageCaptchaValue) => void;
  captchaNonce: number;
  humanToken: string;
  setHumanToken: (v: string) => void;
  humanNonce: number;
  debugConfirmUrl?: string;
} => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [captcha, setCaptcha] = useState<ImageCaptchaValue>({
    captcha_id: '',
    captcha_code: '',
  });
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [humanToken, setHumanToken] = useState('');
  const [humanNonce, setHumanNonce] = useState(0);
  const [debugConfirmUrl, setDebugConfirmUrl] = useState<string | undefined>();
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
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
    [formErrors],
  );

  const toggleSubject = useCallback((subject: string) => {
    setFormData((prev) => {
      const exists = prev.subjects.includes(subject);
      const subjects = exists
        ? prev.subjects.filter((item) => item !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
    setFormErrors((prev) => (prev.subjects ? { ...prev, subjects: '' } : prev));
  }, []);

  /**
   * 能力：校验第一步基础资料。
   * 输入：formData。
   * 输出：是否通过。
   */
  const validateStep1 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.password) errors.password = '请输入密码';
    else if (formData.password.length < 8) errors.password = '密码至少8个字符';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致';
    }
    if (!formData.realName.trim()) errors.realName = '请输入真实姓名';
    if (!formData.phone.trim()) errors.phone = '请输入手机号';
    else if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '请输入正确的手机号';
    if (!formData.stage) errors.stage = '请选择任教年级';
    if (!formData.subjects.length) errors.subjects = '请至少选择一门学科';
    if (!formData.agreeTerms) errors.agreeTerms = '请同意用户协议';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * 能力：校验第二步邮箱、图片验证码与人机滑块。
   * 输入：formData + captcha + humanToken。
   * 输出：是否通过。
   */
  const validateStep2 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const email = formData.email.trim();
    if (!email) errors.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '请输入正确的邮箱';
    if (!captcha.captcha_id || !captcha.captcha_code.trim()) {
      errors.captcha = '请填写图片验证码';
    }
    if (!humanToken.trim()) {
      errors.human = '请完成人机滑块验证';
    }
    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  }, [formData.email, captcha, humanToken]);

  const handleNextStep = useCallback(() => {
    if (!validateStep1()) return;
    setCurrentStep(2);
  }, [validateStep1]);

  /**
   * 能力：刷新注册页双层验证控件。
   * 输入：无。
   * 输出：void。
   */
  const refreshSecurity = useCallback(() => {
    setCaptcha({ captcha_id: '', captcha_code: '' });
    setCaptchaNonce((n) => n + 1);
    setHumanToken('');
    setHumanNonce((n) => n + 1);
  }, []);

  /**
   * 能力：提交注册（不自动登录）。
   * 输入：完整表单 + 图片码 + 人机令牌。
   * 输出：进入等待邮箱确认步骤。
   */
  const handleRegister = useCallback(async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        phone: formData.phone.trim(),
        password: formData.password,
        name: formData.realName.trim(),
        stage: formData.stage,
        subjects: formData.subjects,
        email: formData.email.trim(),
        captcha_id: captcha.captcha_id,
        captcha_code: captcha.captcha_code.trim(),
        human_token: humanToken.trim(),
      });
      const payload: any = extractPayload(response) || response.data || response;
      if (payload?.need_email_confirm || payload?.email) {
        setDebugConfirmUrl(payload.debug_confirm_url);
        setCurrentStep(3);
        message.success(payload.message || '请查收邮箱完成确认');
        return;
      }
      message.warning('注册响应异常，请尝试登录或联系管理员');
      refreshSecurity();
    } catch (error: any) {
      message.error(error?.message || '注册失败');
      refreshSecurity();
    } finally {
      setIsLoading(false);
    }
  }, [formData, captcha, humanToken, validateStep1, validateStep2, refreshSecurity]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setFormErrors({});
    setCountdown(0);
    setDebugConfirmUrl(undefined);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
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
    countdown,
    sendingCode,
    handleInputChange,
    toggleSubject,
    handleNextStep,
    sendSmsCode: async () => undefined,
    handleRegister,
    handleReset,
    captcha,
    setCaptcha,
    captchaNonce,
    humanToken,
    setHumanToken,
    humanNonce,
    debugConfirmUrl,
  };
};
