import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadPersistedUser, persistCurrentUser } from '@/utils/currentUser';

export interface User {
  id: string;
  username: string;
  phone: string;
  email?: string;
  realName: string;
  role: 'admin' | 'grade_admin' | 'teacher' | 'student' | 'parent';
  schoolId?: string;
  schoolName?: string;
  gradeId?: string;
  gradeName?: string;
  classId?: string;
  className?: string;
  avatarUrl?: string;
  subjects: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  current: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const persistedUser = loadPersistedUser();
const persistedToken = typeof localStorage === 'undefined' ? null : localStorage.getItem('accessToken');
const persistedRefresh = typeof localStorage === 'undefined' ? null : localStorage.getItem('refreshToken');

const initialState: UserState = {
  current: persistedUser,
  token: persistedToken,
  refreshToken: persistedRefresh,
  expiresAt: null,
  isAuthenticated: !!persistedToken,
  isLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.current = action.payload;
      state.isAuthenticated = true;
      persistCurrentUser(action.payload);
    },
    setToken: (state, action: PayloadAction<{ token: string; refreshToken?: string; expiresIn?: number }>) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.expiresIn) {
        state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      }
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.current) {
        state.current = { ...state.current, ...action.payload };
        persistCurrentUser(state.current);
      }
    },
    logout: (state) => {
      state.current = null;
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      persistCurrentUser(null);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUser,
  setToken,
  updateUser,
  logout,
  setLoading,
  clearToken,
} = userSlice.actions;

export default userSlice.reducer;
