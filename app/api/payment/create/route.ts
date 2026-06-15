import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOutTradeNo } from "@/lib/utils"
import { createStripeCheckout } from "@/lib/payments/stripe"
import { createAlipayPagePay } from "@/lib/payments/alipay"
import { createWechatNativePay } from "@/lib/payments/wechat"
import { z } from "zod"

const schema = z.object({
  orderId: z.string(),
  method: z.enum(["alipay", "wechat", "stripe"]),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, method } = schema.parse(body)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { include: { photo: true } } } },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 })
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "订单状态不允许支付" }, { status: 400 })
    }

    const outTradeNo = generateOutTradeNo()

    // 创建支付记录
    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method: method.toUpperCase() as any,
        status: "PENDING",
        amount: order.totalAmount,
        outTradeNo,
      },
      update: {
        method: method.toUpperCase() as any,
        outTradeNo,
        status: "PENDING",
      },
    })

    const subject = `Lens & Light 摄影作品 - ${order.orderNo}`
    const totalAmount = Number(order.totalAmount)
    const notifyBase = `${appUrl}/api/webhooks`

    if (method === "stripe") {
      const session = await createStripeCheckout({
        orderId: order.id,
        orderNo: order.orderNo,
        items: order.items.map((item: any) => ({
          name: `${item.product.photo.title} - ${item.product.name}`,
          amount: Number(item.unitPrice.toString()),
          quantity: item.quantity,
        })),
        currency: "cny",
        successUrl: `${appUrl}/orders/${order.id}?success=1`,
        cancelUrl: `${appUrl}/checkout`,
      })
      return NextResponse.json({ url: session.url })
    }

    if (method === "alipay") {
      const payUrl = await createAlipayPagePay({
        outTradeNo,
        subject,
        totalAmount: totalAmount.toFixed(2),
        returnUrl: `${appUrl}/orders/${order.id}?success=1`,
        notifyUrl: `${notifyBase}/alipay`,
      })
      return NextResponse.json({ url: payUrl })
    }

    if (method === "wechat") {
      const result = await createWechatNativePay({
        outTradeNo,
        description: subject,
        totalFen: Math.round(totalAmount * 100),
        notifyUrl: `${notifyBase}/wechat`,
      })
      return NextResponse.json({ qrCodeUrl: result.code_url })
    }

    return NextResponse.json({ error: "不支持的支付方式" }, { status: 400 })
  } catch (err) {
    console.error("Payment create error:", err)
    return NextResponse.json({ error: "支付发起失败" }, { status: 500 })
  }
}
