'use client'

import { useState, useEffect } from 'react'
import { PlatformBadge, PlatformPreview, CharacterCounter } from '@/components/social'
import type { SocialPlatform, GeneratedSocialContent } from '@/lib/social/types'

interface BlogPost {
  id: string
  slug: string
  title: string
  summary: string
}

interface SocialGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
  preselectedBlogId?: string
}

const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
}

export default function SocialGenerateModal({
  isOpen,
  onClose,
  onSave,
  preselectedBlogId,
}: SocialGenerateModalProps) {
  const [step, setStep] = useState<'select' | 'generate' | 'review'>('select')
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [selectedBlog, setSelectedBlog] = useState<string>(preselectedBlogId || '')
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'twitter',
    'linkedin',
  ])
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedSocialContent[]>([])
  const [editedContent, setEditedContent] = useState<Record<SocialPlatform, string>>({
    twitter: '',
    linkedin: '',
    instagram: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Load blog posts
  useEffect(() => {
    if (isOpen) {
      loadBlogs()
    }
  }, [isOpen])

  // Reset on preselectedBlogId change
  useEffect(() => {
    if (preselectedBlogId) {
      setSelectedBlog(preselectedBlogId)
    }
  }, [preselectedBlogId])

  async function loadBlogs() {
    try {
      const response = await fetch('/api/blog?status=published&limit=50')
      if (!response.ok) throw new Error('Failed to load blogs')
      const result = await response.json()
      setBlogs(result.data || [])
    } catch (err) {
      console.error('Failed to load blogs:', err)
    }
  }

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleGenerate = async () => {
    if (!selectedBlog || selectedPlatforms.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'blog',
          source_id: selectedBlog,
          platforms: selectedPlatforms,
          save_drafts: false,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate posts')
      }

      const result = await response.json()
      setGeneratedPosts(result.posts || [])

      // Initialize edited content
      const edited: Record<SocialPlatform, string> = {
        twitter: '',
        linkedin: '',
        instagram: '',
      }
      result.posts?.forEach((post: GeneratedSocialContent) => {
        edited[post.platform] = post.content
      })
      setEditedContent(edited)

      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const blog = blogs.find((b) => b.id === selectedBlog)

      // Save each post as a draft
      for (const post of generatedPosts) {
        const response = await fetch('/api/social/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: post.platform,
            content: editedContent[post.platform],
            hashtags: post.hashtags,
            status: 'draft',
            sourceType: 'blog',
            sourceId: selectedBlog,
            sourceTitle: blog?.title,
            sourceUrl: blog ? `https://novique.ai/blog/${blog.slug}` : null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to save ${post.platform} post`)
        }
      }

      onSave?.()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save posts')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setStep('select')
    setSelectedBlog(preselectedBlogId || '')
    setSelectedPlatforms(['twitter', 'linkedin'])
    setGeneratedPosts([])
    setEditedContent({ twitter: '', linkedin: '', instagram: '' })
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'select' && 'Generate Social Posts'}
            {step === 'generate' && 'Generating...'}
            {step === 'review' && 'Review & Save'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' && (
            <div className="space-y-6">
              {/* Blog Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blog Post
                </label>
                <select
                  value={selectedBlog}
                  onChange={(e) => setSelectedBlog(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a blog post...</option>
                  {blogs.map((blog) => (
                    <option key={blog.id} value={blog.id}>
                      {blog.title}
                    </option>
                  ))}
                </select>
                {selectedBlog && (
                  <p className="mt-2 text-sm text-gray-500">
                    {blogs.find((b) => b.id === selectedBlog)?.summary}
                  </p>
                )}
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Platforms
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['twitter', 'linkedin', 'instagram'] as SocialPlatform[]).map(
                    (platform) => (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedPlatforms.includes(platform)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <PlatformBadge platform={platform} showLabel={false} size="md" />
                        <span className="font-medium">
                          {platform === 'twitter' ? 'X' : platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                        </span>
                        {selectedPlatforms.includes(platform) && (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-8">
              {generatedPosts.map((post) => (
                <div key={post.platform} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <PlatformBadge platform={post.platform} size="md" />
                      <CharacterCounter
                        current={editedContent[post.platform].length}
                        max={PLATFORM_LIMITS[post.platform]}
                      />
                    </div>
                    <textarea
                      value={editedContent[post.platform]}
                      onChange={(e) =>
                        setEditedContent((prev) => ({
                          ...prev,
                          [post.platform]: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    {post.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.hashtags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-start">
                    <PlatformPreview
                      platform={post.platform}
                      content={editedContent[post.platform]}
                      hashtags={post.hashtags}
                    />
                  </div>
                </div>
              ))}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          {step === 'select' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!selectedBlog || selectedPlatforms.length === 0 || loading}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loading ? 'Generating...' : 'Generate Posts'}
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={() => setStep('select')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save as Drafts'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
