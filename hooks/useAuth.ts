'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Client-side auth state hook
 *
 * Provides real-time authentication state in client components.
 *
 * @returns Auth state and helper functions
 *
 * @example
 * function MyComponent() {
 *   const { user, loading, signOut } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Not logged in</div>
 *
 *   return <div>Welcome {user.email}</div>
 * }
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  }
}
