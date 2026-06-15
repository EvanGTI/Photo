import { NextResponse } from "next/server"
import { constructStripeEvent } from "@/lib/payments/stripe"
import { prisma } from "@/lib/prisma"
import { generateDownloadTokens } from "@/lib/download"

export const config = { api: { bodyParser: false } }

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") || ""

  let event: any
  try {
    event = constructStripeEvent(body, sig)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (!orderId) return NextResponse.json({ received: true })

    await handlePaymentSuccess(orderId, session.payment_intent as string)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(orderId: string, transactionId: string) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    }),
    prisma.payment.update({
      where: { orderId },
      data: {
        status: "PAID",
        transactionId,
        paidAt: new Date(),
      },
    }),
  ])
  await generateDownloadTokens(orderId)
}
