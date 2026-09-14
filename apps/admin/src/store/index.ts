// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  userReducer,
  authReducer,
  permissionReducer,
  teacherPortraitReducer,
  studentPortraitReducer,
  appReducer,
} from './slices';

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  permission: permissionReducer,
  teacherPortrait: teacherPortraitReducer,
  studentPortrait: studentPortraitReducer,
  app: appReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;