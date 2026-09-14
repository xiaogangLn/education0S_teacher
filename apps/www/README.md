# EducationOS 官网 (`apps/www`)

静态官网，Astro SSG，面向 SEO 与转化（注册 / 学校扫码）。

## 开发

```bash
pnpm --filter www dev
# http://localhost:4321
```

## 构建

```bash
pnpm --filter www build
pnpm --filter www preview
```

## 环境变量

复制 `.env.example`：

- `PUBLIC_SITE_URL`：官网正式域名（sitemap / canonical）
- `PUBLIC_APP_URL`：教师端地址（默认本地 `http://localhost:3000`）

## 设计稿

见仓库 `docs/www-mockups/`（v5 气质 + v6 首页/产品）。

## 微信二维码

替换 `public/wechat/school-qr.svg` 为真实商务微信二维码图片（可改用 `.png`，并同步改 `schools.astro` 中的路径）。
