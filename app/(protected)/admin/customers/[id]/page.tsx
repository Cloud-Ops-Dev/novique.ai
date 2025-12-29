'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerEditor } from '@/hooks/useCustomerEditor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { CustomerStageBadge } from '@/components/admin/CustomerStageBadge'
import { ProjectHealthIndicator } from '@/components/admin/ProjectHealthIndicator'
import { InteractionTimeline } from '@/components/admin/InteractionTimeline'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [interactions, setInteractions] = useState<any[]>([])
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'note',
    subject: '',
    notes: '',
  })

  const { formData, updateField, errors, saveCustomer, addInteraction, isSaving } =
    useCustomerEditor({})

  // Load admin users
  useEffect(() => {
    async function loadAdminUsers() {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const result = await response.json()
          // Filter to only admin users
          const admins = (result.data || []).filter((u: any) => u.role === 'admin')
          setAdminUsers(admins)
        }
      } catch (error) {
        console.error('Failed to load admin users:', error)
      }
    }
    loadAdminUsers()
  }, [])

  // Load customer data
  useEffect(() => {
    async function loadCustomer() {
      // Skip loading for new customer creation
      if (customerId === 'new') {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/customers/${customerId}`)
        if (!response.ok) throw new Error('Failed to load customer')

        const result = await response.json()
        const customer = result.data

        // Update form data with customer data
        Object.keys(customer).forEach((key) => {
          if (key !== 'interactions') {
            updateField(key as any, customer[key])
          }
        })

        setInteractions(customer.interactions || [])
        setLoading(false)
      } catch (error) {
        console.error('Load error:', error)
        setLoading(false)
      }
    }

    loadCustomer()
  }, [customerId])

  // Auto-save (disabled for new customers)
  const { lastSaved, error: autoSaveError } = useAutoSave({
    onSave: async () => {
      if (formData.name && formData.email) {
        await saveCustomer()
      }
    },
    interval: 30000,
    enabled: !!formData.name && customerId !== 'new',
  })

  // Display auto-save errors
  useEffect(() => {
    if (autoSaveError) {
      setSaveError(`Auto-save failed: ${autoSaveError.message}`)
    }
  }, [autoSaveError])

  const handleAddInteraction = async () => {
    try {
      await addInteraction(newInteraction)
      // Reload interactions
      const response = await fetch(`/api/customers/${customerId}/interactions`)
      const result = await response.json()
      setInteractions(result.data)
      setShowAddInteraction(false)
      setNewInteraction({ interaction_type: 'note', subject: '', notes: '' })
    } catch (error) {
      console.error('Failed to add interaction:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'consultation', name: 'Consultation' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'agreement', name: 'Agreement' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'implementation', name: 'Implementation' },
    { id: 'signoff', name: 'Sign-off' },
    { id: 'timeline', name: 'Timeline' },
  ]

  if (loading) {
    return <div className="text-center py-12">Loading customer...</div>
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link href="/admin/customers" className="text-gray-400 hover:text-gray-500">
              Customers
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-500">
                {formData.name || 'New Customer'}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Save Failed</h3>
            <p className="text-sm">{saveError}</p>
          </div>
          <button onClick={() => setSaveError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt={formData.name}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                {formData.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{formData.name || 'New Customer'}</h1>
              <p className="mt-1 text-sm text-gray-500">{formData.email || 'Enter customer details below'}</p>
              {formData.phone && <p className="text-sm text-gray-500">{formData.phone}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CustomerStageBadge stage={formData.stage} />
            <ProjectHealthIndicator status={formData.project_status} />
            {lastSaved && (
              <p className="text-xs text-gray-500">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <select
                    value={formData.business_type || ''}
                    onChange={(e) => updateField('business_type', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select industry...</option>
                    <option value="retail">Retail</option>
                    <option value="restaurant">Restaurant/Food Service</option>
                    <option value="professional">Professional Services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Size</label>
                  <select
                    value={formData.business_size || ''}
                    onChange={(e) => updateField('business_size', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select size...</option>
                    <option value="1-5">1-5 employees</option>
                    <option value="6-20">6-20 employees</option>
                    <option value="21-50">21-50 employees</option>
                    <option value="51+">51+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Status</label>
                  <select
                    value={formData.project_status}
                    onChange={(e) => updateField('project_status', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="on_track">On Track</option>
                    <option value="at_risk">At Risk</option>
                    <option value="delayed">Delayed</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned to</label>
                  <select
                    value={formData.assigned_admin_id || ''}
                    onChange={(e) => updateField('assigned_admin_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.full_name || admin.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Challenges</label>
                <textarea
                  rows={4}
                  value={formData.initial_challenges || ''}
                  onChange={(e) => updateField('initial_challenges', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Blockers</label>
                <textarea
                  rows={3}
                  value={formData.current_blockers || ''}
                  onChange={(e) => updateField('current_blockers', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Action Required</label>
                  <input
                    type="text"
                    value={formData.next_action_required || ''}
                    onChange={(e) => updateField('next_action_required', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Action Due Date</label>
                  <input
                    type="date"
                    value={formData.next_action_due_date || ''}
                    onChange={(e) => updateField('next_action_due_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Consultation Tab */}
          {activeTab === 'consultation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Date</label>
                  <input
                    type="date"
                    value={formData.consultation_occurred_date || ''}
                    onChange={(e) => updateField('consultation_occurred_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Setting this will auto-progress to &quot;Consultation Completed&quot;
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Notes</label>
                <textarea
                  rows={6}
                  value={formData.consultation_notes || ''}
                  onChange={(e) => updateField('consultation_notes', e.target.value)}
                  placeholder="Notes from the discovery meeting..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Proposal Tab */}
          {activeTab === 'proposal' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Investigation Notes</label>
                <textarea
                  rows={6}
                  value={formData.investigation_notes || ''}
                  onChange={(e) => updateField('investigation_notes', e.target.value)}
                  placeholder="Notes from investigating possible improvements..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Proposed Solutions</label>
                <textarea
                  rows={6}
                  value={formData.proposed_solutions?.join('\n') || ''}
                  onChange={(e) => updateField('proposed_solutions', e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Enter each solution on a new line..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Setting solutions will auto-progress to &quot;Proposal Sent&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proposal Presentation Date/Time</label>
                  <input
                    type="datetime-local"
                    value={formData.proposal_presentation_datetime || ''}
                    onChange={(e) => updateField('proposal_presentation_datetime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Proposal Location</label>
                  <input
                    type="text"
                    value={formData.proposal_location || ''}
                    onChange={(e) => updateField('proposal_location', e.target.value)}
                    placeholder="Virtual, Office, Customer site..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Agreement Tab */}
          {activeTab === 'agreement' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Accepted Solutions</label>
                <textarea
                  rows={6}
                  value={formData.accepted_solutions?.join('\n') || ''}
                  onChange={(e) => updateField('accepted_solutions', e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Enter each accepted solution on a new line..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Setting accepted solutions will auto-progress to &quot;Negotiation&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Implementation Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.agreed_implementation_cost || ''}
                    onChange={(e) => updateField('agreed_implementation_cost', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Setting this will auto-progress to &quot;Project Active&quot;
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Recurring Cost (Monthly)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.agreed_recurring_cost || ''}
                    onChange={(e) => updateField('agreed_recurring_cost', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Requirements</label>
                <textarea
                  rows={4}
                  value={formData.delivery_requirements || ''}
                  onChange={(e) => updateField('delivery_requirements', e.target.value)}
                  placeholder="Specific requirements for delivery..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solution Due Date</label>
                  <input
                    type="date"
                    value={formData.solution_due_date || ''}
                    onChange={(e) => updateField('solution_due_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">GA Date (from customer)</label>
                  <input
                    type="date"
                    value={formData.ga_date || ''}
                    onChange={(e) => updateField('ga_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={formData.github_repo_url || ''}
                    onChange={(e) => updateField('github_repo_url', e.target.value)}
                    placeholder="https://github.com/..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Wekan Board URL</label>
                  <input
                    type="url"
                    value={formData.wekan_board_url || ''}
                    onChange={(e) => updateField('wekan_board_url', e.target.value)}
                    placeholder="http://localhost:8080/..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Implementation Tab */}
          {activeTab === 'implementation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Implementation Date</label>
                  <input
                    type="date"
                    value={formData.implementation_date || ''}
                    onChange={(e) => updateField('implementation_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Setting this will auto-progress to &quot;Implementation&quot;
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Demonstration Date</label>
                  <input
                    type="date"
                    value={formData.demonstration_date || ''}
                    onChange={(e) => updateField('demonstration_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Setting this will auto-progress to &quot;Delivered&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign-off Tab */}
          {activeTab === 'signoff' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sign-off Date</label>
                  <input
                    type="date"
                    value={formData.signoff_date || ''}
                    onChange={(e) => updateField('signoff_date', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Setting this will auto-progress to &quot;Signed Off&quot;
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => updateField('payment_status', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="not_applicable">Not Applicable</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sign-off Notes</label>
                <textarea
                  rows={4}
                  value={formData.signoff_notes || ''}
                  onChange={(e) => updateField('signoff_notes', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Info</label>
                <textarea
                  rows={3}
                  value={formData.payment_info || ''}
                  onChange={(e) => updateField('payment_info', e.target.value)}
                  placeholder="Invoice number, payment method, etc..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Confirmed Date</label>
                <input
                  type="date"
                  value={formData.payment_confirmed_date || ''}
                  onChange={(e) => updateField('payment_confirmed_date', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Setting this will auto-progress to &quot;Closed Won&quot;
                </p>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div>
              <InteractionTimeline
                interactions={interactions}
                onAddInteraction={() => setShowAddInteraction(true)}
              />

              {showAddInteraction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
                    <h3 className="text-lg font-medium mb-4">Add Interaction</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={newInteraction.interaction_type}
                          onChange={(e) =>
                            setNewInteraction({ ...newInteraction, interaction_type: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="note">Note</option>
                          <option value="meeting">Meeting</option>
                          <option value="email">Email</option>
                          <option value="call">Call</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                          type="text"
                          value={newInteraction.subject}
                          onChange={(e) =>
                            setNewInteraction({ ...newInteraction, subject: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                          rows={4}
                          value={newInteraction.notes}
                          onChange={(e) =>
                            setNewInteraction({ ...newInteraction, notes: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setShowAddInteraction(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddInteraction}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Add Interaction
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/admin/customers')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Customers
        </button>
        <button
          onClick={async () => {
            try {
              setSaveError(null)
              await saveCustomer()
              router.push('/admin/customers')
            } catch (error: any) {
              setSaveError(error.message || 'Failed to save customer')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          disabled={isSaving}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save & Close'}
        </button>
      </div>
    </div>
  )
}
