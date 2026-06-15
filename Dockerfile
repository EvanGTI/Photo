# ── 构建阶段 ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 系统依赖（alpine 需要 libc）
RUN apk add --no-cache libc6-compat openssl

# 先装依赖（利用 Docker layer 缓存）
COPY package*.json ./
RUN npm ci --prefer-offline

# 复制全部源码
COPY . .

# prisma generate 不需要数据库连接，但 prisma.config.ts 会 import dotenv
# 提供一个占位 DATABASE_URL 让 generate 不报错
RUN DATABASE_URL="postgresql://x:x@localhost/x" npx prisma generate

# Next.js 构建（同样不需要真实数据库）
RUN DATABASE_URL="postgresql://x:x@localhost/x" npm run build

# ── 运行阶段 ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone 模式已包含最小化 node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma 引擎文件
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/@prisma/adapter-pg ./node_modules/@prisma/adapter-pg
COPY --from=builder /app/node_modules/pg ./node_modules/pg
COPY --from=builder /app/node_modules/pg-pool ./node_modules/pg-pool

# 证书目录（微信支付证书通过 Secret 挂载）
RUN mkdir -p /app/certs

EXPOSE 3000

CMD ["node", "server.js"]
