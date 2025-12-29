import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import Link from 'next/link'

export default async function EditorLabsPage() {
  const user = await getCurrentUser()
  // Use admin client to bypass RLS - we filter by author_id ourselves
  const supabase = createAdminClient()

  if (!user) return null

  // Get user's labs only
  const { data: labs } = await supabase
    .from('labs')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Get lab count by status for this user
  const { count: draftCount } = await supabase
    .from('labs')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('status', 'draft')

  const { count: publishedCount } = await supabase
    .from('labs')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('status', 'published')

  const { count: pendingCount } = await supabase
    .from('labs')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('status', 'pending_review')

  const stats = [
    { name: 'Total Labs', value: labs?.length || 0 },
    { name: 'Published', value: publishedCount || 0 },
    { name: 'Drafts', value: draftCount || 0 },
    { name: 'Pending Review', value: pendingCount || 0 },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Labs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage infrastructure labs with animated workflow diagrams
          </p>
        </div>
        <Link
          href="/editor/labs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New Lab
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stat.value}
              </dd>
            </div>
          </div>
        ))}
      </div>

      {/* Labs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labs && labs.length > 0 ? (
              labs.map((lab) => (
                <tr key={lab.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lab.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /labs/{lab.slug}
                        </div>
                      </div>
                      {lab.featured && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          Featured
                        </span>
                      )}
                      {lab.ai_generated && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          AI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        lab.status
                      )}`}
                    >
                      {lab.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lab.github_url ? (
                      <a
                        href={lab.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900 truncate max-w-xs block"
                      >
                        {lab.github_url.replace('https://github.com/', '')}
                      </a>
                    ) : (
                      <span className="text-gray-400">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lab.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/editor/labs/${lab.slug}/edit`}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      Edit
                    </Link>
                    {lab.status === 'published' && (
                      <Link
                        href={`/labs/${lab.slug}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    <p>You haven&apos;t created any labs yet.</p>
                    <Link
                      href="/editor/labs/new"
                      className="text-purple-600 hover:text-purple-500"
                    >
                      Create your first lab from a GitHub repository
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
