import Link from 'next/link'
import type { UserProfile } from '@/lib/auth/session'

interface EditorNavProps {
  user: UserProfile
}

export function EditorNav({ user }: EditorNavProps) {
  const navLinks = [
    { href: '/editor/dashboard', label: 'Dashboard' },
    { href: '/editor/blog', label: 'My Posts' },
    { href: '/editor/blog/new', label: 'New Post' },
  ]

  // Show admin link if user is admin
  const isAdmin = user.role === 'admin'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Navigation */}
          <div className="flex space-x-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Editor Panel</h1>
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

          {/* Right side - User info and links */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {user.full_name || user.email}
            </div>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Admin Panel
              </Link>
            )}
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
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-50"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
