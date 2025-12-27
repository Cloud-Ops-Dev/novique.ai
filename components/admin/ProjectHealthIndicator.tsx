interface ProjectHealthIndicatorProps {
  status: string
  blockers?: string
  dueDate?: string
}

export function ProjectHealthIndicator({
  status,
  blockers,
  dueDate,
}: ProjectHealthIndicatorProps) {
  const statusConfig: Record<string, { label: string; icon: string; className: string }> = {
    on_track: {
      label: 'On Track',
      icon: '🟢',
      className: 'text-green-700 bg-green-50 border-green-200',
    },
    at_risk: {
      label: 'At Risk',
      icon: '🟡',
      className: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    },
    delayed: {
      label: 'Delayed',
      icon: '🔴',
      className: 'text-red-700 bg-red-50 border-red-200',
    },
    blocked: {
      label: 'Blocked',
      icon: '🛑',
      className: 'text-red-800 bg-red-100 border-red-300',
    },
    completed: {
      label: 'Completed',
      icon: '✅',
      className: 'text-green-800 bg-green-100 border-green-300',
    },
  }

  const config = statusConfig[status] || statusConfig.on_track

  // Check if due date is approaching (within 7 days)
  const isDueSoon = dueDate && new Date(dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border ${config.className}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className="font-medium text-sm">{config.label}</span>
      </div>

      {blockers && (
        <div className="text-xs mt-1">
          <span className="font-semibold">Blockers:</span> {blockers}
        </div>
      )}

      {isDueSoon && dueDate && (
        <div className="text-xs mt-1 font-medium text-red-600">
          ⚠️ Due: {new Date(dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
