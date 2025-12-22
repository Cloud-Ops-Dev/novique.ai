'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AIGenerationModal from '@/components/ai/AIGenerationModal'

export default function AdminBlogPage() {
  const [showAIModal, setShowAIModal] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const supabase = createClient()

    // Get all blog posts
    const { data: postsData } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, email)')
      .order('created_at', { ascending: false })

    // Get post count by status
    const { count: draftCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    const { count: publishedCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    const { count: pendingCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')

    setPosts(postsData || [])
    setStats({
      total: postsData?.length || 0,
      published: publishedCount || 0,
      draft: draftCount || 0,
      pending: pendingCount || 0,
    })
    setLoading(false)
  }

  const statsArray = [
    { name: 'Total Posts', value: stats.total },
    { name: 'Published', value: stats.published },
    { name: 'Drafts', value: stats.draft },
    { name: 'Pending Review', value: stats.pending },
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* AI Generation Modal */}
      <AIGenerationModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-2 text-sm text-gray-700">Manage all blog posts and content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            AI Generate
          </button>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
            New Post
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {statsArray.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Posts Table */}
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
                Author
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
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">/blog/{post.slug}</div>
                      </div>
                      {post.featured && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          Featured
                        </span>
                      )}
                      {post.ai_generated && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          AI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {post.author?.full_name || post.author?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        post.status
                      )}`}
                    >
                      {post.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="space-y-2">
                    <p>No blog posts yet.</p>
                    <Link href="/admin/blog/new" className="text-blue-600 hover:text-blue-500">
                      Create your first post
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
