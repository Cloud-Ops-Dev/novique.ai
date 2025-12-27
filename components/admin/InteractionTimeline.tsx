'use client'

interface Interaction {
  id: string
  interaction_type: string
  subject?: string
  notes?: string
  interaction_date: string
  created_by_profile?: {
    id: string
    full_name: string | null
  }
}

interface InteractionTimelineProps {
  interactions: Interaction[]
  onAddInteraction?: () => void
}

export function InteractionTimeline({
  interactions,
  onAddInteraction,
}: InteractionTimelineProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No interactions yet</p>
        {onAddInteraction && (
          <button
            onClick={onAddInteraction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add First Interaction
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {onAddInteraction && (
        <div className="flex justify-end">
          <button
            onClick={onAddInteraction}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
            Add Interaction
          </button>
        </div>
      )}

      <div className="flow-root">
        <ul className="-mb-8">
          {interactions.map((interaction, index) => (
            <li key={interaction.id}>
              <div className="relative pb-8">
                {index !== interactions.length - 1 && (
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
                        <span className="font-medium text-gray-900">
                          {formatInteractionType(interaction.interaction_type)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatDate(interaction.interaction_date)}
                        {interaction.created_by_profile?.full_name && (
                          <span> • by {interaction.created_by_profile.full_name}</span>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {interaction.subject && (
                        <p className="font-medium">{interaction.subject}</p>
                      )}
                      {interaction.notes && (
                        <p className="mt-1 whitespace-pre-wrap">{interaction.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
