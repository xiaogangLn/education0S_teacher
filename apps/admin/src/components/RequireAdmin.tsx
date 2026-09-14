import { Navigate, useLocation } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { useCallback, type ReactNode } from 'react';
import { authService } from '@api/index';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as userLogout } from '@/store/slices/userSlice';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token) || localStorage.getItem('accessToken');
  const user = useAppSelector((state) => state.user.current);
  const loading = useAppSelector((state) => state.user.isLoading);

  const handleBack = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    dispatch(userLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  }, [dispatch]);

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!user && loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Result
          status="403"
          title="需要管理员账号"
          subTitle="当前登录不是管理员，无法进入后台。"
          extra={<Button type="primary" onClick={() => void handleBack()}>返回登录</Button>}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
