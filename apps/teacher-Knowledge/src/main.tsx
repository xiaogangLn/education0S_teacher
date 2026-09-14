import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { router } from './router'
import { store } from './store'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import { setupAuthExpiredModal } from './utils/setupAuthExpiredModal'

import './index.css';
import './styles/globals.scss';
import 'antd/dist/antd.css';

dayjs.locale('zh-cn');

setupAuthExpiredModal();

function AppRoot() {
  useAuthBootstrap();
  return <RouterProvider router={router} />;
}

// 将环境变量注入到 window 全局变量（作为兜底方案）
(window as any).__ENV__ = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:1234',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <Provider store={store}>
        <AppRoot />
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
)
