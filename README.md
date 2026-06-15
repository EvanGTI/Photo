# 📷 Lens & Light — 摄影家作品展示与销售平台

一个专为摄影师设计的全功能作品展示与电商平台，支持数字下载、实体印刷、版权授权和定制拍摄服务。

## ✨ 功能特性

### 前台
- 🖼 **全屏英雄区** + 瀑布流画廊（Masonry 布局）
- 🔍 **分类筛选** + 标签过滤 + 灯箱预览
- 🛒 **侧边购物车** + 结账流程（支持实体/数字混合订单）
- 💳 **三方支付**：支付宝、微信支付（Native + H5）、Stripe 信用卡
- 📥 **安全数字下载**：JWT 令牌 + 限次 + 有效期保护
- 📧 订单确认邮件通知

### 管理后台 (`/admin`)
- 📊 **数据看板**：收入趋势图、热门作品、最近订单
- 🗂 **照片管理**：拖拽上传、Cloudinary CDN + 水印、批量操作
- 📦 **订单管理**：状态流转、分页筛选、详情查看
- ⚙️ **网站设置**

## 🛠 技术栈

| 分类 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS v4 |
| 数据库 | PostgreSQL + Prisma ORM v7 |
| 认证 | NextAuth.js v5 |
| 图片 | Cloudinary（CDN + 水印 + 私有存储） |
| 支付 | Stripe + 支付宝 SDK + 微信支付 v3 |
| 状态管理 | Zustand（购物车持久化） |
| 图表 | Recharts |

## 🚀 快速开始

### 1. 复制环境变量
```bash
cp .env.example .env
# 填写所有必要的环境变量
```

### 2. 数据库迁移与初始化
```bash
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000` 查看前台，管理后台在 `/admin/dashboard`。

## 📁 核心目录

```
app/(front)/          前台页面（首页、画廊、结账、订单）
app/(admin)/          管理后台
app/api/              API路由（订单、支付、下载、Webhook）
components/front/     前台UI组件
components/admin/     后台UI组件
lib/payments/         支付SDK封装（Stripe/支付宝/微信）
store/cart.ts         Zustand购物车
prisma/schema.prisma  数据库模型
```

## 🌐 部署建议

- **应用托管**：Vercel（自动 HTTPS，支付回调必需）
- **数据库**：Neon / Supabase（PostgreSQL，均有免费额度）
- **图片CDN**：Cloudinary（原图私有 + 预览公开）
