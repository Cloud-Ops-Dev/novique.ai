'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/auth/session'

/**
 * Client-side user profile hook
 *
 * Fetches and provides the current user's profile data from the database.
 *
 * @returns User profile state
 *
 * @example
 * function UserDashboard() {
 *   const { profile, loading, error } = useUser()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error loading profile</div>
 *   if (!profile) return <div>Not logged in</div>
 *
 *   return <div>Welcome {profile.full_name || profile.email}!</div>
 * }
 */
export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        // Fetch profile from database
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setProfile(data as UserProfile)
      } catch (err) {
        console.error('Error loading user profile:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  /**
   * Refresh the user profile from the database
   */
  const refresh = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    refresh,
  }
}
