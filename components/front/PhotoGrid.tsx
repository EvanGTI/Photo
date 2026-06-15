"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Eye } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { formatPrice } from "@/lib/utils"

interface Photo {
  id: string
  title: string
  slug: string
  previewUrl: string
  width: number
  height: number
  category: string
  products: { id: string; type: string; price: number | string }[]
}

interface PhotoGridProps {
  photos: Photo[]
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const slides = photos.map((p) => ({
    src: p.previewUrl,
    alt: p.title,
    width: p.width,
    height: p.height,
  }))

  // 计算最低售价
  const getMinPrice = (photo: Photo) => {
    if (!photo.products?.length) return null
    const prices = photo.products.map((p) => Number(p.price))
    return Math.min(...prices)
  }

  return (
    <>
      {/* 瀑布流 — 使用 CSS columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => {
          const minPrice = getMinPrice(photo)
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="break-inside-avoid group relative overflow-hidden rounded-xl bg-muted cursor-pointer"
            >
              <Link href={`/photos/${photo.slug}`} className="block">
                <div className="relative overflow-hidden">
                  <Image
                    src={photo.previewUrl}
                    alt={photo.title}
                    width={photo.width}
                    height={photo.height}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 protected"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium text-sm truncate">
                        {photo.title}
                      </h3>
                      {minPrice !== null && (
                        <p className="text-white/80 text-xs mt-1">
                          起售价 {formatPrice(minPrice)}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setLightboxIndex(index)
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        title="预览"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* 灯箱 */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={slides}
        styles={{
          container: { backgroundColor: "rgba(0,0,0,0.95)" },
        }}
      />
    </>
  )
}
