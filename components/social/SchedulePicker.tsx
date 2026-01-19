'use client'

interface SchedulePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
  error?: string
}

export default function SchedulePicker({
  value,
  onChange,
  className = '',
  error,
}: SchedulePickerProps) {
  // Format datetime-local value
  const formatDateTimeLocal = (isoString: string | null): string => {
    if (!isoString) return ''
    const date = new Date(isoString)
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Get minimum datetime (now)
  const getMinDateTime = (): string => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // At least 5 minutes from now
    return formatDateTimeLocal(now.toISOString())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!newValue) {
      onChange(null)
    } else {
      // Convert to ISO string
      const date = new Date(newValue)
      onChange(date.toISOString())
    }
  }

  const handleClear = () => {
    onChange(null)
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={formatDateTimeLocal(value)}
          onChange={handleChange}
          min={getMinDateTime()}
          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {value && (
        <p className="mt-1 text-xs text-gray-500">
          Scheduled for:{' '}
          {new Date(value).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          })}
        </p>
      )}
    </div>
  )
}
