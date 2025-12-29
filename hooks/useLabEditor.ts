'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'

export interface LabFormData {
  id?: string
  slug: string
  title: string
  overview: string
  architecture: string
  setupDeployment: string
  troubleshooting: string
  businessUse: string
  workflowSvg: string
  githubUrl: string
  metaDescription: string
  tags: string[]
  featured: boolean
  status: string
}

interface UseLabEditorOptions {
  initialData?: Partial<LabFormData>
  autoGenerateSlug?: boolean
}

interface UseLabEditorReturn {
  formData: LabFormData
  updateField: <K extends keyof LabFormData>(field: K, value: LabFormData[K]) => void
  updateSection: (section: keyof Pick<LabFormData, 'overview' | 'architecture' | 'setupDeployment' | 'troubleshooting' | 'businessUse'>, value: string) => void
  errors: Partial<Record<keyof LabFormData, string>>
  saveLab: (publish?: boolean) => Promise<void>
  deleteLab: () => Promise<void>
  isSaving: boolean
  isDirty: boolean
}

const defaultFormData: LabFormData = {
  slug: '',
  title: '',
  overview: '',
  architecture: '',
  setupDeployment: '',
  troubleshooting: '',
  businessUse: '',
  workflowSvg: '',
  githubUrl: '',
  metaDescription: '',
  tags: [],
  featured: false,
  status: 'draft',
}

export function useLabEditor({
  initialData,
  autoGenerateSlug = true,
}: UseLabEditorOptions = {}): UseLabEditorReturn {
  const router = useRouter()
  const [formData, setFormData] = useState<LabFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LabFormData, string>>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateSlug && formData.title && !initialData?.id) {
      const generatedSlug = slugify(formData.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'\"!:@]/g,
      })
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title, autoGenerateSlug, initialData?.id])

  // Update single field
  const updateField = useCallback(<K extends keyof LabFormData>(
    field: K,
    value: LabFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    // Clear error for field
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  // Update section (convenience method)
  const updateSection = useCallback((
    section: keyof Pick<LabFormData, 'overview' | 'architecture' | 'setupDeployment' | 'troubleshooting' | 'businessUse'>,
    value: string
  ) => {
    updateField(section, value)
  }, [updateField])

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof LabFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.overview.trim()) {
      newErrors.overview = 'Overview is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Save lab
  const saveLab = useCallback(async (publish = false) => {
    if (!validate()) {
      throw new Error('Validation failed')
    }

    setIsSaving(true)
    try {
      const isUpdate = !!initialData?.id
      const endpoint = isUpdate ? `/api/labs/${formData.slug}` : '/api/labs'
      const method = isUpdate ? 'PUT' : 'POST'

      const body = {
        ...formData,
        status: publish ? 'published' : formData.status,
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save lab')
      }

      const result = await response.json()
      setIsDirty(false)

      // Update form data with server response
      if (result.data) {
        setFormData((prev) => ({
          ...prev,
          id: result.data.id,
          slug: result.data.slug,
        }))
      }

      return result
    } finally {
      setIsSaving(false)
    }
  }, [formData, initialData?.id, validate])

  // Delete lab
  const deleteLab = useCallback(async () => {
    if (!initialData?.id) {
      throw new Error('Cannot delete unsaved lab')
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/labs/${formData.slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete lab')
      }

      router.push('/editor/labs')
    } finally {
      setIsSaving(false)
    }
  }, [formData.slug, initialData?.id, router])

  return {
    formData,
    updateField,
    updateSection,
    errors,
    saveLab,
    deleteLab,
    isSaving,
    isDirty,
  }
}
