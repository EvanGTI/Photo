"use client"

import { useCartStore } from "@/store/cart"
import { formatPrice, cn } from "@/lib/utils"
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalAmount } =
    useCartStore()

  // 关闭时禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      {/* 遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* 抽屉 */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl",
          "transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-semibold text-lg">
              购物车
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({items.length} 件)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p className="text-sm">购物车是空的</p>
              <Link
                href="/gallery"
                onClick={closeCart}
                className="text-sm text-primary hover:underline"
              >
                浏览作品集
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.productId} className="px-6 py-4 flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.previewUrl}
                      alt={item.photoTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.photoTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.productName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.productType === "DIGITAL" ||
                      item.productType === "LICENSE" ? (
                        <span className="text-xs text-muted-foreground">× 1</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="h-6 w-6 flex items-center justify-center rounded border hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="h-6 w-6 flex items-center justify-center rounded border hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">合计</span>
              <span className="text-xl font-bold">
                {formatPrice(totalAmount())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-3 bg-primary text-primary-foreground text-center text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              去结算
            </Link>
            <button
              onClick={closeCart}
              className="block w-full py-2 mt-2 text-center text-sm text-muted-foreground hover:text-primary"
            >
              继续购物
            </button>
          </div>
        )}
      </div>
    </>
  )
}
