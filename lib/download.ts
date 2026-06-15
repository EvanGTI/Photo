import { SignJWT, jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"
import { getPrivateDownloadUrl } from "@/lib/cloudinary"

const SECRET = new TextEncoder().encode(
  process.env.DOWNLOAD_TOKEN_SECRET || "fallback-dev-secret"
)
const EXPIRES_IN = 7 * 24 * 60 * 60 // 7天（秒）
const MAX_DOWNLOADS = 5

/** 为已支付订单的数字商品生成下载令牌 */
export async function generateDownloadTokens(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: {
      orderId,
      product: { type: "DIGITAL" },
    },
    include: { product: { include: { photo: true } } },
  })

  const now = new Date()
  const expiresAt = new Date(now.getTime() + EXPIRES_IN * 1000)

  for (const item of items) {
    // 生成 JWT 令牌
    const token = await new SignJWT({
      itemId: item.id,
      photoRawId: item.product.photo.rawId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(SECRET)

    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        downloadToken: token,
        maxDownloads: MAX_DOWNLOADS,
        tokenExpiresAt: expiresAt,
      },
    })
  }
}

/** 验证并消耗一次下载机会，返回 Cloudinary 临时 URL */
export async function consumeDownloadToken(
  token: string
): Promise<{ downloadUrl: string; filename: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    const { itemId, photoRawId } = payload as {
      itemId: string
      photoRawId: string
    }

    const item = await prisma.orderItem.findUnique({
      where: { downloadToken: token },
      include: { product: { include: { photo: true } } },
    })

    if (!item) return null
    if (item.downloadCount >= item.maxDownloads) return null
    if (item.tokenExpiresAt && item.tokenExpiresAt < new Date()) return null

    // 增加下载计数
    await prisma.orderItem.update({
      where: { id: itemId },
      data: { downloadCount: { increment: 1 } },
    })

    const downloadUrl = getPrivateDownloadUrl(photoRawId as string, 300) // 5分钟临时链接
    const filename = `${item.product.photo.title}.jpg`

    return { downloadUrl, filename }
  } catch {
    return null
  }
}
