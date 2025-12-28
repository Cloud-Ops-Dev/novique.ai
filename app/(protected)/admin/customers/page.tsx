'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CustomerStageBadge } from '@/components/admin/CustomerStageBadge'
import { ProjectHealthIndicator } from '@/components/admin/ProjectHealthIndicator'

interface Customer {
  id: string
  name: string
  email: string
  business_type?: string
  avatar_url?: string
  stage: string
  project_status: string
  next_action_required?: string
  next_action_due_date?: string
  assigned_admin?: {
    id: string
    full_name: string | null
    email: string
  }
  agreed_implementation_cost?: number
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    atRisk: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [stageFilter, statusFilter, searchQuery])

  async function loadCustomers() {
    setLoading(true)
    const supabase = createClient()

    // Build query
    let query = supabase
      .from('customers')
      .select('*, assigned_admin:profiles!assigned_admin_id(id, full_name, email)')
      .order('created_at', { ascending: false })

    // Apply filters
    if (stageFilter !== 'all') {
      query = query.eq('stage', stageFilter)
    }

    if (statusFilter !== 'all') {
      query = query.eq('project_status', statusFilter)
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    }

    const { data: customersData } = await query

    // Calculate stats
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('*')

    const activeCount = allCustomers?.filter((c) =>
      ['project_active', 'implementation', 'delivered'].includes(c.stage)
    ).length || 0

    const atRiskCount = allCustomers?.filter((c) =>
      ['at_risk', 'delayed', 'blocked'].includes(c.project_status)
    ).length || 0

    const totalRevenue = allCustomers
      ?.filter((c) => c.stage === 'closed_won')
      .reduce((sum, c) => sum + (Number(c.agreed_implementation_cost) || 0), 0) || 0

    setCustomers(customersData || [])
    setStats({
      total: allCustomers?.length || 0,
      active: activeCount,
      atRisk: atRiskCount,
      revenue: totalRevenue,
    })
    setLoading(false)
  }

  const statsArray = [
    { name: 'Total Customers', value: stats.total },
    { name: 'Active Projects', value: stats.active },
    { name: 'At Risk', value: stats.atRisk },
    { name: 'Revenue YTD', value: `$${stats.revenue.toLocaleString()}` },
  ]

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer relationships and track project progress
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Customer
        </Link>
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
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Stages</option>
            <option value="proposal_development">Proposal Development</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="project_active">Project Active</option>
            <option value="implementation">Implementation</option>
            <option value="delivered">Delivered</option>
            <option value="signed_off">Signed Off</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {customer.avatar_url ? (
                        <img
                          src={customer.avatar_url}
                          alt={customer.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium mr-3">
                          {customer.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        {customer.business_type && (
                          <div className="text-sm text-gray-500">{customer.business_type}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomerStageBadge stage={customer.stage} />
                  </td>
                  <td className="px-6 py-4">
                    <ProjectHealthIndicator status={customer.project_status} />
                  </td>
                  <td className="px-6 py-4">
                    {customer.next_action_required ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {customer.next_action_required}
                        </div>
                        {customer.next_action_due_date && (
                          <div
                            className={`text-sm ${
                              isOverdue(customer.next_action_due_date)
                                ? 'text-red-600 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {isOverdue(customer.next_action_due_date) && '⚠️ '}
                            Due: {new Date(customer.next_action_due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.assigned_admin?.full_name || customer.assigned_admin?.email || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="space-y-2">
                    <p>No customers yet.</p>
                    <Link
                      href="/admin/consultations"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      Convert a consultation request to get started
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
