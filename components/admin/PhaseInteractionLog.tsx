'use client'

import { useState } from 'react'
import type { CrmPhase, Interaction } from '@/types/crm'

interface PhaseInteractionLogProps {
  interactions: Interaction[]
  customerId: string
  phase: CrmPhase
  onAdded: () => void
}

export function PhaseInteractionLog({
  interactions,
  customerId,
  phase,
  onAdded,
}: PhaseInteractionLogProps) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    interaction_type: 'meeting' as string,
    subject: '',
    notes: '',
    interaction_date: new Date().toISOString().slice(0, 16),
  })

  const handleSubmit = async () => {
    if (!form.subject.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phase,
          interaction_date: form.interaction_date
            ? new Date(form.interaction_date).toISOString()
            : new Date().toISOString(),
        }),
      })
      if (res.ok) {
        setForm({
          interaction_type: 'meeting',
          subject: '',
          notes: '',
          interaction_date: new Date().toISOString().slice(0, 16),
        })
        setShowForm(false)
        onAdded()
      }
    } catch (e) {
      console.error('Failed to add interaction:', e)
    } finally {
      setSaving(false)
    }
  }

  const typeIcons: Record<string, string> = {
    meeting: '🗓️',
    call: '📞',
    email: '📧',
    note: '📝',
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h4 className="text-sm font-semibold text-gray-700">Communication Log</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 border-b border-gray-200 bg-blue-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.interaction_type}
                onChange={(e) => setForm({ ...form, interaction_type: e.target.value })}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date/Time</label>
              <input
                type="datetime-local"
                value={form.interaction_date}
                onChange={(e) => setForm({ ...form, interaction_date: e.target.value })}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic / Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Discovery call with client"
              className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Summary / Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Key points discussed..."
              className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={saving || !form.subject.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {interactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No communication entries yet</p>
        ) : (
          interactions.map((item) => (
            <div key={item.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">{typeIcons[item.interaction_type] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.subject || 'No subject'}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(item.interaction_date)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap line-clamp-3">
                      {item.notes}
                    </p>
                  )}
                  {item.created_by_profile?.full_name && (
                    <p className="text-xs text-gray-400 mt-1">
                      by {item.created_by_profile.full_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
