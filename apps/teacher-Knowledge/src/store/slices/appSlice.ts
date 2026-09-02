// store/slices/appSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;
  currentPage: string;
  breadcrumbs: string[];
  modalOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, any>;
}

const initialState: AppState = {
  theme: 'light',
  sidebarCollapsed: false,
  notifications: [],
  unreadCount: 0,
  currentPage: '/',
  breadcrumbs: [],
  modalOpen: false,
  modalType: null,
  modalProps: {},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AppState['theme']>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notify-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<string[]>) => {
      state.breadcrumbs = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; props?: Record<string, any> }>) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
      state.modalProps = action.payload.props || {};
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalProps = {};
    },
  },
});

export const {
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
} = appSlice.actions;

export default appSlice.reducer;