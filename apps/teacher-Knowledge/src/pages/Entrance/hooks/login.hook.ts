import { message } from 'antd';
import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type UserInfo } from '@api/index';
import { useAppDispatch } from '@/store/hooks';
import { setToken, setUser as setStoreUser, logout as userLogout } from '@/store/slices/userSlice';
import { mapAuthUserToStore } from '@/utils/currentUser';
import type { ImageCaptchaValue } from '@/components/ImageCaptchaField';

/**
 * 能力：教师端登录（表单校验 → 弹窗人机滑块 → 提交登录）。
 * 输入：用户在表单中的交互。
 * 输出：登录副作用（token/跳转）及弹窗状态。
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
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('accessToken'),
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rememberUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.username) setUsername(String(parsed.username));
      }
    } catch {
      // ignore
    }
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
   * 能力：关闭人机弹窗并重置滑块。
   * 输入：无。
   * 输出：void。
   */
  const closeHumanModal = useCallback(() => {
    if (isLoading) return;
    setHumanModalOpen(false);
    setHumanNonce((n) => n + 1);
  }, [isLoading]);

  /**
   * 能力：点击登录 — 校验基础字段后弹出人机验证。
   * 输入：账号/密码/图片码。
   * 输出：打开 humanModal。
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
   * 能力：人机通过后真正发起登录请求。
   * 输入：human_token。
   * 输出：成功跳转工作台；失败提示并刷新图码。
   */
  const handleHumanVerified = useCallback(
    async (humanToken: string) => {
      if (!humanToken.trim() || isLoading) return;

      setIsLoading(true);
      try {
        const response = await authService.login({
          phone: username.trim(),
          password,
          remember: rememberMe,
          captcha_id: captcha.captcha_id,
          captcha_code: captcha.captcha_code.trim(),
          human_token: humanToken.trim(),
        });

        const payload: any = response.data || response;
        const accessToken = payload.access_token || payload.accessToken;
        const refreshToken = payload.refresh_token || payload.refreshToken;
        const userInfo = payload.user;

        if ((response.code === 0 || accessToken) && accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          if (rememberMe) {
            localStorage.setItem('rememberUser', JSON.stringify({ username: username.trim() }));
          } else {
            localStorage.removeItem('rememberUser');
          }
          setUser(userInfo);
          if (payload) {
            dispatch(setStoreUser(mapAuthUserToStore(payload)));
          }
          dispatch(
            setToken({
              token: accessToken,
              refreshToken: refreshToken,
              expiresIn: payload.expires_in || payload.expiresIn,
            }),
          );
          setIsAuthenticated(true);
          setHumanModalOpen(false);
          message.success('登录成功！欢迎使用 EducationOS');
          navigate('/workbench');
        } else {
          message.error(response.message || '登录失败，请检查账号和密码');
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
    [username, password, captcha, rememberMe, navigate, dispatch, refreshCaptcha, isLoading],
  );

  const handleRememberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    dispatch(userLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    message.success('已退出登录');
    navigate('/');
  }, [dispatch, navigate]);

  const handleSocialLogin = useCallback((platform: string) => {
    message.info(`正在跳转至 ${platform} 授权登录...`);
  }, []);

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
    rememberMe,
    handleRememberChange,
    isLoading,
    handleSubmit,
    handleLogout,
    handleSocialLogin,
    user,
    isAuthenticated,
    verifyCode: '',
    setVerifyCode: () => undefined,
    codeCountdown: 0,
    handleGetCode: () => undefined,
  };
};

export { EducationOSLoginHook };
export default EducationOSLoginHook;
