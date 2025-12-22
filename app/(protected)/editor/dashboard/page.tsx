import { getCurrentUser } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function EditorDashboard() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  if (!user) {
    return null // Should never happen due to layout protection
  }

  // Get user's blog posts
  const { data: myPosts, count: myPostsCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: publishedCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('published', true)

  const { count: draftCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)
    .eq('published', false)

  const stats = [
    {
      name: 'Total Posts',
      value: myPostsCount || 0,
      description: 'All your blog posts',
    },
    {
      name: 'Published',
      value: publishedCount || 0,
      description: 'Live on the site',
    },
    {
      name: 'Drafts',
      value: draftCount || 0,
      description: 'Work in progress',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back, {user.full_name || user.email}! Manage your blog posts and content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
              <p className="mt-2 text-sm text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Link
            href="/editor/blog/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Create New Post
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Posts
          </h2>
          {myPosts && myPosts.length > 0 ? (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {post.published ? (
                        <span className="text-green-600">Published</span>
                      ) : (
                        <span className="text-yellow-600">Draft</span>
                      )}
                      {' · '}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/editor/blog/${post.slug}/edit`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Edit →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              You haven&apos;t created any posts yet.{' '}
              <Link
                href="/editor/blog/new"
                className="text-blue-600 hover:text-blue-500"
              >
                Create your first post
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
