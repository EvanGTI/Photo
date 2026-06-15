import { NextResponse } from "next/server"
import { verifyWechatNotify, decryptWechatResource } from "@/lib/payments/wechat"
import { prisma } from "@/lib/prisma"
import { generateDownloadTokens } from "@/lib/download"

export async function POST(req: Request) {
  const body = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })

  const isValid = await verifyWechatNotify(headers, body)
  if (!isValid) {
    return NextResponse.json(
      { code: "FAIL", message: "验签失败" },
      { status: 400 }
    )
  }

  let data: any
  try {
    data = JSON.parse(body)
  } catch {
    return NextResponse.json({ code: "FAIL", message: "解析失败" }, { status: 400 })
  }

  if (data.event_type === "TRANSACTION.SUCCESS" && data.resource) {
    try {
      const { ciphertext, associated_data, nonce } = data.resource
      const decrypted = decryptWechatResource(ciphertext, associated_data, nonce)
      const transaction = JSON.parse(decrypted)

      if (transaction.trade_state === "SUCCESS") {
        const outTradeNo = transaction.out_trade_no
        const transactionId = transaction.transaction_id

        const payment = await prisma.payment.findUnique({
          where: { outTradeNo },
        })

        if (payment && payment.status !== "PAID") {
          await prisma.$transaction([
            prisma.payment.update({
              where: { outTradeNo },
              data: {
                status: "PAID",
                transactionId,
                paidAt: new Date(),
                rawResponse: transaction,
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
    } catch (err) {
      console.error("WeChat notify decrypt error:", err)
    }
  }

  return NextResponse.json({ code: "SUCCESS", message: "成功" })
}
