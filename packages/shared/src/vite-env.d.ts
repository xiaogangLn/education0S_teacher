// packages/shared/src/vite-env.d.ts
/// <reference types="vite/client" />

// 扩展 ImportMeta 接口
interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_WS_URL?: string;
    readonly VITE_APP_ENV?: string;
    readonly VITE_DEBUG?: string;
    readonly VITE_PROXY_TARGET?: string;
    readonly VITE_ENABLE_MSW?: string;
    readonly [key: string]: string | undefined;
  }