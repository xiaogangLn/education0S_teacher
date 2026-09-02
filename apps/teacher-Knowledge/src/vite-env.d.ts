// apps/teacher-knowledge/src/vite-env.d.ts
/// <reference types="vite/client" />
// 声明 process 对象
declare const process: {
    env: {
      NODE_ENV: string;
      [key: string]: string | undefined;
    };
};
// 声明 define 注入的全局变量
declare const __API_BASE_URL__: string;
declare const __WS_URL__: string;
declare const __APP_ENV__: string;
declare const __DEBUG__: boolean;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}