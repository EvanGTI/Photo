export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Eye,
  Camera,
} from "lucide-react"
import RevenueChart from "@/components/admin/RevenueChart"

async function getDashboardStats() {
  const [
    totalOrders,
    paidOrders,
    totalRevenue,
    totalPhotos,
    recentOrders,
    topPhotos,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PAID", "COMPLETED"] } } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "COMPLETED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.photo.count({ where: { published: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { include: { photo: true } } } } },
    }),
    prisma.photo.findMany({
      where: { published: true },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { title: true, viewCount: true, previewUrl: true, slug: true },
    }),
  ])

  return { totalOrders, paidOrders, totalRevenue, totalPhotos, recentOrders, topPhotos }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const revenue = Number(stats.totalRevenue._sum.totalAmount || 0)

  const cards = [
    {
      title: "总收入",
      value: formatPrice(revenue),
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "已付订单",
      value: stats.paidOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "全部订单",
      value: stats.totalOrders.toString(),
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "在售作品",
      value: stats.totalPhotos.toString(),
      icon: Camera,
      color: "text-orange-600 bg-orange-50",
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">数据看板</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 收入趋势图 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">收入趋势（近 30 天）</h2>
          <RevenueChart />
        </div>

        {/* 热门作品 */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            热门作品
          </h2>
          <ul className="space-y-3">
            {stats.topPhotos.map((photo: { slug: string; title: string; previewUrl: string; viewCount: number }, i: number) => (
              <li key={photo.slug} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{photo.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {photo.viewCount} 次浏览
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="mt-6 bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最近订单</h2>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">
            查看全部
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">订单号</th>
                <th className="pb-3 font-medium">客户</th>
                <th className="pb-3 font-medium">作品</th>
                <th className="pb-3 font-medium">金额</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-mono text-xs">{order.orderNo}</td>
                  <td className="py-3">{order.guestName || "—"}</td>
                  <td className="py-3 truncate max-w-[150px]">
                    {order.items[0]?.product.photo.title || "—"}
                  </td>
                  <td className="py-3 font-semibold">
                    {formatPrice(Number(order.totalAmount))}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        order.status === "PAID" || order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status === "PENDING" ? "待付款" :
                       order.status === "PAID" ? "已付款" :
                       order.status === "COMPLETED" ? "已完成" : order.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground text-xs">
                    {order.createdAt.toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
