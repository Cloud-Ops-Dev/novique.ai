'use client'

import { useState, useEffect } from 'react'
import { ConvertConsultationModal } from '@/components/admin/ConvertConsultationModal'

interface Consultation {
  id: string
  name: string
  email: string
  phone?: string
  business_type?: string
  business_size?: string
  preferred_date?: string
  preferred_time?: string
  meeting_type?: string
  challenges?: string
  status: string
  created_at: string
  converted_to_customer_id?: string
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    thisWeek: 0,
    converted: 0,
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  useEffect(() => {
    loadConsultations()
  }, [statusFilter, searchQuery])

  async function loadConsultations() {
    setLoading(true)

    try {
      // Build query params
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // Fetch consultations from API (uses admin client, allows editors)
      const response = await fetch(`/api/consultations?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch consultations')
      }

      const result = await response.json()
      const consultationsData = result.data || []

      // Calculate stats from all consultations
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const thisWeekCount = consultationsData.filter(
        (c: Consultation) => new Date(c.created_at) >= oneWeekAgo
      ).length

      const pendingCount = consultationsData.filter((c: Consultation) => c.status === 'pending').length
      const convertedCount = consultationsData.filter((c: Consultation) => c.status === 'converted').length

      setConsultations(consultationsData)
      setStats({
        total: consultationsData.length,
        pending: pendingCount,
        thisWeek: thisWeekCount,
        converted: convertedCount,
      })
    } catch (error) {
      console.error('Error loading consultations:', error)
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const statsArray = [
    { name: 'Total Requests', value: stats.total },
    { name: 'Pending', value: stats.pending },
    { name: 'This Week', value: stats.thisWeek },
    { name: 'Converted', value: stats.converted },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Convert Modal */}
      {selectedConsultation && (
        <ConvertConsultationModal
          consultation={selectedConsultation}
          isOpen={!!selectedConsultation}
          onClose={() => {
            setSelectedConsultation(null)
            loadConsultations() // Refresh list
          }}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consultation Requests</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage incoming consultation requests and convert to customers
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {statsArray.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferred Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consultations && consultations.length > 0 ? (
              consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{consultation.name}</div>
                    <div className="text-sm text-gray-500">{consultation.email}</div>
                    {consultation.phone && (
                      <div className="text-sm text-gray-500">{consultation.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{consultation.business_type}</div>
                    <div className="text-sm text-gray-500">{consultation.business_size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {consultation.preferred_date
                        ? new Date(consultation.preferred_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">{consultation.preferred_time}</div>
                    {consultation.meeting_type && (
                      <div className="text-sm text-gray-500 capitalize">
                        {consultation.meeting_type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        consultation.status
                      )}`}
                    >
                      {consultation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {consultation.status === 'converted' ? (
                      <span className="text-green-600">✓ Converted</span>
                    ) : (
                      <button
                        onClick={() => setSelectedConsultation(consultation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Convert to Customer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No consultation requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
