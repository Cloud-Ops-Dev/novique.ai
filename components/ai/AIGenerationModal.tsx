'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIGenerationModal({ isOpen, onClose }: AIGenerationModalProps) {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [useOpenAI, setUseOpenAI] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim() && !keywords.trim()) {
      setError('Please enter either a topic or keywords')
      return
    }

    setIsGenerating(true)
    setError('')
    setProgress('Starting AI generation...')

    try {
      const keywordsArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)

      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
          useOpenAI,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate blog post')
      }

      const result = await response.json()

      setProgress('✅ Blog post generated successfully!')

      // Wait a moment to show success message
      setTimeout(() => {
        onClose()
        router.push(`/admin/blog/${result.data.slug}/edit`)
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog post')
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Generate AI Blog Post</h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {progress && !error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {progress}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic (Optional)
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="e.g., How AI is transforming small businesses"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank to auto-generate topic from trending research
            </p>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="e.g., AI, automation, productivity"
            />
          </div>

          <div className="flex items-center">
            <input
              id="useOpenAI"
              type="checkbox"
              checked={useOpenAI}
              onChange={(e) => setUseOpenAI(e.target.checked)}
              disabled={isGenerating}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="useOpenAI" className="ml-2 text-sm text-gray-700">
              Use OpenAI instead of Claude (fallback)
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>AI researches the topic using web search and RSS feeds</li>
            <li>Generates a detailed blog outline</li>
            <li>Writes 1500+ word blog post with SEO optimization</li>
            <li>Selects professional header image from Unsplash</li>
            <li>Creates draft with status &quot;Pending Review&quot;</li>
          </ol>
          <p className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> Generation takes 30-60 seconds. The post will be saved as a
            draft for you to review and edit before publishing.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Blog Post'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
