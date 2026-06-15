import { NextResponse } from "next/server"
import { consumeDownloadToken } from "@/lib/download"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const result = await consumeDownloadToken(token)

  if (!result) {
    return NextResponse.json(
      { error: "下载链接无效、已过期或已超出下载次数限制" },
      { status: 403 }
    )
  }

  // 重定向到 Cloudinary 临时签名 URL
  return NextResponse.redirect(result.downloadUrl, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(result.filename)}"`,
    },
  })
}
