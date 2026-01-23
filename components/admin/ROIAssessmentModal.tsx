'use client'

import { useState } from 'react'

interface ROIResults {
  hoursSavedPerMonth?: number
  laborSavingsPerMonth?: number
  errorSavingsPerMonth?: number
  revenueUpliftPerMonth?: number
  totalBenefitPerMonth?: number
  netBenefitPerMonth?: number
  roiPercent?: number
  paybackMonths?: number
}

interface ROIAssessment {
  id: string
  email: string
  calculated_results: ROIResults
  industry?: string
  employees_impacted?: number
  selected_workflows?: string[]
  created_at: string
  contacted: boolean
  contacted_at?: string
  notes?: string
  converted?: boolean
  converted_at?: string
  converted_to_customer_id?: string
}

// Workflow ID to name mapping
const WORKFLOW_NAMES: Record<string, string> = {
  lead_followup: 'Lead Capture + Follow-up',
  appointment_scheduling: 'Appointment Scheduling + Reminders',
  invoice_generation: 'Invoice/Quote Generation',
  customer_intake: 'Customer Intake Forms',
  status_updates: 'Status Updates + Reporting',
  task_routing: 'Internal Task Routing',
  support_triage: 'Support Triage',
}

// Industry value to label mapping
const INDUSTRY_LABELS: Record<string, string> = {
  home_services: 'Home Services',
  professional_services: 'Professional Services',
  healthcare: 'Healthcare',
  retail: 'Retail',
  real_estate: 'Real Estate',
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  other: 'Other',
}

interface ROIAssessmentModalProps {
  assessment: ROIAssessment
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  onDelete?: (id: string) => void
}

export function ROIAssessmentModal({
  assessment,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ROIAssessmentModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(assessment.notes || '')
  const [contacted, setContacted] = useState(assessment.contacted)

  if (!isOpen) return null

  const results = assessment.calculated_results || {}

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return 'N/A'
    return '$' + value.toLocaleString()
  }

  const formatPercent = (value?: number) => {
    if (typeof value !== 'number') return 'N/A'
    return value.toLocaleString() + '%'
  }

  const formatHours = (value?: number) => {
    if (typeof value !== 'number') return 'N/A'
    return value.toFixed(1) + ' hrs'
  }

  const formatMonths = (value?: number) => {
    if (typeof value !== 'number') return 'N/A'
    return value.toFixed(1) + ' months'
  }

  const handleSave = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch('/api/roi-assessments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assessment.id,
          contacted,
          notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update assessment')
      }

      onUpdate?.()
      onClose()
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message)
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/roi-assessments/${assessment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete assessment')
      }

      onDelete?.(assessment.id)
      onUpdate?.()
      onClose()
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              ROI Assessment Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Converted Banner */}
          {assessment.converted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-emerald-800">Converted to Customer</p>
                {assessment.converted_at && (
                  <p className="text-sm text-emerald-600">
                    {new Date(assessment.converted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {assessment.converted_to_customer_id && (
                <a
                  href={`/admin/customers/${assessment.converted_to_customer_id}`}
                  className="ml-auto px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md"
                >
                  View Customer
                </a>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">{assessment.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>
                <p className="font-medium text-gray-900">
                  {new Date(assessment.created_at).toLocaleString()}
                </p>
              </div>
              {assessment.industry && (
                <div>
                  <span className="text-gray-500">Industry:</span>
                  <p className="font-medium text-gray-900">
                    {INDUSTRY_LABELS[assessment.industry] || assessment.industry}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Workflows */}
          {assessment.selected_workflows && assessment.selected_workflows.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Selected Workflows</h3>
              <div className="flex flex-wrap gap-2">
                {assessment.selected_workflows.map((workflowId) => (
                  <span
                    key={workflowId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {WORKFLOW_NAMES[workflowId] || workflowId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Calculated Results */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Calculated ROI Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium uppercase">Hours Saved/Mo</p>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {formatHours(results.hoursSavedPerMonth)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-xs text-emerald-600 font-medium uppercase">Labor Savings/Mo</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(results.laborSavingsPerMonth)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-xs text-amber-600 font-medium uppercase">Error Savings/Mo</p>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  {formatCurrency(results.errorSavingsPerMonth)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-medium uppercase">Revenue Uplift/Mo</p>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {formatCurrency(results.revenueUpliftPerMonth)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium uppercase">Total Benefit/Mo</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(results.totalBenefitPerMonth)}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <p className="text-xs text-green-600 font-medium uppercase">Net Benefit/Mo</p>
                <p className="text-xl font-bold text-green-700 mt-1">
                  {formatCurrency(results.netBenefitPerMonth)}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-indigo-600 font-medium uppercase">ROI</p>
                <p className="text-xl font-bold text-indigo-700 mt-1">
                  {formatPercent(results.roiPercent)}
                </p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4">
                <p className="text-xs text-rose-600 font-medium uppercase">Payback Period</p>
                <p className="text-xl font-bold text-rose-700 mt-1">
                  {formatMonths(results.paybackMonths)}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Follow-up</h3>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={contacted}
                onChange={(e) => setContacted(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Mark as contacted
                {assessment.contacted_at && (
                  <span className="text-gray-500 ml-2">
                    (contacted on {new Date(assessment.contacted_at).toLocaleDateString()})
                  </span>
                )}
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add follow-up notes..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between sticky bottom-0">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 font-medium">Delete this assessment?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUpdating || isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating || isDeleting}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
