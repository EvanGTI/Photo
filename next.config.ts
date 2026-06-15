import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",   // 腾讯云容器部署必需
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
  // 防止服务器端导入 fs（Wechatpay 用到）
  serverExternalPackages: ["wechatpay-node-v3", "sharp"],
}

export default nextConfig
