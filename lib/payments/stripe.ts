import Stripe from "stripe"

// 懒加载，避免构建时因缺少 API Key 报错
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia" as any,
  })
}

/** 创建 Stripe Checkout Session */
export async function createStripeCheckout({
  orderId,
  orderNo,
  items,
  currency = "cny",
  successUrl,
  cancelUrl,
}: {
  orderId: string
  orderNo: string
  items: { name: string; amount: number; quantity: number }[]
  currency?: string
  successUrl: string
  cancelUrl: string
}) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.amount * 100), // 转为分
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orderId, orderNo },
    locale: "zh",
  })
  return session
}

/** 验证 Webhook 签名 */
export function constructStripeEvent(payload: string, sig: string) {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
