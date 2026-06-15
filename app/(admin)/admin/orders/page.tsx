export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "待付款", className: "bg-orange-100 text-orange-700" },
  PAID: { label: "已付款", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "备货中", className: "bg-blue-100 text-blue-600" },
  SHIPPED: { label: "已发货", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "已签收", className: "bg-green-100 text-green-700" },
  COMPLETED: { label: "已完成", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", className: "bg-gray-100 text-gray-500" },
  REFUNDED: { label: "已退款", className: "bg-gray-100 text-gray-500" },
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const pageNum = parseInt(page || "1")
  const pageSize = 20

  const where = status ? { status: status as any } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">订单管理</h1>
        <p className="text-sm text-muted-foreground">共 {total} 条订单</p>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "", label: "全部" },
          ...Object.entries(STATUS_LABELS).map(([value, { label }]) => ({
            value,
            label,
          })),
        ].map((s) => (
          <a
            key={s.value}
            href={s.value ? `?status=${s.value}` : "?"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (status || "") === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* 订单表格 */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">支付</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const statusInfo = STATUS_LABELS[order.status]
                return (
                  <tr
                    key={order.id}
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {order.orderNo}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.guestName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{order.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate max-w-[160px]">
                        {order.items.map((i: any) => i.product.name).join("、")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} 件
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.payment?.method === "ALIPAY" && "支付宝"}
                      {order.payment?.method === "WECHAT" && "微信"}
                      {order.payment?.method === "STRIPE" && "信用卡"}
                      {!order.payment && "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        详情
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${status ? `status=${status}&` : ""}page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                p === pageNum
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
