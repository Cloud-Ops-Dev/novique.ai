import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Role, ROLES, hasPermission, isAdmin } from './roles'

/**
 * User profile type from database
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get the current user's session and profile
 *
 * @returns User profile if authenticated, null if not
 *
 * Use this in Server Components to check if user is logged in.
 *
 * @example
 * const user = await getCurrentUser()
 * if (!user) {
 *   return <div>Please log in</div>
 * }
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile from database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile as UserProfile
}

/**
 * Require authentication - redirect to login if not authenticated
 *
 * @returns User profile (guaranteed to exist)
 * @throws Redirects to /login if not authenticated
 *
 * Use this in Server Components that require authentication.
 *
 * @example
 * const user = await requireAuth()
 * // User is guaranteed to be authenticated here
 */
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!user.is_active) {
    redirect('/login?error=account_disabled')
  }

  return user
}

/**
 * Require specific role(s) - redirect if user doesn't have required role
 *
 * @param allowedRoles - Single role or array of allowed roles
 * @returns User profile (guaranteed to have required role)
 * @throws Redirects to /login or /unauthorized
 *
 * Use this in Server Components that require specific roles.
 *
 * @example
 * // Require admin role
 * const user = await requireRole('admin')
 *
 * @example
 * // Allow admin or editor
 * const user = await requireRole(['admin', 'editor'])
 */
export async function requireRole(
  allowedRoles: Role | Role[]
): Promise<UserProfile> {
  const user = await requireAuth()

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Require specific permission - redirect if user doesn't have permission
 *
 * @param permission - Required permission (e.g., 'blog:delete')
 * @returns User profile (guaranteed to have permission)
 * @throws Redirects to /unauthorized
 *
 * @example
 * const user = await requirePermission('blog:delete')
 */
export async function requirePermission(
  permission: string
): Promise<UserProfile> {
  const user = await requireAuth()

  if (!hasPermission(user.role, permission)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Require admin role - shorthand for requireRole('admin')
 *
 * @returns User profile (guaranteed to be admin)
 * @throws Redirects to /unauthorized
 *
 * @example
 * const user = await requireAdmin()
 */
export async function requireAdmin(): Promise<UserProfile> {
  return requireRole(ROLES.ADMIN)
}

/**
 * Require user to be admin or editor (for read-only admin panel access)
 *
 * @returns User profile (guaranteed to be admin or editor)
 * @throws Redirects to /unauthorized
 *
 * @example
 * const user = await requireAdminOrEditor()
 */
export async function requireAdminOrEditor(): Promise<UserProfile> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== ROLES.ADMIN && user.role !== ROLES.EDITOR) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Check if current user can perform action on resource
 *
 * @param resourceOwnerId - ID of the user who owns the resource
 * @param permission - Permission required to modify (e.g., 'blog:update')
 * @returns true if user can perform action
 *
 * Use this to check if user can edit their own resources vs. any resource.
 *
 * @example
 * const user = await getCurrentUser()
 * const post = await getBlogPost(slug)
 *
 * if (!canModifyResource(post.author_id, 'blog:update')) {
 *   return <div>Not authorized</div>
 * }
 */
export async function canModifyResource(
  resourceOwnerId: string,
  permission: string
): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  // Admins can modify anything
  if (isAdmin(user.role)) {
    return true
  }

  // Check if user owns the resource
  if (user.id === resourceOwnerId) {
    // Check if they have the _own version of the permission
    const ownPermission = `${permission}_own`
    return hasPermission(user.role, ownPermission)
  }

  // User doesn't own resource and isn't admin
  return false
}
