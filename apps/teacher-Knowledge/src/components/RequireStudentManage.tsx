import { Result, Spin } from 'antd';
import type { ReactNode } from 'react';
import { canManageStudents } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';

export function RequireStudentManage({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.user.current);
  const loading = useAppSelector((state) => state.user.isLoading);

  if (loading && !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!canManageStudents(user)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Result
          status="403"
          title="当前版本没有学生管理权限"
          subTitle="基础版体验结束后不再开放。升级 Pro / Turbo 后可管理学生，并启用个性化作业与学生画像更新。"
        />
      </div>
    );
  }

  return <>{children}</>;
}
