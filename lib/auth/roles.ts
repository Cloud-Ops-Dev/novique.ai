/**
 * Role and Permission System
 *
 * Defines user roles and their associated permissions.
 * This works in conjunction with Row Level Security policies in the database.
 */

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Permission matrix defining what each role can do
 *
 * Permissions are organized by resource:action format
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    // Admin has all permissions
    '*',
  ],
  editor: [
    // Blog permissions
    'blog:read',
    'blog:create',
    'blog:update_own',
    'blog:delete_own',
    // Profile permissions
    'profile:read_own',
    'profile:update_own',
    // Consultation requests
    'consultation:read_own',
  ],
  viewer: [
    // Blog permissions
    'blog:read',
    // Profile permissions
    'profile:read_own',
    'profile:update_own',
  ],
}

/**
 * Check if a role has a specific permission
 *
 * @param role - User's role
 * @param permission - Permission to check (e.g., 'blog:update')
 * @returns true if role has permission
 *
 * @example
 * hasPermission('admin', 'blog:delete') // true
 * hasPermission('editor', 'blog:update_own') // true
 * hasPermission('viewer', 'blog:delete') // false
 */
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]

  // Admin has all permissions
  if (permissions.includes('*')) {
    return true
  }

  // Check for exact permission match
  if (permissions.includes(permission)) {
    return true
  }

  // Check for wildcard permission (e.g., 'blog:*' matches 'blog:read')
  const [resource] = permission.split(':')
  if (permissions.includes(`${resource}:*`)) {
    return true
  }

  return false
}

/**
 * Check if a role has ANY of the given permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has at least one permission
 */
export function hasAnyPermission(role: Role, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Check if a role has ALL of the given permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if role has all permissions
 */
export function hasAllPermissions(role: Role, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Check if a role is admin
 *
 * @param role - User's role
 * @returns true if role is admin
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN
}

/**
 * Check if a role is editor or higher
 *
 * @param role - User's role
 * @returns true if role is editor or admin
 */
export function isEditorOrHigher(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.EDITOR
}
