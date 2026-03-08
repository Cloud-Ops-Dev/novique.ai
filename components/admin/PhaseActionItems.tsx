'use client'

import { useState } from 'react'
import type { CrmPhase, ActionItem, AdminUser } from '@/types/crm'

interface PhaseActionItemsProps {
  actionItems: ActionItem[]
  customerId: string
  phase: CrmPhase
  adminUsers: AdminUser[]
  onChanged: () => void
}

export function PhaseActionItems({
  actionItems,
  customerId,
  phase,
  adminUsers,
  onChanged,
}: PhaseActionItemsProps) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    assigned_to: '',
  })

  const handleAdd = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/action-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phase }),
      })
      if (res.ok) {
        setForm({ title: '', description: '', due_date: '', assigned_to: '' })
        setShowForm(false)
        onChanged()
      }
    } catch (e) {
      console.error('Failed to add action item:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item: ActionItem) => {
    const newStatus = item.status === 'open' ? 'completed' : 'open'
    try {
      const res = await fetch(
        `/api/customers/${customerId}/action-items/${item.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      )
      if (res.ok) onChanged()
    } catch (e) {
      console.error('Failed to toggle action item:', e)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(
        `/api/customers/${customerId}/action-items/${itemId}`,
        { method: 'DELETE' }
      )
      if (res.ok) onChanged()
    } catch (e) {
      console.error('Failed to delete action item:', e)
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date(new Date().toDateString())
  }

  const openItems = actionItems.filter((i) => i.status === 'open')
  const completedItems = actionItems.filter((i) => i.status === 'completed')

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h4 className="text-sm font-semibold text-gray-700">
          Action Items
          {openItems.length > 0 && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {openItems.length}
            </span>
          )}
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 border-b border-gray-200 bg-blue-50 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Send updated proposal"
              className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {adminUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={saving || !form.title.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {actionItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No action items yet</p>
        ) : (
          <>
            {openItems.map((item) => (
              <div key={item.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-gray-50 group">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => handleToggle(item)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.due_date && (
                      <span
                        className={`text-xs ${
                          isOverdue(item.due_date)
                            ? 'text-red-600 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        Due {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {item.assigned_to_profile?.full_name && (
                      <span className="text-xs text-gray-400">
                        → {item.assigned_to_profile.full_name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {completedItems.map((item) => (
              <div key={item.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-gray-50 group opacity-60">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => handleToggle(item)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 line-through">{item.title}</p>
                  {item.completed_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Completed {new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
