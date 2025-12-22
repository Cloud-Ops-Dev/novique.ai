import { getCurrentUser } from '@/lib/auth/session'
import Link from 'next/link'
import BlogPostForm from '@/components/blog/BlogPostForm'

export default async function NewEditorBlogPostPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/editor/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link href="/editor/blog" className="text-gray-500 hover:text-gray-700">
              My Posts
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <span className="text-gray-900">New Post</span>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="mt-2 text-sm text-gray-700">
          Write and publish a new blog post
        </p>
      </div>

      {/* Form */}
      <BlogPostForm isAdmin={user?.role === 'admin'} />
    </div>
  )
}
