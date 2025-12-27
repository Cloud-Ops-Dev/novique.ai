'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CustomerStageBadge } from '@/components/admin/CustomerStageBadge'
import { ProjectHealthIndicator } from '@/components/admin/ProjectHealthIndicator'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()
      setStats(result.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getInteractionIcon = (type: string) => {
    const icons: Record<string, string> = {
      consultation_request: '📋',
      meeting: '🗓️',
      email: '📧',
      call: '📞',
      note: '📝',
      proposal_sent: '📄',
      contract_signed: '✍️',
      payment_received: '💰',
      stage_change: '🔄',
    }
    return icons[type] || '•'
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your business metrics and customer activity
        </p>
      </div>

      {/* Section 1: Revenue Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-green-50 rounded-lg p-5">
            <dt className="text-sm font-medium text-green-700 truncate">Total Revenue YTD</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-900">
              ${stats?.revenue?.ytd?.toLocaleString() || 0}
            </dd>
          </div>
          <div className="bg-blue-50 rounded-lg p-5">
            <dt className="text-sm font-medium text-blue-700 truncate">Pipeline Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-900">
              ${stats?.revenue?.pipeline?.toLocaleString() || 0}
            </dd>
          </div>
          <div className="bg-purple-50 rounded-lg p-5">
            <dt className="text-sm font-medium text-purple-700 truncate">Conversion Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-purple-900">
              {stats?.revenue?.conversion?.toFixed(1) || 0}%
            </dd>
          </div>
          <div className="bg-cyan-50 rounded-lg p-5">
            <dt className="text-sm font-medium text-cyan-700 truncate">Avg Deal Size</dt>
            <dd className="mt-1 text-3xl font-semibold text-cyan-900">
              ${stats?.revenue?.avg_deal?.toLocaleString() || 0}
            </dd>
          </div>
        </div>
      </div>

      {/* Section 2: Activity Tracking */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Activities</h2>

        {stats?.activity?.overdue_count > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ {stats.activity.overdue_count} Overdue Actions
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {stats.activity.overdue_tasks?.slice(0, 3).map((task: any) => (
                      <li key={task.id}>
                        <Link
                          href={`/admin/customers/${task.id}`}
                          className="hover:underline"
                        >
                          {task.name}: {task.next_action_required}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Upcoming Meetings (Next 7 Days)
            </h3>
            {stats?.activity?.upcoming_meetings?.length > 0 ? (
              <div className="space-y-2">
                {stats.activity.upcoming_meetings.map((meeting: any) => (
                  <Link
                    key={meeting.id}
                    href={`/admin/customers/${meeting.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{meeting.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(meeting.proposal_presentation_datetime)}
                        </p>
                      </div>
                      <CustomerStageBadge stage={meeting.stage} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming meetings</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">New consultations (24h)</span>
                <span className="text-lg font-semibold text-blue-900">
                  {stats?.activity?.recent_consultations || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Project Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Projects</h2>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Total Active</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {stats?.projects?.active?.length || 0}
            </dd>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-green-700">🟢 On Track</dt>
            <dd className="mt-1 text-2xl font-semibold text-green-900">
              {stats?.projects?.on_track_count || 0}
            </dd>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-yellow-700">🟡 At Risk</dt>
            <dd className="mt-1 text-2xl font-semibold text-yellow-900">
              {stats?.projects?.at_risk_count || 0}
            </dd>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-red-700">🔴 Delayed</dt>
            <dd className="mt-1 text-2xl font-semibold text-red-900">
              {stats?.projects?.delayed_count || 0}
            </dd>
          </div>
        </div>

        {stats?.projects?.active?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.projects.active.map((project: any) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      {project.current_blockers && (
                        <div className="text-sm text-red-600">
                          🛑 {project.current_blockers}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CustomerStageBadge stage={project.stage} />
                    </td>
                    <td className="px-6 py-4">
                      <ProjectHealthIndicator status={project.project_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.solution_due_date
                        ? formatDate(project.solution_due_date)
                        : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/customers/${project.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No active projects</p>
        )}
      </div>

      {/* Section 4: Recent Interactions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Interactions (Last 7 Days)
        </h2>

        {stats?.interactions?.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.interactions.slice(0, 10).map((interaction: any, index: number) => (
                <li key={interaction.id}>
                  <div className="relative pb-8">
                    {index !== stats.interactions.slice(0, 10).length - 1 && (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                          {getInteractionIcon(interaction.interaction_type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <Link
                              href={`/admin/customers/${interaction.customer_id}`}
                              className="font-medium text-gray-900 hover:underline"
                            >
                              {interaction.customer?.name}
                            </Link>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {formatDateTime(interaction.interaction_date)}
                            {interaction.created_by_profile?.full_name && (
                              <span> • by {interaction.created_by_profile.full_name}</span>
                            )}
                          </p>
                        </div>
                        {interaction.subject && (
                          <p className="mt-2 text-sm text-gray-700 font-medium">
                            {interaction.subject}
                          </p>
                        )}
                        {interaction.notes && (
                          <p className="mt-1 text-sm text-gray-600">{interaction.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent interactions</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/consultations"
            className="relative block border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
          >
            <span className="text-3xl">📋</span>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              View Consultations
            </span>
          </Link>

          <Link
            href="/admin/customers"
            className="relative block border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
          >
            <span className="text-3xl">👥</span>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              View Customers
            </span>
          </Link>

          <Link
            href="/admin/blog/new"
            className="relative block border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
          >
            <span className="text-3xl">✍️</span>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Create Blog Post
            </span>
          </Link>

          <Link
            href="/"
            className="relative block border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
          >
            <span className="text-3xl">🏠</span>
            <span className="mt-2 block text-sm font-medium text-gray-900">View Site</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
