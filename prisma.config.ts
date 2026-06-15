import { defineConfig } from "prisma/config";

// 只在有 .env 文件时才加载（本地开发用，Docker 构建时跳过）
try {
  require("dotenv").config();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
