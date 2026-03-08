'use client'

import { PhaseInteractionLog } from '@/components/admin/PhaseInteractionLog'
import { PhaseActionItems } from '@/components/admin/PhaseActionItems'
import type { Interaction, ActionItem, AdminUser } from '@/types/crm'

interface ProposalSectionProps {
  formData: any
  updateField: (field: any, value: any) => void
  interactions: Interaction[]
  actionItems: ActionItem[]
  customerId: string
  adminUsers: AdminUser[]
  onInteractionsChanged: () => void
  onActionItemsChanged: () => void
}

export function ProposalSection({
  formData,
  updateField,
  interactions,
  actionItems,
  customerId,
  adminUsers,
  onInteractionsChanged,
  onActionItemsChanged,
}: ProposalSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Investigation Notes</label>
        <textarea
          rows={6}
          value={formData.investigation_notes || ''}
          onChange={(e) => updateField('investigation_notes', e.target.value)}
          placeholder="Notes from investigating possible improvements..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Proposed Solutions</label>
        <textarea
          rows={6}
          value={formData.proposed_solutions?.join('\n') || ''}
          onChange={(e) => updateField('proposed_solutions', e.target.value.split('\n').filter((s: string) => s.trim()))}
          placeholder="Enter each solution on a new line..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Setting solutions will auto-progress to &quot;Proposal Sent&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Proposal Presentation Date/Time</label>
          <input
            type="datetime-local"
            value={formData.proposal_presentation_datetime || ''}
            onChange={(e) => updateField('proposal_presentation_datetime', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Proposal Location</label>
          <input
            type="text"
            value={formData.proposal_location || ''}
            onChange={(e) => updateField('proposal_location', e.target.value)}
            placeholder="Virtual, Office, Customer site..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseInteractionLog
          interactions={interactions}
          customerId={customerId}
          phase="proposal"
          onAdded={onInteractionsChanged}
        />
        <PhaseActionItems
          actionItems={actionItems}
          customerId={customerId}
          phase="proposal"
          adminUsers={adminUsers}
          onChanged={onActionItemsChanged}
        />
      </div>
    </div>
  )
}
