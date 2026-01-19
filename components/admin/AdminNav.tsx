import Link from 'next/link'
import type { UserProfile } from '@/lib/auth/session'

interface AdminNavProps {
  user: UserProfile
}

export function AdminNav({ user }: AdminNavProps) {
  // Define all possible nav links with role requirements
  const allNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', roles: ['admin', 'editor'] },
    { href: '/admin/communications', label: 'Communications', roles: ['admin', 'editor'] },
    { href: '/admin/consultations', label: 'Consultations', roles: ['admin', 'editor'] },
    { href: '/admin/customers', label: 'Customers', roles: ['admin', 'editor'] },
    { href: '/admin/users', label: 'Users', roles: ['admin'] },
    { href: '/admin/blog', label: 'Blog Posts', roles: ['admin', 'editor'] },
    { href: '/admin/social', label: 'Social', roles: ['admin', 'editor'] },
  ]

  // Filter nav links based on user role
  const navLinks = allNavLinks.filter((link) => link.roles.includes(user.role))

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Navigation */}
          <div className="flex space-x-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="hidden md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - User info and back to site */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {user.full_name || user.email}
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
