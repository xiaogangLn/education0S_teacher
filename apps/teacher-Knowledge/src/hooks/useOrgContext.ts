import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setOrgContext } from '@/store/slices/appSlice';

export function useOrgContext() {
  const org = useAppSelector((state) => state.app.org);
  const dispatch = useAppDispatch();

  const updateOrg = useCallback((next: Partial<typeof org>) => {
    dispatch(setOrgContext(next));
  }, [dispatch]);

  return { ...org, updateOrg };
}
