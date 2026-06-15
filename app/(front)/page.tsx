export const dynamic = "force-dynamic"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import PhotoGrid from "@/components/front/PhotoGrid"
import { ArrowRight, Download, Printer, Shield, Calendar } from "lucide-react"

async function getFeaturedPhotos() {
  return prisma.photo.findMany({
    where: { published: true, featured: true },
    include: {
      products: {
        where: { active: true },
        select: { id: true, type: true, price: true },
      },
    },
    orderBy: { sortOrder: "asc" },
    take: 12,
  })
}

async function getHeroPhoto() {
  return prisma.photo.findFirst({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
  })
}

export default async function HomePage() {
  const [hero, featured] = await Promise.all([getHeroPhoto(), getFeaturedPhotos()])

  return (
    <>
      {/* ─── 英雄区 ─── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {hero ? (
          <Image
            src={hero.previewUrl}
            alt={hero.title}
            fill
            className="object-cover protected"
            priority
            quality={90}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
        )}

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />

        {/* 内容 */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <p className="text-accent tracking-[0.3em] text-xs uppercase mb-6 font-medium">
            Photography Gallery
          </p>
          <h1 className="text-5xl sm:text-7xl font-light tracking-tight leading-none mb-6">
            光影之间
            <br />
            <span className="font-semibold">美在此刻</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            每一张照片都承载着独特的故事与情感，
            <br className="hidden sm:block" />
            欢迎收藏属于你的那一刻。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gallery"
              className="px-8 py-3.5 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              浏览作品集
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="px-8 py-3.5 border border-white/50 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              定制拍摄
            </Link>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="h-8 w-px bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ─── 服务亮点 ─── */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Download,
                title: "数字下载",
                desc: "4K 高清原图，支付后即时获取",
              },
              {
                icon: Printer,
                title: "精品印刷",
                desc: "专业级相纸，还原最真实色彩",
              },
              {
                icon: Shield,
                title: "版权授权",
                desc: "商业授权证书，合规使用无忧",
              },
              {
                icon: Calendar,
                title: "定制拍摄",
                desc: "专属预约，记录您的美好时光",
              },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 精选作品 ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent text-xs tracking-[0.3em] uppercase mb-2">
                Featured Works
              </p>
              <h2 className="text-3xl sm:text-4xl font-light">精选作品</h2>
            </div>
            <Link
              href="/gallery"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <PhotoGrid photos={featured as any} />
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>暂无作品，请先在后台上传照片。</p>
              <Link href="/admin/photos" className="mt-4 text-sm text-primary hover:underline block">
                前往管理后台
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center px-6">
          <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">
            Custom Photography
          </p>
          <h2 className="text-3xl sm:text-4xl font-light mb-6">
            让我为您定格专属时刻
          </h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            婚礼、人像、企业品牌……用专业的镜头，讲述您的故事。
          </p>
          <Link
            href="/services"
            className="px-8 py-3.5 bg-accent text-accent-foreground font-semibold rounded-full hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
          >
            了解定制服务
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
