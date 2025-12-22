import { requireAdmin } from '@/lib/auth/session'
import { AdminNav } from '@/components/admin/AdminNav'

/**
 * Admin layout - requires admin role
 *
 * This layout wraps all /admin/* routes and enforces that:
 * 1. User must be authenticated
 * 2. User must have 'admin' role
 * 3. User account must be active
 *
 * If any condition fails, user is redirected to /unauthorized or /login
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect if not authenticated or not admin
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <AdminNav user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
