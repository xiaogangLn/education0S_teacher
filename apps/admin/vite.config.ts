// apps/teacher-knowledge/vite.config.ts
import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  // 代理目标
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:9530';
  
  // 是否启用调试
  const isDebug = env.VITE_DEBUG === 'true';

  const config: UserConfig = {
    plugins: [
      react({
        // 支持 JSX 运行时
        jsxRuntime: 'automatic',
      }),
      // 打包分析（仅在分析模式下启用）
      ...(env.VITE_ANALYZE === 'true' ? [visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      })] : []),
    ],
    
    // 路径别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@types': path.resolve(__dirname, '../../packages/shared/src/types'),
        '@api': path.resolve(__dirname, '../../packages/shared/src/api'),
      },
    },
    
    // 开发服务器配置
    server: {
      port: 9527,
      host: true, // 监听所有地址
      open: true, // 自动打开浏览器
      strictPort: false, // 端口被占用时尝试下一个端口
      
      // 代理配置
      proxy: {
        // API 代理
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('[Proxy Error]', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[Proxy]', req.method, req.url, '→', options.target);
            });
          },
        },
        
        // WebSocket 代理（Yjs 协作）
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:1234',
          ws: true,
          changeOrigin: true,
        },
        
        // 静态资源代理
        '/static': {
          target: proxyTarget,
          changeOrigin: true,
        },
        
        // 文件上传代理
        '/upload': {
          target: proxyTarget,
          changeOrigin: true,
        },
        
        // SSE 流式代理
        '/sse': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
      
      // 热更新配置
      hmr: {
        overlay: true,
      },
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDebug,
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 使用函数形式的 manualChunks
          manualChunks(id) {
            // React 相关
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom') ||
                id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }
            // Ant Design 相关
            if (id.includes('node_modules/antd') || 
                id.includes('node_modules/@ant-design')) {
              return 'antd-vendor';
            }
            // 编辑器相关
            if (id.includes('node_modules/@tiptap') || 
                id.includes('node_modules/yjs') ||
                id.includes('node_modules/y-protocols') ||
                id.includes('node_modules/prosemirror')) {
              return 'editor-vendor';
            }
            // 其他 node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    
    // CSS 配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            // Ant Design 主题定制
            '@primary-color': '#4f46e5',
            '@border-radius-base': '8px',
          },
        },
      },
    },
    
    // 全局变量定义
    define: {
     // ✅ 正确：使用自定义全局变量
     '__API_BASE_URL__': JSON.stringify(env.VITE_API_BASE_URL || '/api'),
     '__WS_URL__': JSON.stringify(env.VITE_WS_URL || 'ws://localhost:1234'),
     '__APP_ENV__': JSON.stringify(env.VITE_APP_ENV || 'development'),
     '__DEBUG__': JSON.stringify(env.VITE_DEBUG === 'true'),
    },
    
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        '@ant-design/icons',
        '@tiptap/react',
        '@tiptap/starter-kit',
        'yjs',
        'axios',
      ],
    },
    
    // 静态资源
    publicDir: 'public',
  };

  return config;
});