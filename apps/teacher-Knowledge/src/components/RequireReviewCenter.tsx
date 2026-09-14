import { Result, Spin } from 'antd';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { canAccessReviewCenter } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';

/** 商业版无审核中心：拦截直达 /reviewCenter */
export function RequireReviewCenter({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.user.current);
  const loading = useAppSelector((state) => state.user.isLoading);

  if (loading && !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!canAccessReviewCenter(user)) {
    return <Navigate to="/workbench" replace />;
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Result status="403" title="请先登录" />
      </div>
    );
  }

  return <>{children}</>;
}
