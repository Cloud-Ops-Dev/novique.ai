import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoSaveOptions {
  onSave: () => Promise<void>
  interval?: number // milliseconds
  enabled?: boolean
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  saveNow: () => Promise<void>
  error: Error | null
}

/**
 * Auto-save hook that periodically saves content
 * @param onSave - Async function to call for saving
 * @param interval - Save interval in milliseconds (default: 30000 = 30 seconds)
 * @param enabled - Whether auto-save is enabled (default: true)
 */
export function useAutoSave({
  onSave,
  interval = 30000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const contentRef = useRef<string>('')

  const saveNow = useCallback(async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      setError(null)
      await onSave()
      setLastSaved(new Date())
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed')
      setError(error)
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, isSaving])

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      return
    }

    const scheduleNextSave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        await saveNow()
        scheduleNextSave()
      }, interval)
    }

    scheduleNextSave()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, interval, saveNow])

  return {
    isSaving,
    lastSaved,
    saveNow,
    error,
  }
}
