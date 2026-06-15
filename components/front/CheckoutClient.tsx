"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import PaymentModal from "@/components/front/PaymentModal"
import { Package, Truck } from "lucide-react"

const guestSchema = z.object({
  name: z.string().min(2, "请输入姓名"),
  email: z.string().email("请输入有效邮箱"),
})

const addressSchema = z.object({
  name: z.string().min(2, "请输入收件人姓名"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效手机号"),
  province: z.string().min(1, "请选择省份"),
  city: z.string().min(1, "请输入城市"),
  district: z.string().min(1, "请输入区/县"),
  street: z.string().min(5, "请输入详细地址"),
})

type GuestFormData = z.infer<typeof guestSchema>
type AddressFormData = z.infer<typeof addressSchema>

const PROVINCES = [
  "北京市", "上海市", "天津市", "重庆市",
  "广东省", "浙江省", "江苏省", "四川省",
  "湖北省", "湖南省", "山东省", "河南省",
  "福建省", "陕西省", "云南省", "安徽省",
  "河北省", "山西省", "辽宁省", "吉林省",
  "黑龙江省", "江西省", "贵州省", "甘肃省",
  "新疆维吾尔自治区", "西藏自治区", "广西壮族自治区",
  "内蒙古自治区", "宁夏回族自治区", "海南省",
  "香港特别行政区", "澳门特别行政区",
]

export default function CheckoutClient() {
  const { items, totalAmount } = useCartStore()
  const [showPayment, setShowPayment] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsAddress = items.some((i) => i.productType === "PRINT")

  const guestForm = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  })

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  const handleSubmit = async () => {
    const guestValid = await guestForm.trigger()
    const addressValid = needsAddress ? await addressForm.trigger() : true
    if (!guestValid || !addressValid) return

    setIsSubmitting(true)
    try {
      const body: any = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        guestEmail: guestForm.getValues("email"),
        guestName: guestForm.getValues("name"),
      }
      if (needsAddress) {
        body.address = addressForm.getValues()
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("创建订单失败")
      const { orderId: newOrderId } = await res.json()
      setOrderId(newOrderId)
      setShowPayment(true)
    } catch (err) {
      alert("创建订单失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>购物车是空的</p>
        <a href="/gallery" className="mt-4 text-sm text-primary hover:underline block">
          去浏览作品
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="grid lg:grid-cols-5 gap-8">
        {/* ─── 左侧：表单 ─── */}
        <div className="lg:col-span-3 space-y-6">
          {/* 联系信息 */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              联系信息
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">姓名</label>
                <input
                  {...guestForm.register("name")}
                  placeholder="您的姓名"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {guestForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {guestForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">邮箱</label>
                <input
                  {...guestForm.register("email")}
                  type="email"
                  placeholder="用于接收订单通知和下载链接"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {guestForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {guestForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 收货地址（仅实体商品） */}
          {needsAddress && (
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                收货地址
              </h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">收件人</label>
                    <input
                      {...addressForm.register("name")}
                      placeholder="收件人姓名"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {addressForm.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">手机号</label>
                    <input
                      {...addressForm.register("phone")}
                      placeholder="11位手机号"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {addressForm.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">省份</label>
                    <select
                      {...addressForm.register("province")}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    >
                      <option value="">选择省份</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">城市</label>
                    <input
                      {...addressForm.register("city")}
                      placeholder="城市"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">区/县</label>
                    <input
                      {...addressForm.register("district")}
                      placeholder="区/县"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">详细地址</label>
                  <input
                    {...addressForm.register("street")}
                    placeholder="街道、门牌号、小区名称等"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 右侧：订单摘要 ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold mb-4">订单摘要</h2>

            <ul className="space-y-3 mb-6">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.previewUrl}
                      alt={item.photoTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.photoTitle}</p>
                    <p className="text-xs text-muted-foreground">{item.productName}</p>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">小计</span>
                <span>{formatPrice(totalAmount())}</span>
              </div>
              {needsAddress && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">运费</span>
                  <span className="text-green-600">免费</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>合计</span>
                <span>{formatPrice(totalAmount())}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "处理中..." : "去支付"}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              🔒 您的信息将被安全加密传输
            </p>
          </div>
        </div>
      </div>

      {/* 支付弹窗 */}
      {showPayment && orderId && (
        <PaymentModal
          orderId={orderId}
          amount={totalAmount()}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  )
}
