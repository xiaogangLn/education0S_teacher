import { useEffect } from 'react';
import { authService } from '@api/index';
import { useAppDispatch } from '@/store/hooks';
import { setLoading, setToken, setUser } from '@/store/slices/userSlice';
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
        const raw = response.data;
        if ((response.code === 0 || raw) && raw) {
          dispatch(setUser(mapAuthUserToStore(raw)));
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
