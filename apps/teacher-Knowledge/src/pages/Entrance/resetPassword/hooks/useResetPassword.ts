import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { authService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import type { ImageCaptchaValue } from '@/components/ImageCaptchaField';

type HumanAction = 'send' | 'reset' | null;

/**
 * 能力：老师工作站重置密码流程（邮箱验证码 + 双层防刷 + 7 天限频由后端保证）。
 * 输入：表单交互。
 * 输出：发码/提交状态与回调。
 */
export function useResetPassword(onSuccess?: () => void) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState<ImageCaptchaValue>({
    captcha_id: '',
    captcha_code: '',
  });
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [humanModalOpen, setHumanModalOpen] = useState(false);
  const [humanNonce, setHumanNonce] = useState(0);
  const [humanAction, setHumanAction] = useState<HumanAction>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /**
   * 能力：刷新图片验证码。
   * 输入：无。
   * 输出：void。
   */
  const refreshCaptcha = useCallback(() => {
    setCaptcha({ captcha_id: '', captcha_code: '' });
    setCaptchaNonce((n) => n + 1);
  }, []);

  /**
   * 能力：启动发码倒计时。
   * 输入：秒数。
   * 输出：void。
   */
  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * 能力：基础字段校验（发码前）。
   * 输入：无。
   * 输出：是否通过。
   */
  const validateBeforeSend = useCallback((): boolean => {
    if (!phone.trim()) {
      message.warning('请输入手机号');
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      message.warning('请输入正确的手机号');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      message.warning('请输入绑定邮箱');
      return false;
    }
    if (!captcha.captcha_id || !captcha.captcha_code.trim()) {
      message.warning('请填写图片验证码');
      return false;
    }
    return true;
  }, [phone, email, captcha]);

  /**
   * 能力：基础字段校验（提交重置前）。
   * 输入：无。
   * 输出：是否通过。
   */
  const validateBeforeReset = useCallback((): boolean => {
    if (!validateBeforeSend()) return false;
    if (!code.trim()) {
      message.warning('请输入邮箱验证码');
      return false;
    }
    if (password.length < 8) {
      message.warning('新密码至少 8 位');
      return false;
    }
    if (password !== confirmPassword) {
      message.warning('两次密码不一致');
      return false;
    }
    return true;
  }, [validateBeforeSend, code, password, confirmPassword]);

  /**
   * 能力：点击获取邮箱验证码 → 打开人机弹窗。
   * 输入：无。
   * 输出：void。
   */
  const handleClickSendCode = useCallback(() => {
    if (countdown > 0 || sendingCode) return;
    if (!validateBeforeSend()) return;
    setHumanAction('send');
    setHumanNonce((n) => n + 1);
    setHumanModalOpen(true);
  }, [countdown, sendingCode, validateBeforeSend]);

  /**
   * 能力：点击重置密码 → 打开人机弹窗。
   * 输入：无。
   * 输出：void。
   */
  const handleClickReset = useCallback(() => {
    if (submitting) return;
    if (!validateBeforeReset()) return;
    setHumanAction('reset');
    setHumanNonce((n) => n + 1);
    setHumanModalOpen(true);
  }, [submitting, validateBeforeReset]);

  const closeHumanModal = useCallback(() => {
    if (sendingCode || submitting) return;
    setHumanModalOpen(false);
    setHumanAction(null);
  }, [sendingCode, submitting]);

  /**
   * 能力：人机通过后执行发码或重置。
   * 输入：human_token。
   * 输出：副作用（提示/跳转登录）。
   */
  const handleHumanVerified = useCallback(
    async (humanToken: string) => {
      if (!humanToken.trim() || !humanAction) return;

      if (humanAction === 'send') {
        setSendingCode(true);
        try {
          const res = await authService.sendResetPasswordCode({
            phone: phone.trim(),
            email: email.trim(),
            captcha_id: captcha.captcha_id,
            captcha_code: captcha.captcha_code.trim(),
            human_token: humanToken.trim(),
          });
          const payload =
            extractPayload<{
              message?: string;
              expires_in?: number;
              debug_code?: string;
              masked_email?: string;
            }>(res) || (res as any);
          message.success(payload?.message || '验证码已发送');
          if (payload?.debug_code && import.meta.env.DEV) {
            message.info(`调试验证码：${payload.debug_code}`, 8);
          }
          startCountdown(payload?.expires_in || 60);
          setHumanModalOpen(false);
          setHumanAction(null);
          refreshCaptcha();
        } catch (error: any) {
          message.error(error?.message || '发送失败');
          setHumanModalOpen(false);
          setHumanAction(null);
          refreshCaptcha();
        } finally {
          setSendingCode(false);
        }
        return;
      }

      setSubmitting(true);
      try {
        const res = await authService.resetPassword({
          phone: phone.trim(),
          email: email.trim(),
          code: code.trim(),
          new_password: password,
          captcha_id: captcha.captcha_id,
          captcha_code: captcha.captcha_code.trim(),
          human_token: humanToken.trim(),
        });
        const payload = extractPayload<{ message?: string }>(res) || (res as any);
        message.success(payload?.message || '密码重置成功，请登录');
        setHumanModalOpen(false);
        setHumanAction(null);
        onSuccess?.();
      } catch (error: any) {
        message.error(error?.message || '重置失败');
        setHumanModalOpen(false);
        setHumanAction(null);
        refreshCaptcha();
      } finally {
        setSubmitting(false);
      }
    },
    [
      humanAction,
      phone,
      email,
      captcha,
      code,
      password,
      startCountdown,
      refreshCaptcha,
      onSuccess,
    ],
  );

  return {
    phone,
    setPhone,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    captcha,
    setCaptcha,
    captchaNonce,
    humanModalOpen,
    humanNonce,
    closeHumanModal,
    handleHumanVerified,
    handleClickSendCode,
    handleClickReset,
    sendingCode,
    submitting,
    countdown,
    isBusy: sendingCode || submitting,
  };
}
