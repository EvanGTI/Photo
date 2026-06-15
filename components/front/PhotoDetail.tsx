"use client"

import Image from "next/image"
import { useState } from "react"
import { useCartStore } from "@/store/cart"
import { formatPrice, cn } from "@/lib/utils"
import {
  ShoppingBag,
  Check,
  Download,
  Printer,
  Shield,
  Calendar,
  Camera,
  ChevronRight,
} from "lucide-react"

interface Product {
  id: string
  type: "DIGITAL" | "PRINT" | "LICENSE" | "SERVICE"
  name: string
  description: string | null
  price: number | string
  specs: any
  stock: number | null
}

interface Photo {
  id: string
  title: string
  slug: string
  description: string | null
  story: string | null
  category: string
  tags: string[]
  previewUrl: string
  width: number
  height: number
  exif: any
  products: Product[]
  viewCount: number
}

const ProductTypeIcon = {
  DIGITAL: Download,
  PRINT: Printer,
  LICENSE: Shield,
  SERVICE: Calendar,
}

const ProductTypeLabel = {
  DIGITAL: "数字下载",
  PRINT: "印刷品",
  LICENSE: "版权授权",
  SERVICE: "定制服务",
}

export default function PhotoDetail({ photo }: { photo: Photo }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    photo.products[0] || null
  )
  const [added, setAdded] = useState(false)
  const { addItem, hasItem, openCart } = useCartStore()

  const handleAddToCart = () => {
    if (!selectedProduct) return
    addItem({
      productId: selectedProduct.id,
      photoId: photo.id,
      photoTitle: photo.title,
      previewUrl: photo.previewUrl,
      productName: selectedProduct.name,
      productType: selectedProduct.type,
      price: Number(selectedProduct.price),
      currency: "CNY",
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const alreadyInCart = selectedProduct ? hasItem(selectedProduct.id) : false

  const exif = photo.exif as any

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* ─── 照片预览 ─── */}
          <div className="sticky top-24">
            <div className="relative bg-muted rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={photo.previewUrl}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto protected"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                quality={90}
              />
              {/* 水印提示 */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                © Lens & Light — 含水印预览
              </div>
            </div>

            {/* EXIF 信息 */}
            {exif && (
              <div className="mt-4 p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">拍摄参数</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {exif.camera && <div><span className="text-foreground">机身：</span>{exif.camera}</div>}
                  {exif.lens && <div><span className="text-foreground">镜头：</span>{exif.lens}</div>}
                  {exif.aperture && <div><span className="text-foreground">光圈：</span>{exif.aperture}</div>}
                  {exif.shutter && <div><span className="text-foreground">快门：</span>{exif.shutter}</div>}
                  {exif.iso && <div><span className="text-foreground">ISO：</span>{exif.iso}</div>}
                  {exif.focalLength && <div><span className="text-foreground">焦距：</span>{exif.focalLength}</div>}
                </div>
              </div>
            )}
          </div>

          {/* ─── 作品信息 + 购买 ─── */}
          <div>
            {/* 面包屑 */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
              <a href="/gallery" className="hover:text-primary">作品集</a>
              <ChevronRight className="h-3 w-3" />
              <a href={`/gallery?category=${photo.category}`} className="hover:text-primary capitalize">
                {photo.category}
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{photo.title}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-light mb-2">{photo.title}</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {photo.viewCount} 次浏览
            </p>

            {photo.description && (
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {photo.description}
              </p>
            )}

            {photo.story && (
              <div className="mb-6 p-4 border-l-2 border-accent bg-accent/5 rounded-r-lg">
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  {photo.story}
                </p>
              </div>
            )}

            {/* 标签 */}
            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {photo.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/gallery?tag=${tag}`}
                    className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full hover:bg-muted/80"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            )}

            {/* ─── 产品选择 ─── */}
            {photo.products.length > 0 ? (
              <div>
                <h2 className="font-semibold text-sm uppercase tracking-wide mb-4">
                  选择版本
                </h2>
                <div className="space-y-3 mb-6">
                  {photo.products.map((product) => {
                    const Icon = ProductTypeIcon[product.type]
                    const isSelected = selectedProduct?.id === product.id
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatPrice(Number(product.price))}
                            </p>
                            {product.stock !== null && product.stock <= 5 && (
                              <p className="text-xs text-orange-500">
                                仅剩 {product.stock} 件
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 规格详情 */}
                        {product.specs && isSelected && (
                          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-1.5">
                            {Object.entries(product.specs as Record<string, string>).map(
                              ([key, val]) => (
                                <div key={key} className="text-xs text-muted-foreground">
                                  <span className="text-foreground">{key}：</span>
                                  {val}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* 加入购物车 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedProduct}
                    className={cn(
                      "flex-1 py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                      added
                        ? "bg-green-600 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4" />
                        已加入购物车
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        加入购物车
                      </>
                    )}
                  </button>
                  {alreadyInCart && (
                    <button
                      onClick={openCart}
                      className="px-6 py-4 border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors"
                    >
                      查看购物车
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  🔒 安全支付 · 支付宝 · 微信 · 信用卡
                </p>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-xl text-center text-muted-foreground text-sm">
                该作品暂无可购买版本
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
