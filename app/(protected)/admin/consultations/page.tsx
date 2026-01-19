'use client'

import { useState, useEffect } from 'react'
import { ConvertConsultationModal } from '@/components/admin/ConvertConsultationModal'
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatsGrid,
  AdminFilterBar,
  AdminSelect,
  AdminTable,
  AdminTableHead,
  AdminTableHeader,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminEmptyState,
  AdminButton,
  AdminPageSkeleton,
} from '@/components/admin/AdminUI'

// Icons
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

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
    const badges: Record<string, { bg: string; text: string; dot: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
      contacted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      converted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      cancelled: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    }
    return badges[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  if (loading) {
    return <AdminPageSkeleton />
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
      <AdminPageHeader
        title="Consultation Requests"
        description="Manage incoming consultation requests and convert to customers"
        icon={<CalendarIcon />}
      />

      {/* Stats Grid */}
      <AdminStatsGrid columns={4}>
        <AdminStatCard
          label="Total Requests"
          value={stats.total}
          variant="default"
          icon={<CalendarIcon />}
        />
        <AdminStatCard
          label="Pending"
          value={stats.pending}
          variant="warning"
          icon={<ClockIcon />}
        />
        <AdminStatCard
          label="This Week"
          value={stats.thisWeek}
          variant="info"
          icon={<TrendingIcon />}
        />
        <AdminStatCard
          label="Converted"
          value={stats.converted}
          variant="success"
          icon={<CheckCircleIcon />}
        />
      </AdminStatsGrid>

      {/* Filters */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or email..."
      >
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </AdminFilterBar>

      {/* Consultations Table */}
      <AdminTable>
        <AdminTableHead>
          <AdminTableHeader>Contact</AdminTableHeader>
          <AdminTableHeader>Business</AdminTableHeader>
          <AdminTableHeader>Preferred Date</AdminTableHeader>
          <AdminTableHeader>Status</AdminTableHeader>
          <AdminTableHeader>Created</AdminTableHeader>
          <AdminTableHeader className="text-right">Actions</AdminTableHeader>
        </AdminTableHead>
        <AdminTableBody>
          {consultations && consultations.length > 0 ? (
            consultations.map((consultation) => {
              const statusStyle = getStatusBadge(consultation.status)
              return (
                <AdminTableRow key={consultation.id}>
                  <AdminTableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold mr-3 shadow-sm">
                        {consultation.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{consultation.name}</div>
                        <div className="text-sm text-gray-500">{consultation.email}</div>
                        {consultation.phone && (
                          <div className="text-xs text-gray-400">{consultation.phone}</div>
                        )}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="text-sm text-gray-900">{consultation.business_type || '-'}</div>
                    {consultation.business_size && (
                      <div className="text-xs text-gray-500">{consultation.business_size}</div>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {consultation.preferred_date
                        ? new Date(consultation.preferred_date).toLocaleDateString()
                        : '-'}
                    </div>
                    {consultation.preferred_time && (
                      <div className="text-xs text-gray-500">{consultation.preferred_time}</div>
                    )}
                    {consultation.meeting_type && (
                      <div className="text-xs text-gray-400 capitalize">
                        {consultation.meeting_type}
                      </div>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-sm text-gray-500">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-right">
                    {consultation.status === 'converted' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Converted
                      </span>
                    ) : (
                      <AdminButton
                        onClick={() => setSelectedConsultation(consultation)}
                        variant="primary"
                        size="sm"
                      >
                        Convert
                      </AdminButton>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              )
            })
          ) : (
            <tr>
              <td colSpan={6}>
                <AdminEmptyState
                  icon={<CalendarIcon />}
                  title="No consultation requests"
                  description="Consultation requests will appear here when submitted"
                />
              </td>
            </tr>
          )}
        </AdminTableBody>
      </AdminTable>
    </div>
  )
}
