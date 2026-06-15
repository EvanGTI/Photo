export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { CheckCircle2, Download, Package, Clock } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "订单详情" }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待付款", color: "text-orange-500" },
  PAID: { label: "已付款", color: "text-green-600" },
  PROCESSING: { label: "备货中", color: "text-blue-500" },
  SHIPPED: { label: "已发货", color: "text-blue-600" },
  DELIVERED: { label: "已签收", color: "text-green-600" },
  COMPLETED: { label: "已完成", color: "text-green-700" },
  CANCELLED: { label: "已取消", color: "text-gray-400" },
  REFUNDED: { label: "已退款", color: "text-gray-400" },
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const { success } = await searchParams

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { photo: true } },
        },
      },
      payment: true,
      address: true,
    },
  })

  if (!order) notFound()

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "text-gray-500" }
  const isPaid = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        {/* 成功提示 */}
        {success && isPaid && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-green-800">支付成功！</h2>
              <p className="text-sm text-green-700 mt-1">
                感谢您的购买。数字商品下载链接已发送至您的邮箱，也可在下方直接下载。
              </p>
            </div>
          </div>
        )}

        {/* 订单头 */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-semibold text-xl mb-1">订单 {order.orderNo}</h1>
              <p className="text-sm text-muted-foreground">
                下单时间：{order.createdAt.toLocaleString("zh-CN")}
              </p>
            </div>
            <span className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* 订单商品 */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            购买内容
          </h2>
          <div className="space-y-4">
            {order.items.map((item: any) => {
              const isDigital = item.product.type === "DIGITAL"
              const canDownload = isPaid && isDigital && item.downloadToken

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b border-border last:border-0"
                >
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.photo.previewUrl}
                      alt={item.product.photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.photo.title}</p>
                    <p className="text-sm text-muted-foreground">{item.product.name}</p>
                    {canDownload && item.tokenExpiresAt && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        下载有效期至 {item.tokenExpiresAt.toLocaleDateString("zh-CN")}
                        {" · "}
                        已下载 {item.downloadCount}/{item.maxDownloads} 次
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                    {canDownload && (
                      <a
                        href={`/api/download/${item.downloadToken}`}
                        className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        下载原图
                      </a>
                    )}
                    {isDigital && !isPaid && (
                      <p className="text-xs text-muted-foreground mt-1">付款后可下载</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 收货地址 */}
        {order.address && (
          <div className="bg-white border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-3">收货地址</h2>
            <p className="text-sm">
              {order.address.name} · {order.address.phone}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {order.address.province}{order.address.city}{order.address.district}
              {order.address.street}
            </p>
          </div>
        )}

        {/* 订单合计 */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted-foreground">商品小计</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t mt-3">
            <span>实付金额</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
          {order.payment && (
            <p className="text-xs text-muted-foreground mt-2">
              支付方式：
              {order.payment.method === "ALIPAY" && "支付宝"}
              {order.payment.method === "WECHAT" && "微信支付"}
              {order.payment.method === "STRIPE" && "信用卡"}
              {order.payment.paidAt && ` · ${order.payment.paidAt.toLocaleString("zh-CN")}`}
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary">
            继续浏览作品 →
          </Link>
        </div>
      </div>
    </div>
  )
}
