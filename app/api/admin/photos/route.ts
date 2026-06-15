import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadPhotoWithPreview } from "@/lib/cloudinary"
import { slugify } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string) || "Untitled"
    const category = (formData.get("category") as string) || "uncategorized"
    const description = formData.get("description") as string | null
    const tags = ((formData.get("tags") as string) || "").split(",").filter(Boolean)

    if (!file) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, "_")

    // 上传到 Cloudinary（原图 + 预览图）
    const { raw, preview } = await uploadPhotoWithPreview(buffer, filename)

    // 生成唯一 slug
    let slug = slugify(title)
    const existing = await prisma.photo.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const photo = await prisma.photo.create({
      data: {
        title,
        slug,
        description: description || null,
        category,
        tags,
        previewUrl: preview.url,
        previewId: preview.publicId,
        rawUrl: raw.url,
        rawId: raw.publicId,
        width: preview.width,
        height: preview.height,
        published: false,
      },
      include: { products: true },
    })

    return NextResponse.json(photo)
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
