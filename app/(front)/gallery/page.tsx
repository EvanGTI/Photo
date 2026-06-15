export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import PhotoGrid from "@/components/front/PhotoGrid"
import GalleryFilter from "@/components/front/GalleryFilter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "作品集",
  description: "浏览所有摄影作品，包括风光、人像、街拍等多种风格。",
}

const CATEGORIES = [
  { value: "all", label: "全部" },
  { value: "landscape", label: "风光" },
  { value: "portrait", label: "人像" },
  { value: "street", label: "街拍" },
  { value: "architecture", label: "建筑" },
  { value: "wildlife", label: "野生动物" },
  { value: "abstract", label: "抽象" },
]

async function getPhotos(category?: string) {
  return prisma.photo.findMany({
    where: {
      published: true,
      ...(category && category !== "all" ? { category } : {}),
    },
    include: {
      products: {
        where: { active: true },
        select: { id: true, type: true, price: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>
}) {
  const { category, tag } = await searchParams
  const photos = await getPhotos(category)

  const filtered = tag
    ? photos.filter((p: { tags: string[] }) => p.tags.includes(tag))
    : photos

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent text-xs tracking-[0.3em] uppercase mb-3">
            Gallery
          </p>
          <h1 className="text-4xl font-light mb-4">作品集</h1>
          <p className="text-muted-foreground">
            共 {filtered.length} 件作品
          </p>
        </div>

        {/* Filter */}
        <GalleryFilter
          categories={CATEGORIES}
          currentCategory={category || "all"}
        />

        {/* Grid */}
        <div className="mt-8">
          {filtered.length > 0 ? (
            <PhotoGrid photos={filtered as any} />
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>该分类暂无作品</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
