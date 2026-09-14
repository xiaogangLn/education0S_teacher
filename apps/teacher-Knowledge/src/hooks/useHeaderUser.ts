import { message } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@api/index';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as userLogout } from '@/store/slices/userSlice';
import { canManageStudents, getUserDisplayName, getUserSubtitle, isCommercialTenant, canAccessReviewCenter, isLeaderRole } from '@/utils/currentUser';

export function useHeaderUser() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.current);
  const displayName = getUserDisplayName(user);
  const subtitle = getUserSubtitle(user);
  const avatarText = displayName.slice(0, 1) || '用';
  const avatarUrl = user?.avatarUrl || undefined;
  const isLeader = isLeaderRole(user?.role);
  const isCommercial = isCommercialTenant(user);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    dispatch(userLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    message.success('已退出登录');
    navigate('/');
  }, [dispatch, navigate]);

  return {
    user,
    isLeader,
    isCommercial,
    canManageStudents: canManageStudents(user),
    displayName,
    subtitle,
    avatarText,
    avatarUrl,
    handleLogout,
    canAccessReviewCenter: canAccessReviewCenter(user),
  };
}
