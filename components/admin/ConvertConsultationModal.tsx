'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Consultation {
  id: string
  name: string
  email: string
  phone?: string
  business_type?: string
  business_size?: string
  challenges?: string
}

interface ConvertConsultationModalProps {
  consultation: Consultation
  isOpen: boolean
  onClose: () => void
}

export function ConvertConsultationModal({
  consultation,
  isOpen,
  onClose,
}: ConvertConsultationModalProps) {
  const router = useRouter()
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConvert = async () => {
    setIsConverting(true)
    setError(null)

    try {
      const response = await fetch(`/api/consultations/${consultation.id}/convert`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert consultation')
      }

      const result = await response.json()

      // Redirect to the new customer page
      router.push(`/admin/customers/${result.customerId}`)
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message)
      setIsConverting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Convert to Customer
          </h2>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Convert this consultation request into a customer record. This will:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-gray-700">
            <li>Create a new customer record in the CRM</li>
            <li>Transfer all consultation details</li>
            <li>Set initial stage to "Proposal Development"</li>
            <li>Create an initial interaction log entry</li>
            <li>Mark this consultation as "converted"</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>{' '}
              <span className="text-gray-900">{consultation.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>{' '}
              <span className="text-gray-900">{consultation.email}</span>
            </div>
            {consultation.phone && (
              <div>
                <span className="font-medium text-gray-700">Phone:</span>{' '}
                <span className="text-gray-900">{consultation.phone}</span>
              </div>
            )}
            {consultation.business_type && (
              <div>
                <span className="font-medium text-gray-700">Business Type:</span>{' '}
                <span className="text-gray-900">{consultation.business_type}</span>
              </div>
            )}
            {consultation.business_size && (
              <div>
                <span className="font-medium text-gray-700">Business Size:</span>{' '}
                <span className="text-gray-900">{consultation.business_size}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isConverting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? 'Converting...' : 'Convert to Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}
