"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DayRevenue {
  date: string
  revenue: number
  orders: number
}

export default function RevenueChart() {
  const [data, setData] = useState<DayRevenue[]>([])

  useEffect(() => {
    fetch("/api/admin/stats/revenue")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Mock 数据（API 未配置时）
        const mock = Array.from({ length: 30 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))
          return {
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            revenue: Math.floor(Math.random() * 3000 + 200),
            orders: Math.floor(Math.random() * 8 + 1),
          }
        })
        setData(mock)
      })
  }, [])

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `¥${v}`}
        />
        <Tooltip
          formatter={(value: unknown) => [`¥${(value as number).toFixed(2)}`, "收入"]}
          labelStyle={{ fontSize: 12 }}
          contentStyle={{
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#1a1a1a"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
