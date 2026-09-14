import { useEffect } from 'react';
import { authService } from '@api/index';
import { useAppDispatch } from '@/store/hooks';
import { logout, setLoading, setToken, setUser } from '@/store/slices/userSlice';
import { mapAuthUserToStore } from '@/utils/currentUser';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    dispatch(setToken({ token, refreshToken: localStorage.getItem('refreshToken') || undefined }));
    dispatch(setLoading(true));

    let cancelled = false;
    authService
      .getMe()
      .then((response) => {
        if (cancelled) return;
        const raw = response.data?.user || (response.data as any);
        if ((response.code === 0 || raw) && raw) {
          const mapped = mapAuthUserToStore(raw);
          if (mapped.role !== 'admin') {
            dispatch(logout());
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return;
          }
          dispatch(setUser(mapped));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) dispatch(setLoading(false));
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
