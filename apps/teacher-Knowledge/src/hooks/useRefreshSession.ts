import { useCallback } from 'react';
import { authService } from '@api/index';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { mapAuthUserToStore } from '@/utils/currentUser';

export function useRefreshSession() {
  const dispatch = useAppDispatch();

  return useCallback(async () => {
    const response = await authService.getMe();
    const raw = response.data;
    if (!raw) return;
    dispatch(setUser(mapAuthUserToStore(raw)));
  }, [dispatch]);
}
