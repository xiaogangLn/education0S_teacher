// packages/shared/src/types/global.d.ts
// 为 shared 包添加全局类型声明
declare global {
    const __API_BASE_URL__: string | undefined;
    const __WS_URL__: string | undefined;
    const __APP_ENV__: string | undefined;
    const __DEBUG__: boolean | undefined;
  }
  
  export {};