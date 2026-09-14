// store/slices/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isLoggedIn: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
  error: string | null;
  loginMethod: 'phone' | 'email' | 'wechat' | null;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  loginLoading: false,
  registerLoading: false,
  error: null,
  loginMethod: null,
  twoFactorEnabled: false,
  twoFactorVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginLoading: (state, action: PayloadAction<boolean>) => {
      state.loginLoading = action.payload;
    },
    setRegisterLoading: (state, action: PayloadAction<boolean>) => {
      state.registerLoading = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLoginMethod: (state, action: PayloadAction<AuthState['loginMethod']>) => {
      state.loginMethod = action.payload;
    },
    setTwoFactorEnabled: (state, action: PayloadAction<boolean>) => {
      state.twoFactorEnabled = action.payload;
    },
    setTwoFactorVerified: (state, action: PayloadAction<boolean>) => {
      state.twoFactorVerified = action.payload;
    },
    resetAuth: (state) => {
      state.isLoggedIn = false;
      state.loginLoading = false;
      state.registerLoading = false;
      state.error = null;
      state.loginMethod = null;
      state.twoFactorVerified = false;
    },
  },
});

export const {
  setLoginLoading,
  setRegisterLoading,
  setLoggedIn,
  setAuthError,
  setLoginMethod,
  setTwoFactorEnabled,
  setTwoFactorVerified,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;