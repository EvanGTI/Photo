import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const photo = await prisma.photo.update({
    where: { id },
    data: body,
    include: { products: true },
  })

  return NextResponse.json(photo)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const photo = await prisma.photo.findUnique({ where: { id } })
  if (!photo) return NextResponse.json({ error: "不存在" }, { status: 404 })

  // 删除 Cloudinary 资源
  await Promise.allSettled([
    cloudinary.uploader.destroy(photo.previewId),
    cloudinary.uploader.destroy(photo.rawId),
  ])

  await prisma.photo.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
