export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PhotoDetail from "@/components/front/PhotoDetail"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const photo = await prisma.photo.findUnique({ where: { slug } })
  if (!photo) return { title: "作品不存在" }
  return {
    title: photo.title,
    description: photo.description || `摄影作品：${photo.title}`,
    openGraph: {
      images: [photo.previewUrl],
    },
  }
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const photo = await prisma.photo.findUnique({
    where: { slug, published: true },
    include: {
      products: {
        where: { active: true },
        orderBy: { price: "asc" },
      },
    },
  })

  if (!photo) notFound()

  // 增加浏览计数（异步，不阻塞渲染）
  prisma.photo
    .update({ where: { id: photo.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  return <PhotoDetail photo={photo as any} />
}
