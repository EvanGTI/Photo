export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import PhotoManager from "@/components/admin/PhotoManager"

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({
    include: { products: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">照片管理</h1>
      <PhotoManager photos={photos as any} />
    </div>
  )
}
