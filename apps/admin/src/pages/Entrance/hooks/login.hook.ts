import { message } from 'antd';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@api/index';
import { useAppDispatch } from '@/store/hooks';
import { setToken, setUser } from '@/store/slices/userSlice';
import { mapAuthUserToStore } from '@/utils/currentUser';
import type { ImageCaptchaValue } from '@/components/ImageCaptchaField';

/**
 * 能力：管理员登录（表单校验 → 弹窗人机滑块 → 提交登录）。
 * 输入：账号密码与图片码。
 * 输出：登录态与弹窗状态。
 */
const EducationOSLoginHook = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [captcha, setCaptcha] = useState<ImageCaptchaValue>({
    captcha_id: '',
    captcha_code: '',
  });
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [humanModalOpen, setHumanModalOpen] = useState(false);
  const [humanNonce, setHumanNonce] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha({ captcha_id: '', captcha_code: '' });
    setCaptchaNonce((n) => n + 1);
  }, []);

  const closeHumanModal = useCallback(() => {
    if (isLoading) return;
    setHumanModalOpen(false);
    setHumanNonce((n) => n + 1);
  }, [isLoading]);

  /**
   * 能力：点击登录 — 校验后弹出人机验证。
   * 输入：账号/密码/图片码。
   * 输出：打开弹窗。
   */
  const handleSubmit = useCallback(() => {
    if (!username.trim() || !password.trim()) {
      message.warning('请输入账号和密码');
      return;
    }
    if (!captcha.captcha_id || !captcha.captcha_code.trim()) {
      message.warning('请填写图片验证码');
      return;
    }
    setHumanNonce((n) => n + 1);
    setHumanModalOpen(true);
  }, [username, password, captcha]);

  /**
   * 能力：人机通过后发起登录。
   * 输入：human_token。
   * 输出：登录成功跳转或失败刷新图码。
   */
  const handleHumanVerified = useCallback(
    async (humanToken: string) => {
      if (!humanToken.trim() || isLoading) return;

      setIsLoading(true);
      try {
        const response = await authService.login({
          phone: username.trim(),
          password,
          captcha_id: captcha.captcha_id,
          captcha_code: captcha.captcha_code.trim(),
          human_token: humanToken.trim(),
        });
        const payload: any = response.data || response;
        const accessToken = payload.access_token || payload.accessToken;
        const refreshToken = payload.refresh_token || payload.refreshToken;
        const userInfo = payload.user;
        if ((response.code === 0 || accessToken) && accessToken) {
          if (userInfo) {
            const mapped = mapAuthUserToStore(userInfo);
            if (mapped.role !== 'admin') {
              message.error('请使用管理员账号登录');
              setHumanModalOpen(false);
              refreshCaptcha();
              return;
            }
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            dispatch(setUser(mapped));
          } else {
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          }
          dispatch(
            setToken({
              token: accessToken,
              refreshToken,
              expiresIn: payload.expires_in || payload.expiresIn,
            }),
          );
          setHumanModalOpen(false);
          message.success('登录成功');
          navigate('/application');
        } else {
          message.error(response.message || '登录失败');
          setHumanModalOpen(false);
          refreshCaptcha();
        }
      } catch (error: any) {
        message.error(error?.message || '登录失败，请重试');
        setHumanModalOpen(false);
        refreshCaptcha();
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, captcha, navigate, dispatch, refreshCaptcha, isLoading],
  );

  return {
    username,
    setUsername,
    password,
    setPassword,
    captcha,
    setCaptcha,
    captchaNonce,
    humanModalOpen,
    humanNonce,
    closeHumanModal,
    handleHumanVerified,
    isLoading,
    setIsLoading,
    handleSubmit,
  };
};

export { EducationOSLoginHook };
export default EducationOSLoginHook;
