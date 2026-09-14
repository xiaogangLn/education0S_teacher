import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = process.env.PUBLIC_SITE_URL || 'https://www.educationos.cn';
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      alias: {
        '@': path.join(root, 'src'),
      },
    },
  },
});
