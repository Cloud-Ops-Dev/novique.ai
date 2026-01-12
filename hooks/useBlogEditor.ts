import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'

export interface BlogPostData {
  id?: string
  slug: string
  title: string
  summary: string
  content: string
  markdownContent?: string
  metaDescription?: string
  tags: string[]
  headerImage?: string
  featured: boolean
  status: 'draft' | 'pending_review' | 'scheduled' | 'published'
  // Social metadata (source of truth for platform adapters)
  keyInsights?: string[] // 3 bullet points for social distribution
  coreTakeaway?: string // Single sentence summary for sharp posts
}

interface UseBlogEditorOptions {
  initialData?: Partial<BlogPostData>
  autoGenerateSlug?: boolean
}

export function useBlogEditor({
  initialData,
  autoGenerateSlug = true,
}: UseBlogEditorOptions = {}) {
  const router = useRouter()
  const [formData, setFormData] = useState<BlogPostData>({
    id: initialData?.id,
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    markdownContent: initialData?.markdownContent || '',
    metaDescription: initialData?.metaDescription || '',
    tags: initialData?.tags || [],
    headerImage: initialData?.headerImage || '',
    featured: initialData?.featured || false,
    status: initialData?.status || 'draft',
    // Social metadata
    keyInsights: initialData?.keyInsights || [],
    coreTakeaway: initialData?.coreTakeaway || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Update form field
  const updateField = useCallback(
    (field: keyof BlogPostData, value: any) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value }

        // Auto-generate slug from title if enabled
        if (field === 'title' && autoGenerateSlug && !prev.slug) {
          updated.slug = slugify(value, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
          })
        }

        return updated
      })

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [autoGenerateSlug, errors]
  )

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required'
    } else if (formData.summary.length > 300) {
      newErrors.summary = 'Summary must be 300 characters or less'
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Save post (draft or publish)
  const savePost = useCallback(
    async (publish: boolean = false) => {
      if (!validate()) {
        return null
      }

      setIsSaving(true)

      try {
        const endpoint = formData.id ? `/api/blog/${formData.slug}` : '/api/blog'
        const method = formData.id ? 'PUT' : 'POST'

        const postData = {
          ...formData,
          status: publish ? 'published' : formData.status,
        }

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to save post')
        }

        const result = await response.json()
        return result.data
      } catch (error) {
        console.error('Save error:', error)
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [formData, validate]
  )

  // Delete post
  const deletePost = useCallback(async () => {
    if (!formData.id) return

    try {
      const response = await fetch(`/api/blog/${formData.slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      router.push('/admin/blog')
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }, [formData.id, formData.slug, router])

  return {
    formData,
    updateField,
    errors,
    validate,
    savePost,
    deletePost,
    isSaving,
  }
}
