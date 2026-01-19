'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CustomerStageBadge } from '@/components/admin/CustomerStageBadge'
import { ProjectHealthIndicator } from '@/components/admin/ProjectHealthIndicator'
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatsGrid,
  AdminCard,
  AdminPageSkeleton,
  AdminButton,
} from '@/components/admin/AdminUI'

// Icons
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

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
    return <AdminPageSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Dashboard"
          description="Overview of your business metrics and customer activity"
          icon={<DashboardIcon />}
        />
        <AdminCard>
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  loadStats()
                }}
                className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                Try again
              </AdminButton>
            </div>
          </div>
        </AdminCard>
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
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your business metrics and customer activity"
        icon={<DashboardIcon />}
      />

      {/* Section 1: Revenue Metrics */}
      <AdminStatsGrid columns={4}>
        <AdminStatCard
          label="Total Revenue YTD"
          value={`$${stats?.revenue?.ytd?.toLocaleString() || 0}`}
          variant="success"
          icon={<DollarIcon />}
        />
        <AdminStatCard
          label="Pipeline Value"
          value={`$${stats?.revenue?.pipeline?.toLocaleString() || 0}`}
          variant="info"
          icon={<ChartIcon />}
        />
        <AdminStatCard
          label="Conversion Rate"
          value={`${stats?.revenue?.conversion?.toFixed(1) || 0}%`}
          variant="purple"
          icon={<TrendingIcon />}
        />
        <AdminStatCard
          label="Avg Deal Size"
          value={`$${stats?.revenue?.avg_deal?.toLocaleString() || 0}`}
          variant="info"
          icon={<TargetIcon />}
        />
      </AdminStatsGrid>

      {/* Section 2: Activity Tracking */}
      <AdminCard title="Upcoming Activities">
        {stats?.activity?.overdue_count > 0 && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                {stats.activity.overdue_count} Overdue Actions
              </h3>
              <ul className="mt-2 space-y-1">
                {stats.activity.overdue_tasks?.slice(0, 3).map((task: any) => (
                  <li key={task.id}>
                    <Link
                      href={`/admin/customers/${task.id}`}
                      className="text-sm text-red-700 hover:text-red-800 hover:underline"
                    >
                      {task.name}: {task.next_action_required}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Upcoming Activities (Next 7 Days)
            </h3>
            {stats?.activity?.upcoming_activities?.length > 0 ? (
              <div className="space-y-3">
                {stats.activity.upcoming_activities.map((activity: any) => (
                  <Link
                    key={`${activity.id}-${activity.type}`}
                    href={`/admin/customers/${activity.id}`}
                    className="block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            activity.type === 'presentation'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {activity.type === 'presentation' ? 'Presentation' : 'Action'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(activity.datetime)}
                        </p>
                      </div>
                      <CustomerStageBadge stage={activity.stage} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No upcoming activities</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">New consultations (24h)</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {stats?.activity?.recent_consultations || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Section 3: Project Health */}
      <AdminCard title="Active Projects">
        <div className="mb-6">
          <AdminStatsGrid columns={4}>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <dt className="text-sm font-medium text-gray-500">Total Active</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">
                {stats?.projects?.active?.length || 0}
              </dd>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-4">
              <dt className="text-sm font-medium text-emerald-700">On Track</dt>
              <dd className="mt-1 text-2xl font-bold text-emerald-700">
                {stats?.projects?.on_track_count || 0}
              </dd>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
              <dt className="text-sm font-medium text-amber-700">At Risk</dt>
              <dd className="mt-1 text-2xl font-bold text-amber-700">
                {stats?.projects?.at_risk_count || 0}
              </dd>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-4">
              <dt className="text-sm font-medium text-red-700">Delayed/Blocked</dt>
              <dd className="mt-1 text-2xl font-bold text-red-700">
                {(stats?.projects?.delayed_count || 0) + (stats?.projects?.blocked_count || 0)}
              </dd>
            </div>
          </AdminStatsGrid>
        </div>

        {stats?.projects?.active && stats.projects.active.length > 0 ? (
          <div className="space-y-3">
            {stats.projects.active.slice(0, 5).map((project: any) => (
              <Link
                key={project.id}
                href={`/admin/customers/${project.id}`}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                    <CustomerStageBadge stage={project.stage} />
                    <ProjectHealthIndicator status={project.project_status} />
                  </div>
                  {project.solution_due_date && (
                    <p className="mt-2 text-xs text-gray-500">
                      Due: {formatDate(project.solution_due_date)}
                    </p>
                  )}
                  {project.current_blockers && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {project.current_blockers}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No active projects</p>
          </div>
        )}
      </AdminCard>

      {/* Section 4: Recent Interactions */}
      <AdminCard title="Recent Communication (Last 7 Days)">
        {stats?.interactions && stats.interactions.length > 0 ? (
          <div className="space-y-3">
            {stats.interactions.map((interaction: any) => (
              <div
                key={interaction.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl shadow-sm">
                  {getInteractionIcon(interaction.interaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {interaction.subject || interaction.interaction_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      {interaction.customer && (
                        <Link
                          href={`/admin/customers/${interaction.customer_id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
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
                    <time className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {formatDate(interaction.interaction_date)}
                    </time>
                  </div>
                  {interaction.created_by_profile && (
                    <p className="mt-2 text-xs text-gray-400">
                      By: {interaction.created_by_profile.full_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No recent interactions</p>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
