# ── 构建阶段 ──────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 生成 Prisma Client + 构建
RUN npx prisma generate
RUN npm run build

# ── 运行阶段 ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 只复制运行必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 微信支付证书目录（敏感文件通过环境变量或挂载注入）
RUN mkdir -p /app/certs

EXPOSE 3000

CMD ["node", "server.js"]
