'use client'

interface CharacterCounterProps {
  current: number
  max: number
  className?: string
}

export default function CharacterCounter({
  current,
  max,
  className = '',
}: CharacterCounterProps) {
  const percentage = (current / max) * 100
  const remaining = max - current

  // Determine color based on percentage
  let colorClass = 'text-gray-500' // Default
  if (percentage >= 100) {
    colorClass = 'text-red-600 font-semibold'
  } else if (percentage >= 90) {
    colorClass = 'text-red-500'
  } else if (percentage >= 80) {
    colorClass = 'text-yellow-600'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`text-sm ${colorClass}`}>
        {current.toLocaleString()} / {max.toLocaleString()}
      </span>
      {remaining < 0 && (
        <span className="text-xs text-red-600 font-medium">
          ({Math.abs(remaining)} over)
        </span>
      )}
      {remaining >= 0 && remaining <= 20 && (
        <span className="text-xs text-yellow-600">
          ({remaining} left)
        </span>
      )}
    </div>
  )
}
