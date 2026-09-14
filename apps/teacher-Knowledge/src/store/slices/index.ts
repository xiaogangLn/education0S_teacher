// store/slices/index.ts
import { default as userReducer } from './userSlice';
import { default as authReducer } from './authSlice';
import { default as permissionReducer } from './permissionSlice';
import { default as teacherPortraitReducer } from './teacherPortraitSlice';
import { default as studentPortraitReducer } from './studentPortraitSlice';
import { default as appReducer } from './appSlice';

// 导出 reducers
export {
  userReducer,
  authReducer,
  permissionReducer,
  teacherPortraitReducer,
  studentPortraitReducer,
  appReducer,
};

// ============================================================
// 导出 actions - 解决命名冲突
// ============================================================

// User Slice Actions
export {
  setUser,
  setToken,
  updateUser,
  logout as userLogout,
  setLoading as setUserLoading,
  clearToken,
} from './userSlice';

// Auth Slice Actions
export {
  setLoginLoading,
  setRegisterLoading,
  setLoggedIn,
  setAuthError,
  setLoginMethod,
  setTwoFactorEnabled,
  setTwoFactorVerified,
  resetAuth,
} from './authSlice';

// Permission Slice Actions
export {
  setCurrentLevel,
  setAvailableLevels,
  setPermissions,
  setSchoolId,
  setGradeId,
  setClassId,
  resetPermissions,
} from './permissionSlice';

// Teacher Portrait Slice Actions
export {
  setTeacherPortrait,
  setTeacherId,
  setLoading as setTeacherPortraitLoading,
  setError as setTeacherPortraitError,
  updateTeaching,
  updateResearch,
  clearTeacherPortrait,
} from './teacherPortraitSlice';

// Student Portrait Slice Actions
export {
  setStudentPortrait,
  setLoading as setStudentPortraitLoading,
  setError as setStudentPortraitError,
  updateAcademic,
  clearStudentPortrait,
} from './studentPortraitSlice';

// App Slice Actions
export {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  markNotificationRead,
  markAllRead,
  clearNotifications,
  setCurrentPage,
  setBreadcrumbs,
  openModal,
  closeModal,
  setOrgContext,
} from './appSlice';

// ============================================================
// 导出所有类型
// ============================================================
export type {
  User,
  UserState,
} from './userSlice';

export type {
  AuthState,
} from './authSlice';

export type {
  PermissionState,
  PermissionLevel,
} from './permissionSlice';

export type {
  TeacherPortrait,
  TeacherTeaching,
  TeacherResearch,
  TeacherEffectiveness,
  TeacherGrowth,
  TeacherPortraitState,
} from './teacherPortraitSlice';

export type {
  StudentPortrait,
  StudentAcademic,
  StudentAbilities,
  StudentBehavior,
  StudentPsychology,
  StudentGrowth,
  StudentPortraitState,
} from './studentPortraitSlice';

export type {
  AppState,
  Notification,
} from './appSlice';