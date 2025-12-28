'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CustomerStageBadge } from '@/components/admin/CustomerStageBadge'
import { ProjectHealthIndicator } from '@/components/admin/ProjectHealthIndicator'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load dashboard stats')
      }

      setStats(result.data)
      setError(null)
      setLoading(false)
    } catch (error: any) {
      console.error('Failed to load stats:', error)
      setError(error.message || 'Failed to load dashboard data')
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    loadStats()
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            <dt className="text-sm font-medium text-green-700">On Track</dt>
            <dd className="mt-1 text-2xl font-semibold text-green-900">
              {stats?.projects?.on_track_count || 0}
            </dd>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-yellow-700">At Risk</dt>
            <dd className="mt-1 text-2xl font-semibold text-yellow-900">
              {stats?.projects?.at_risk_count || 0}
            </dd>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-red-700">Delayed/Blocked</dt>
            <dd className="mt-1 text-2xl font-semibold text-red-900">
              {(stats?.projects?.delayed_count || 0) + (stats?.projects?.blocked_count || 0)}
            </dd>
          </div>
        </div>

        {stats?.projects?.active && stats.projects.active.length > 0 ? (
          <div className="space-y-3">
            {stats.projects.active.slice(0, 5).map((project: any) => (
              <Link
                key={project.id}
                href={`/admin/customers/${project.id}`}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <CustomerStageBadge stage={project.stage} />
                    <ProjectHealthIndicator status={project.project_status} />
                  </div>
                  {project.solution_due_date && (
                    <p className="mt-1 text-xs text-gray-500">
                      Due: {formatDate(project.solution_due_date)}
                    </p>
                  )}
                  {project.current_blockers && (
                    <p className="mt-1 text-xs text-red-600">⚠️ {project.current_blockers}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active projects</p>
        )}
      </div>

      {/* Section 4: Recent Interactions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Communication (Last 7 Days)
        </h2>
        {stats?.interactions && stats.interactions.length > 0 ? (
          <div className="space-y-4">
            {stats.interactions.map((interaction: any) => (
              <div
                key={interaction.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">{getInteractionIcon(interaction.interaction_type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {interaction.subject || interaction.interaction_type}
                      </p>
                      {interaction.customer && (
                        <Link
                          href={`/admin/customers/${interaction.customer_id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {interaction.customer.name}
                        </Link>
                      )}
                      {interaction.notes && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {interaction.notes}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-gray-500">
                      {formatDate(interaction.interaction_date)}
                    </time>
                  </div>
                  {interaction.created_by_profile && (
                    <p className="mt-1 text-xs text-gray-400">
                      By: {interaction.created_by_profile.full_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent interactions</p>
        )}
      </div>
    </div>
  )
}
