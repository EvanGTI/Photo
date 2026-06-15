import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Lens & Light — 摄影艺术",
    template: "%s | Lens & Light",
  },
  description: "专业摄影师作品展示与销售平台，提供数字下载、实体印刷和版权授权服务。",
  keywords: ["摄影", "摄影作品", "艺术照片", "数字下载", "画廊"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Lens & Light",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
