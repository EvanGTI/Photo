import { NextResponse } from "next/server"
import { verifyAlipayNotify } from "@/lib/payments/alipay"
import { prisma } from "@/lib/prisma"
import { generateDownloadTokens } from "@/lib/download"

export async function POST(req: Request) {
  const formData = await req.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => {
    params[key] = value.toString()
  })

  // 验签
  const isValid = verifyAlipayNotify(params)
  if (!isValid) {
    return new Response("fail", { status: 400 })
  }

  const { trade_status, out_trade_no, trade_no } = params

  if (trade_status === "TRADE_SUCCESS" || trade_status === "TRADE_FINISHED") {
    const payment = await prisma.payment.findUnique({
      where: { outTradeNo: out_trade_no },
    })

    if (payment && payment.status !== "PAID") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { outTradeNo: out_trade_no },
          data: {
            status: "PAID",
            transactionId: trade_no,
            paidAt: new Date(),
            rawResponse: params as any,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        }),
      ])
      await generateDownloadTokens(payment.orderId)
    }
  }

  return new Response("success", { status: 200 })
}
