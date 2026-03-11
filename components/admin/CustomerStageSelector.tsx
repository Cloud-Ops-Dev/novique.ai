'use client'

import { useState, useRef, useEffect } from 'react'

const STAGE_CONFIG: Record<string, { label: string; className: string; dotColor: string }> = {
  consultation_requested: {
    label: 'Consultation Requested',
    className: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-500',
  },
  consultation_in_progress: {
    label: 'Consultation In Progress',
    className: 'bg-blue-200 text-blue-900',
    dotColor: 'bg-blue-600',
  },
  consultation_completed: {
    label: 'Consultation Done',
    className: 'bg-indigo-100 text-indigo-800',
    dotColor: 'bg-indigo-500',
  },
  proposal_development: {
    label: 'Developing Proposal',
    className: 'bg-purple-100 text-purple-800',
    dotColor: 'bg-purple-500',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    className: 'bg-cyan-100 text-cyan-800',
    dotColor: 'bg-cyan-500',
  },
  negotiation: {
    label: 'Negotiating',
    className: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  project_active: {
    label: 'Project Active',
    className: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  implementation: {
    label: 'Implementing',
    className: 'bg-teal-100 text-teal-800',
    dotColor: 'bg-teal-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  signed_off: {
    label: 'Signed Off',
    className: 'bg-lime-100 text-lime-800',
    dotColor: 'bg-lime-500',
  },
  closed_won: {
    label: 'Closed Won',
    className: 'bg-green-200 text-green-900 font-semibold',
    dotColor: 'bg-green-700',
  },
  closed_lost: {
    label: 'Closed Lost',
    className: 'bg-gray-200 text-gray-700',
    dotColor: 'bg-gray-500',
  },
}

const STAGE_ORDER = [
  'consultation_requested',
  'consultation_in_progress',
  'consultation_completed',
  'proposal_development',
  'proposal_sent',
  'negotiation',
  'project_active',
  'implementation',
  'delivered',
  'signed_off',
  'closed_won',
  'closed_lost',
]

interface CustomerStageSelectorProps {
  customerId: string
  currentStage: string
  onStageChanged: (newStage: string) => void
  disabled?: boolean
}

export function CustomerStageSelector({
  customerId,
  currentStage,
  onStageChanged,
  disabled,
}: CustomerStageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingStage, setPendingStage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const config = STAGE_CONFIG[currentStage] || {
    label: currentStage,
    className: 'bg-gray-100 text-gray-800',
    dotColor: 'bg-gray-500',
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setPendingStage(null)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!pendingStage) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: pendingStage }),
      })
      if (!res.ok) throw new Error('Failed to update stage')
      onStageChanged(pendingStage)
      setIsOpen(false)
      setPendingStage(null)
    } catch (error) {
      console.error('Stage update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Badge button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${config.className} ${
          disabled ? 'opacity-60 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
        }`}
        title={disabled ? undefined : 'Click to change stage'}
      >
        {config.label}
        {!disabled && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {pendingStage ? (
            // Confirmation view
            <div className="p-3">
              <p className="text-sm text-gray-700 mb-3">
                Change to <span className="font-semibold">{STAGE_CONFIG[pendingStage]?.label}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setPendingStage(null)}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Stage list
            <div className="py-1 max-h-80 overflow-y-auto">
              {STAGE_ORDER.map((stage) => {
                const sc = STAGE_CONFIG[stage]
                const isCurrent = stage === currentStage
                return (
                  <button
                    key={stage}
                    onClick={() => !isCurrent && setPendingStage(stage)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                      isCurrent
                        ? 'bg-gray-50 text-gray-500 cursor-default'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dotColor}`} />
                    <span className="flex-1">{sc.label}</span>
                    {isCurrent && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
