import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const BUCKET_NAME = 'blog-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface ImageUploadResult {
  original: string
  medium: string
  small: string
  fileName: string
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
  }
}

/**
 * Optimize and resize image to multiple sizes
 */
async function processImage(
  buffer: Buffer,
  sizes: { width: number; suffix: string }[]
): Promise<{ suffix: string; buffer: Buffer }[]> {
  const results = await Promise.all(
    sizes.map(async ({ width, suffix }) => {
      const processed = await sharp(buffer)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()

      return { suffix, buffer: processed }
    })
  )

  return results
}

/**
 * Upload image to Supabase Storage with multiple sizes
 */
export async function uploadBlogImage(
  file: File,
  postSlug?: string
): Promise<ImageUploadResult> {
  validateImageFile(file)

  const supabase = await createClient()

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()
  const uniqueId = randomUUID()
  const baseFileName = postSlug
    ? `${postSlug}-${uniqueId}`
    : `blog-${uniqueId}`

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Process image into multiple sizes
  const sizes = [
    { width: 1200, suffix: '' }, // Original (max 1200px)
    { width: 800, suffix: '-medium' }, // Medium
    { width: 400, suffix: '-small' }, // Small
  ]

  const processedImages = await processImage(buffer, sizes)

  // Upload all sizes to Supabase Storage
  const uploadPromises = processedImages.map(async ({ suffix, buffer }) => {
    const fileName = `${baseFileName}${suffix}.${fileExtension}`
    const filePath = `uploads/${fileName}`

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return { suffix, publicUrl }
  })

  const uploadedUrls = await Promise.all(uploadPromises)

  // Map URLs to sizes
  const result: ImageUploadResult = {
    original: uploadedUrls.find((u) => u.suffix === '')?.publicUrl || '',
    medium: uploadedUrls.find((u) => u.suffix === '-medium')?.publicUrl || '',
    small: uploadedUrls.find((u) => u.suffix === '-small')?.publicUrl || '',
    fileName: `${baseFileName}.${fileExtension}`,
  }

  return result
}

/**
 * Delete blog image from storage
 */
export async function deleteBlogImage(fileName: string): Promise<void> {
  const supabase = await createClient()

  // Delete all sizes
  const suffixes = ['', '-medium', '-small']
  const baseFileName = fileName.split('.')[0]
  const extension = fileName.split('.').pop()

  const deletePromises = suffixes.map((suffix) => {
    const fullFileName = `${baseFileName}${suffix}.${extension}`
    const filePath = `uploads/${fullFileName}`

    return supabase.storage.from(BUCKET_NAME).remove([filePath])
  })

  await Promise.all(deletePromises)
}

/**
 * Create storage bucket if it doesn't exist (run this in setup)
 */
export async function ensureBlogImagesBucketExists(): Promise<void> {
  const supabase = await createClient()

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)

  if (!bucketExists) {
    // Create bucket
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    })

    if (error && !error.message.includes('already exists')) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
  }
}
