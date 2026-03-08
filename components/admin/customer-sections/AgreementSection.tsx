'use client'

import { PhaseInteractionLog } from '@/components/admin/PhaseInteractionLog'
import { PhaseActionItems } from '@/components/admin/PhaseActionItems'
import type { Interaction, ActionItem, AdminUser } from '@/types/crm'

interface AgreementSectionProps {
  formData: any
  updateField: (field: any, value: any) => void
  interactions: Interaction[]
  actionItems: ActionItem[]
  customerId: string
  customerNumber?: string
  adminUsers: AdminUser[]
  onInteractionsChanged: () => void
  onActionItemsChanged: () => void
}

export function AgreementSection({
  formData,
  updateField,
  interactions,
  actionItems,
  customerId,
  customerNumber,
  adminUsers,
  onInteractionsChanged,
  onActionItemsChanged,
}: AgreementSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Accepted Solutions</label>
        <textarea
          rows={6}
          value={formData.accepted_solutions?.join('\n') || ''}
          onChange={(e) => updateField('accepted_solutions', e.target.value.split('\n').filter((s: string) => s.trim()))}
          placeholder="Enter each accepted solution on a new line..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Setting accepted solutions will auto-progress to &quot;Negotiation&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Implementation Cost</label>
          <input
            type="number"
            step="0.01"
            value={formData.agreed_implementation_cost || ''}
            onChange={(e) => updateField('agreed_implementation_cost', parseFloat(e.target.value))}
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Setting this will auto-progress to &quot;Project Active&quot;
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recurring Cost (Monthly)</label>
          <input
            type="number"
            step="0.01"
            value={formData.agreed_recurring_cost || ''}
            onChange={(e) => updateField('agreed_recurring_cost', parseFloat(e.target.value))}
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Delivery Requirements</label>
        <textarea
          rows={4}
          value={formData.delivery_requirements || ''}
          onChange={(e) => updateField('delivery_requirements', e.target.value)}
          placeholder="Specific requirements for delivery..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseInteractionLog
          interactions={interactions}
          customerId={customerId}
          phase="agreement"
          customerNumber={customerNumber}
          onAdded={onInteractionsChanged}
        />
        <PhaseActionItems
          actionItems={actionItems}
          customerId={customerId}
          phase="agreement"
          customerNumber={customerNumber}
          adminUsers={adminUsers}
          onChanged={onActionItemsChanged}
        />
      </div>
    </div>
  )
}
