import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface CustomerData {
  id?: string
  consultation_request_id?: string

  // Basic Info
  name: string
  email: string
  phone?: string
  business_type?: string
  business_size?: string
  initial_challenges?: string

  // Stage Management
  stage: string
  project_status: string

  // Consultation Phase
  consultation_occurred_date?: string
  consultation_notes?: string

  // Proposal Phase
  investigation_notes?: string
  proposed_solutions?: string[]
  proposal_presentation_datetime?: string
  proposal_location?: string

  // Agreement Phase
  accepted_solutions?: string[]
  agreed_implementation_cost?: number
  agreed_recurring_cost?: number
  delivery_requirements?: string

  // Delivery Phase
  solution_due_date?: string
  ga_date?: string
  github_repo_url?: string
  wekan_board_url?: string

  // Implementation Phase
  demonstration_date?: string
  implementation_date?: string

  // Sign-off Phase
  signoff_date?: string
  signoff_notes?: string

  // Payment Phase
  payment_status: string
  payment_info?: string
  payment_confirmed_date?: string

  // Project Health
  current_blockers?: string
  risk_level?: string
  next_action_required?: string
  next_action_due_date?: string

  // Assignment
  assigned_admin_id?: string
}

interface UseCustomerEditorOptions {
  initialData?: Partial<CustomerData>
}

export function useCustomerEditor({
  initialData,
}: UseCustomerEditorOptions = {}) {
  const router = useRouter()
  const [formData, setFormData] = useState<CustomerData>({
    id: initialData?.id,
    consultation_request_id: initialData?.consultation_request_id,
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    business_type: initialData?.business_type || '',
    business_size: initialData?.business_size || '',
    initial_challenges: initialData?.initial_challenges || '',
    stage: initialData?.stage || 'proposal_development',
    project_status: initialData?.project_status || 'on_track',
    consultation_occurred_date: initialData?.consultation_occurred_date || '',
    consultation_notes: initialData?.consultation_notes || '',
    investigation_notes: initialData?.investigation_notes || '',
    proposed_solutions: initialData?.proposed_solutions || [],
    proposal_presentation_datetime: initialData?.proposal_presentation_datetime || '',
    proposal_location: initialData?.proposal_location || '',
    accepted_solutions: initialData?.accepted_solutions || [],
    agreed_implementation_cost: initialData?.agreed_implementation_cost,
    agreed_recurring_cost: initialData?.agreed_recurring_cost,
    delivery_requirements: initialData?.delivery_requirements || '',
    solution_due_date: initialData?.solution_due_date || '',
    ga_date: initialData?.ga_date || '',
    github_repo_url: initialData?.github_repo_url || '',
    wekan_board_url: initialData?.wekan_board_url || '',
    demonstration_date: initialData?.demonstration_date || '',
    implementation_date: initialData?.implementation_date || '',
    signoff_date: initialData?.signoff_date || '',
    signoff_notes: initialData?.signoff_notes || '',
    payment_status: initialData?.payment_status || 'not_applicable',
    payment_info: initialData?.payment_info || '',
    payment_confirmed_date: initialData?.payment_confirmed_date || '',
    current_blockers: initialData?.current_blockers || '',
    risk_level: initialData?.risk_level || '',
    next_action_required: initialData?.next_action_required || '',
    next_action_due_date: initialData?.next_action_due_date || '',
    assigned_admin_id: initialData?.assigned_admin_id,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Update form field
  const updateField = useCallback(
    (field: keyof CustomerData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Save customer
  const saveCustomer = useCallback(
    async () => {
      if (!validate()) {
        return null
      }

      setIsSaving(true)

      try {
        const endpoint = formData.id ? `/api/customers/${formData.id}` : '/api/customers'
        const method = formData.id ? 'PUT' : 'POST'

        // Clean up the data - convert empty strings to null for dates/numbers
        const cleanedData = {
          ...formData,
          agreed_implementation_cost: formData.agreed_implementation_cost || null,
          agreed_recurring_cost: formData.agreed_recurring_cost || null,
          consultation_occurred_date: formData.consultation_occurred_date || null,
          proposal_presentation_datetime: formData.proposal_presentation_datetime || null,
          solution_due_date: formData.solution_due_date || null,
          ga_date: formData.ga_date || null,
          demonstration_date: formData.demonstration_date || null,
          implementation_date: formData.implementation_date || null,
          signoff_date: formData.signoff_date || null,
          payment_confirmed_date: formData.payment_confirmed_date || null,
          next_action_due_date: formData.next_action_due_date || null,
        }

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to save customer')
        }

        const result = await response.json()

        // Update form data with saved data to get the ID if it's a new record
        if (!formData.id && result.data?.id) {
          setFormData((prev) => ({...prev, id: result.data.id}))
        }

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

  // Delete customer (soft delete - mark as closed_lost)
  const deleteCustomer = useCallback(async () => {
    if (!formData.id) return

    try {
      const response = await fetch(`/api/customers/${formData.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      router.push('/admin/customers')
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }, [formData.id, router])

  // Add interaction to customer timeline
  const addInteraction = useCallback(
    async (interaction: {
      interaction_type: string
      subject?: string
      notes?: string
      interaction_date?: string
    }) => {
      if (!formData.id) {
        throw new Error('Customer must be saved before adding interactions')
      }

      try {
        const response = await fetch(`/api/customers/${formData.id}/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interaction),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to add interaction')
        }

        const result = await response.json()
        return result.data
      } catch (error) {
        console.error('Add interaction error:', error)
        throw error
      }
    },
    [formData.id]
  )

  return {
    formData,
    updateField,
    errors,
    validate,
    saveCustomer,
    deleteCustomer,
    addInteraction,
    isSaving,
  }
}
