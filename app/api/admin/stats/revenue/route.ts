import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // 最近 30 天每日收入
  const since = new Date()
  since.setDate(since.getDate() - 29)

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "COMPLETED"] },
      createdAt: { gte: since },
    },
    select: { totalAmount: true, createdAt: true },
  })

  // 按日聚合
  const map: Record<string, { revenue: number; orders: number }> = {}

  for (let i = 0; i < 30; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    map[key] = { revenue: 0, orders: 0 }
  }

  for (const order of orders) {
    const d = new Date(order.createdAt)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    if (map[key]) {
      map[key].revenue += Number(order.totalAmount)
      map[key].orders += 1
    }
  }

  const data = Object.entries(map).map(([date, v]) => ({ date, ...v }))

  return NextResponse.json(data)
}
