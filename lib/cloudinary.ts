import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

/** 上传原图到私有文件夹 */
export async function uploadRawPhoto(
  filePath: string,
  folder = "photography/raw"
) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
    access_mode: "authenticated", // 私有访问
    use_asset_folder_as_public_id_prefix: false,
  })
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

/** 生成带水印的预览图 URL */
export function getPreviewUrl(publicId: string, watermarkText = "© LENS & LIGHT") {
  return cloudinary.url(publicId, {
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1800, crop: "limit" },
      {
        overlay: {
          font_family: "Arial",
          font_size: 36,
          font_weight: "bold",
          text: watermarkText,
        },
        color: "#ffffff",
        opacity: 60,
        gravity: "south_east",
        x: 20,
        y: 20,
      },
    ],
    secure: true,
  })
}

/** 生成有时效的私有下载 URL（15 分钟） */
export function getPrivateDownloadUrl(publicId: string, expiresIn = 900) {
  const expires = Math.floor(Date.now() / 1000) + expiresIn
  return cloudinary.url(publicId, {
    sign_url: true,
    expires_at: expires,
    attachment: true,
    secure: true,
  })
}

/** 上传并自动生成预览 */
export async function uploadPhotoWithPreview(
  buffer: Buffer,
  filename: string
) {
  // 上传原图（私有）
  const raw = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "photography/raw",
        public_id: `raw_${Date.now()}_${filename}`,
        resource_type: "image",
        access_mode: "authenticated",
      },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })

  // 上传预览图（公开，带水印将在 URL 层处理）
  const preview = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "photography/preview",
        public_id: `preview_${Date.now()}_${filename}`,
        resource_type: "image",
        access_mode: "public",
        transformation: [
          { quality: 85, fetch_format: "auto" },
          { width: 2400, crop: "limit" },
        ],
      },
      (err, result) => {
        if (err) reject(err)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })

  return {
    raw: { url: raw.secure_url, publicId: raw.public_id },
    preview: {
      url: getPreviewUrl(preview.public_id),
      publicId: preview.public_id,
      width: preview.width,
      height: preview.height,
    },
  }
}
