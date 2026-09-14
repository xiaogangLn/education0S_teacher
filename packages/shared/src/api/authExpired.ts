// packages/shared/src/api/authExpired.ts

export type AuthExpiredHandler = () => void;

let handling = false;
let handler: AuthExpiredHandler | null = null;

/** 由各前端应用注册：弹出「重新登录」提示等 */
export function setAuthExpiredHandler(fn: AuthExpiredHandler | null) {
  handler = fn;
}

export function isAuthExpiredHandling() {
  return handling;
}

/** 登录页加载成功后可调用，允许下次再次弹出 */
export function resetAuthExpiredHandling() {
  handling = false;
}

/**
 * 认证失效统一入口（刷新 token 失败或无 refreshToken）。
 * 全局只触发一次，避免并发 401 弹多个框。
 */
export function notifyAuthExpired() {
  if (handling) return;
  handling = true;

  if (handler) {
    handler();
    return;
  }

  const path = window.location.pathname;
  if (path !== '/' && !path.startsWith('/m/')) {
    window.location.href = '/';
  }
}
