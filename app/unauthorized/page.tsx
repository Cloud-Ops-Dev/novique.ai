import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-gray-900">403</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-gray-700">
            This page requires specific permissions that your account doesn&apos;t have.
          </p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact an administrator.
          </p>
        </div>

        <div className="mt-8 space-x-4">
          <Link
            href="/"
            className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/login"
            className="inline-block px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
