import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOrderNo } from "@/lib/utils"
import { z } from "zod"

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  guestEmail: z.string().email(),
  guestName: z.string().min(1),
  address: z
    .object({
      name: z.string(),
      phone: z.string(),
      province: z.string(),
      city: z.string(),
      district: z.string(),
      street: z.string(),
    })
    .optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = orderSchema.parse(body)

    // 验证商品存在且有效
    const productIds = data.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "部分商品不存在或已下架" }, { status: 400 })
    }

    // 计算总价（以服务端价格为准）
    const totalAmount = products.reduce((sum: number, product: any) => {
      const item = data.items.find((i: { productId: string }) => i.productId === product.id)!
      return sum + Number(product.price) * item.quantity
    }, 0)

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        totalAmount,
        status: "PENDING",
        items: {
          create: data.items.map((item: { productId: string; quantity: number }) => {
            const product = products.find((p: any) => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(product.price),
            }
          }),
        },
        ...(data.address
          ? {
              address: {
                create: data.address,
              },
            }
          : {}),
      },
    })

    return NextResponse.json({ orderId: order.id, orderNo: order.orderNo })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error("Create order error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
