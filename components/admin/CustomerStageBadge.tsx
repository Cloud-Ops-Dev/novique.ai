interface CustomerStageBadgeProps {
  stage: string
}

export function CustomerStageBadge({ stage }: CustomerStageBadgeProps) {
  const stageConfig: Record<string, { label: string; className: string; tooltip: string }> = {
    consultation_requested: {
      label: 'Consultation Requested',
      className: 'bg-blue-100 text-blue-800',
      tooltip: 'Initial consultation request received',
    },
    consultation_completed: {
      label: 'Consultation Done',
      className: 'bg-indigo-100 text-indigo-800',
      tooltip: 'Discovery meeting completed',
    },
    proposal_development: {
      label: 'Developing Proposal',
      className: 'bg-purple-100 text-purple-800',
      tooltip: 'Investigating solutions and preparing proposal',
    },
    proposal_sent: {
      label: 'Proposal Sent',
      className: 'bg-cyan-100 text-cyan-800',
      tooltip: 'Proposal sent to customer for review',
    },
    negotiation: {
      label: 'Negotiating',
      className: 'bg-yellow-100 text-yellow-800',
      tooltip: 'Customer reviewing and negotiating terms',
    },
    project_active: {
      label: 'Project Active',
      className: 'bg-green-100 text-green-800',
      tooltip: 'Project work in progress',
    },
    implementation: {
      label: 'Implementing',
      className: 'bg-teal-100 text-teal-800',
      tooltip: 'Solution being implemented',
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-emerald-100 text-emerald-800',
      tooltip: 'Solution demonstrated and delivered',
    },
    signed_off: {
      label: 'Signed Off',
      className: 'bg-lime-100 text-lime-800',
      tooltip: 'Customer has signed off on completion',
    },
    closed_won: {
      label: 'Closed Won',
      className: 'bg-green-200 text-green-900 font-semibold',
      tooltip: 'Project successfully completed and paid',
    },
    closed_lost: {
      label: 'Closed Lost',
      className: 'bg-gray-200 text-gray-700',
      tooltip: 'Opportunity lost',
    },
  }

  const config = stageConfig[stage] || {
    label: stage,
    className: 'bg-gray-100 text-gray-800',
    tooltip: '',
  }

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
      title={config.tooltip}
    >
      {config.label}
    </span>
  )
}
