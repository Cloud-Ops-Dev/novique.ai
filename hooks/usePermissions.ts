'use client'

import { useMemo } from 'react'
import { useUser } from './useUser'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isEditorOrHigher,
  type Role,
} from '@/lib/auth/roles'

/**
 * Client-side permissions hook
 *
 * Provides permission checking functions for the current user.
 *
 * @returns Permission checking functions
 *
 * @example
 * function BlogPostActions({ postAuthorId }) {
 *   const { can, isAdmin } = usePermissions()
 *
 *   const canEdit = can('blog:update_own') || isAdmin
 *   const canDelete = isAdmin
 *
 *   return (
 *     <div>
 *       {canEdit && <button>Edit</button>}
 *       {canDelete && <button>Delete</button>}
 *     </div>
 *   )
 * }
 */
export function usePermissions() {
  const { profile, loading } = useUser()

  const permissions = useMemo(() => {
    if (!profile) {
      return {
        can: () => false,
        canAny: () => false,
        canAll: () => false,
        isAdmin: false,
        isEditorOrHigher: false,
        role: null as Role | null,
        loading,
      }
    }

    return {
      /**
       * Check if user has a specific permission
       * @param permission - Permission to check (e.g., 'blog:update')
       */
      can: (permission: string) => hasPermission(profile.role, permission),

      /**
       * Check if user has ANY of the given permissions
       * @param permissions - Array of permissions to check
       */
      canAny: (permissions: string[]) =>
        hasAnyPermission(profile.role, permissions),

      /**
       * Check if user has ALL of the given permissions
       * @param permissions - Array of permissions to check
       */
      canAll: (permissions: string[]) =>
        hasAllPermissions(profile.role, permissions),

      /**
       * Check if user is admin
       */
      isAdmin: isAdmin(profile.role),

      /**
       * Check if user is editor or higher
       */
      isEditorOrHigher: isEditorOrHigher(profile.role),

      /**
       * Current user's role
       */
      role: profile.role,

      /**
       * Loading state
       */
      loading,
    }
  }, [profile, loading])

  return permissions
}
