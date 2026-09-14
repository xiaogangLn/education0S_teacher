import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import type { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = useAppSelector((state) => state.user.token) || localStorage.getItem('accessToken');
  const user = useAppSelector((state) => state.user.current);
  const loading = useAppSelector((state) => state.user.isLoading);

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
