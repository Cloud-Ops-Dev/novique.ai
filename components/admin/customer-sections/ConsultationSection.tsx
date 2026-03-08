'use client'

import { PhaseInteractionLog } from '@/components/admin/PhaseInteractionLog'
import { PhaseActionItems } from '@/components/admin/PhaseActionItems'
import type { Interaction, ActionItem, AdminUser } from '@/types/crm'

interface ConsultationSectionProps {
  formData: any
  updateField: (field: any, value: any) => void
  interactions: Interaction[]
  actionItems: ActionItem[]
  customerId: string
  adminUsers: AdminUser[]
  onInteractionsChanged: () => void
  onActionItemsChanged: () => void
}

export function ConsultationSection({
  formData,
  updateField,
  interactions,
  actionItems,
  customerId,
  adminUsers,
  onInteractionsChanged,
  onActionItemsChanged,
}: ConsultationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Consultation Date</label>
          <input
            type="date"
            value={formData.consultation_occurred_date || ''}
            onChange={(e) => updateField('consultation_occurred_date', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Setting this will auto-progress to &quot;Consultation Completed&quot;
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Consultation Notes</label>
        <textarea
          rows={6}
          value={formData.consultation_notes || ''}
          onChange={(e) => updateField('consultation_notes', e.target.value)}
          placeholder="Notes from the discovery meeting..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseInteractionLog
          interactions={interactions}
          customerId={customerId}
          phase="consultation"
          onAdded={onInteractionsChanged}
        />
        <PhaseActionItems
          actionItems={actionItems}
          customerId={customerId}
          phase="consultation"
          adminUsers={adminUsers}
          onChanged={onActionItemsChanged}
        />
      </div>
    </div>
  )
}
