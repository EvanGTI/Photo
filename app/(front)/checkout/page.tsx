import type { Metadata } from "next"
import CheckoutClient from "@/components/front/CheckoutClient"

export const metadata: Metadata = { title: "结算" }

export default function CheckoutPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-light mb-8">结算</h1>
        <CheckoutClient />
      </div>
    </div>
  )
}
