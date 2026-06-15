"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart"
import { formatPrice, cn } from "@/lib/utils"
import { X, QrCode, CreditCard, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"

interface PaymentModalProps {
  orderId: string
  amount: number
  onClose: () => void
}

type PayMethod = "alipay" | "wechat" | "stripe"

export default function PaymentModal({ orderId, amount, onClose }: PaymentModalProps) {
  const router = useRouter()
  const { clearCart } = useCartStore()

  const [method, setMethod] = useState<PayMethod>("alipay")
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [stripeUrl, setStripeUrl] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [paid, setPaid] = useState(false)

  // 轮询支付状态（支付宝/微信扫码后）
  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderId}`)
        const { status } = await res.json()
        if (status === "PAID") {
          setPaid(true)
          setPolling(false)
          clearCart()
          setTimeout(() => {
            router.push(`/orders/${orderId}?success=1`)
          }, 2000)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [polling, orderId, router, clearCart])

  const handlePay = async () => {
    setLoading(true)
    setQrCode(null)
    setStripeUrl(null)

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method }),
      })
      const data = await res.json()

      if (method === "stripe" && data.url) {
        // Stripe 跳转
        window.location.href = data.url
      } else if (method === "alipay" && data.url) {
        // 支付宝 PC/H5 跳转
        window.location.href = data.url
      } else if (method === "wechat" && data.qrCodeUrl) {
        // 微信 Native 二维码
        setQrCode(data.qrCodeUrl)
        setPolling(true)
      }
    } catch {
      alert("发起支付失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  if (paid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold">支付成功！</h2>
          <p className="text-muted-foreground text-sm">正在跳转到订单详情...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-lg">选择支付方式</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 金额 */}
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">应付金额</p>
            <p className="text-4xl font-bold mt-1">{formatPrice(amount)}</p>
          </div>

          {/* 支付方式选择 */}
          {!qrCode && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "alipay" as PayMethod,
                  label: "支付宝",
                  icon: "/icons/alipay.svg",
                  color: "#1677ff",
                },
                {
                  id: "wechat" as PayMethod,
                  label: "微信支付",
                  icon: "/icons/wechat.svg",
                  color: "#07c160",
                },
                {
                  id: "stripe" as PayMethod,
                  label: "信用卡",
                  icon: null,
                  color: "#635bff",
                },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={cn(
                    "py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                    method === pm.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {pm.icon ? (
                    <Image src={pm.icon} alt={pm.label} width={28} height={28} />
                  ) : (
                    <CreditCard className="h-7 w-7 text-[#635bff]" />
                  )}
                  <span className="text-xs font-medium">{pm.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 微信二维码 */}
          {qrCode && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                请使用微信扫一扫完成支付
              </p>
              <div className="p-4 bg-white border-2 border-[#07c160] rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`}
                  alt="微信支付二维码"
                  width={180}
                  height={180}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[#07c160]" />
                等待支付中...
              </div>
              <button
                onClick={() => { setQrCode(null); setPolling(false) }}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                更换支付方式
              </button>
            </div>
          )}

          {/* 支付按钮 */}
          {!qrCode && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                `立即支付 ${formatPrice(amount)}`
              )}
            </button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            点击支付即表示您同意
            <a href="/terms" className="text-primary hover:underline mx-1">服务条款</a>
            和
            <a href="/privacy" className="text-primary hover:underline mx-1">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  )
}
