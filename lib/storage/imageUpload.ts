import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const BUCKET_NAME = 'blog-images'
const LAB_BUCKET_NAME = 'lab-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const LAB_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

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

/**
 * Validate lab workflow image file
 */
export function validateLabImageFile(file: File): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }

  // Check file type
  if (!LAB_ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed.')
  }
}

/**
 * Upload lab workflow image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadLabWorkflowImage(
  file: File,
  labSlug?: string
): Promise<string> {
  validateLabImageFile(file)

  const supabase = await createClient()

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
  const uniqueId = randomUUID()
  const baseFileName = labSlug
    ? `${labSlug}-${uniqueId}`
    : `workflow-${uniqueId}`

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let uploadBuffer: Buffer
  let contentType = file.type

  // For SVG files, upload as-is without processing
  if (file.type === 'image/svg+xml') {
    uploadBuffer = buffer
  } else {
    // For raster images, optimize with sharp
    uploadBuffer = await sharp(buffer)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()
    contentType = 'image/jpeg'
  }

  const fileName = `${baseFileName}.${file.type === 'image/svg+xml' ? 'svg' : 'jpg'}`
  const filePath = `workflows/${fileName}`

  // Note: The 'lab-images' bucket must be created manually in Supabase Dashboard
  // Go to Storage > New Bucket > Name: "lab-images", Public: true

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(LAB_BUCKET_NAME)
    .upload(filePath, uploadBuffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(LAB_BUCKET_NAME).getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete lab workflow image from storage
 */
export async function deleteLabWorkflowImage(imageUrl: string): Promise<void> {
  const supabase = await createClient()

  // Extract file path from URL
  const urlParts = imageUrl.split(`/${LAB_BUCKET_NAME}/`)
  if (urlParts.length < 2) {
    throw new Error('Invalid image URL')
  }

  const filePath = urlParts[1]
  await supabase.storage.from(LAB_BUCKET_NAME).remove([filePath])
}
