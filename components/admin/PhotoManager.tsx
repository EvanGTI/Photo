"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  title: string
  slug: string
  category: string
  previewUrl: string
  published: boolean
  featured: boolean
  viewCount: number
  products: { id: string; type: string; price: number | string }[]
}

interface PhotoManagerProps {
  photos: Photo[]
}

export default function PhotoManager({ photos: initialPhotos }: PhotoManagerProps) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadForm, setShowUploadForm] = useState(false)

  // 上传队列
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setUploadProgress(0)

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", file.name.replace(/\.[^.]+$/, ""))

        try {
          const res = await fetch("/api/admin/photos", {
            method: "POST",
            body: formData,
          })
          if (res.ok) {
            const newPhoto = await res.json()
            setPhotos((prev) => [newPhoto, ...prev])
          }
        } catch (err) {
          console.error("Upload failed:", err)
        }

        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100))
      }

      setUploading(false)
      setUploadProgress(0)
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".tiff"] },
    multiple: true,
  })

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    })
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !published } : p))
    )
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    })
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p))
    )
  }

  const deletePhoto = async (id: string) => {
    if (!confirm("确定要删除这张照片吗？此操作不可撤销。")) return
    await fetch(`/api/admin/photos/${id}`, { method: "DELETE" })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      {/* 上传区 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors mb-8",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">上传中 {uploadProgress}%</p>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div>
              <p className="font-medium">
                {isDragActive ? "释放文件以上传" : "拖放照片到此处"}
              </p>
              <p className="text-sm mt-1">或点击选择文件 · 支持 JPG、PNG、WEBP、TIFF</p>
            </div>
          </div>
        )}
      </div>

      {/* 统计 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          共 {photos.length} 张照片 ·{" "}
          {photos.filter((p) => p.published).length} 张已发布
        </p>
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground">
            按分类筛选（开发中）
          </span>
        </div>
      </div>

      {/* 照片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative rounded-xl overflow-hidden bg-muted border border-border"
          >
            <div className="relative aspect-square">
              <Image
                src={photo.previewUrl}
                alt={photo.title}
                fill
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => togglePublish(photo.id, photo.published)}
                    className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/40 transition-colors"
                    title={photo.published ? "取消发布" : "发布"}
                  >
                    {photo.published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleFeatured(photo.id, photo.featured)}
                    className={cn(
                      "p-1.5 rounded-lg text-white transition-colors",
                      photo.featured
                        ? "bg-accent/80 hover:bg-accent"
                        : "bg-white/20 hover:bg-white/40"
                    )}
                    title={photo.featured ? "取消精选" : "设为精选"}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={`/admin/photos/${photo.id}/edit`}
                    className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/40 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5">
              <p className="text-xs font-medium truncate">{photo.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{photo.category}</span>
                <div className="flex gap-1">
                  {photo.featured && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-amber-700 rounded">
                      精选
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      photo.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {photo.published ? "已发布" : "草稿"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {photo.products.length} 种版本
              </p>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && !uploading && (
        <div className="text-center py-16 text-muted-foreground">
          <p>还没有照片，拖拽照片到上方开始上传。</p>
        </div>
      )}
    </div>
  )
}
