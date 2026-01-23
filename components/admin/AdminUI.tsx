'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

// ============================================
// Admin Page Header
// ============================================
interface AdminPageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, icon, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

// ============================================
// Admin Stat Card
// ============================================
interface AdminStatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  href?: string
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-900',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-700',
  },
}

export function AdminStatCard({ label, value, icon, trend, variant = 'default', href }: AdminStatCardProps) {
  const styles = variantStyles[variant]

  const content = (
    <div className={`${styles.bg} rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow p-5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
          <dd className={`mt-2 text-3xl font-bold ${styles.valueColor}`}>{value}</dd>
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span className={trend.positive ? 'text-emerald-600' : 'text-red-600'}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}

// ============================================
// Admin Stats Grid
// ============================================
interface AdminStatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function AdminStatsGrid({ children, columns = 4 }: AdminStatsGridProps) {
  const colClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid grid-cols-1 gap-4 ${colClasses[columns]}`}>
      {children}
    </div>
  )
}

// ============================================
// Admin Card (generic container)
// ============================================
interface AdminCardProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  noPadding?: boolean
}

export function AdminCard({ title, description, children, actions, noPadding }: AdminCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  )
}

// ============================================
// Admin Filter Bar
// ============================================
interface AdminFilterBarProps {
  children: ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function AdminFilterBar({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...'
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      {onSearchChange && (
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

// ============================================
// Admin Select (styled dropdown)
// ============================================
interface AdminSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function AdminSelect({ value, onChange, options, className = '' }: AdminSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ============================================
// Admin Table Wrapper
// ============================================
interface AdminTableProps {
  children: ReactNode
}

export function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  )
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  )
}

export function AdminTableHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
}

export function AdminTableRow({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function AdminTableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>
}

// ============================================
// Admin Empty State
// ============================================
interface AdminEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Admin Button
// ============================================
interface AdminButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  icon?: ReactNode
  className?: string
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/25',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/25',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled,
  icon,
  className = ''
}: AdminButtonProps) {
  const classes = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${buttonVariants[variant]} ${buttonSizes[size]} ${className}
  `

  const content = (
    <>
      {icon && <span className="mr-2 -ml-0.5">{icon}</span>}
      {children}
    </>
  )

  if (href) {
    return <Link href={href} className={classes}>{content}</Link>
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}

// ============================================
// Admin Skeleton Loaders
// ============================================
export function AdminSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function AdminStatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AdminSkeleton className="h-4 w-24 mb-3" />
          <AdminSkeleton className="h-9 w-20" />
        </div>
        <AdminSkeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  )
}

export function AdminTableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <AdminSkeleton className="h-5 w-full max-w-[200px]" />
        </td>
      ))}
    </tr>
  )
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <AdminSkeleton className="w-12 h-12 rounded-xl" />
        <div>
          <AdminSkeleton className="h-8 w-48 mb-2" />
          <AdminSkeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminStatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <AdminSkeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-4">
              <AdminSkeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <AdminSkeleton className="h-5 w-48" />
                <AdminSkeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Admin Tabs
// ============================================
interface AdminTab {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

interface AdminTabsProps {
  tabs: AdminTab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function AdminTabs({ tabs, activeTab, onChange }: AdminTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && (
                <span className={`mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                    ${isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
