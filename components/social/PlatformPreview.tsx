'use client'

import type { SocialPlatform } from '@/lib/social/types'

interface PlatformPreviewProps {
  platform: SocialPlatform
  content: string
  hashtags: string[]
  sourceUrl?: string
  className?: string
}

function TwitterPreview({ content }: { content: string }) {
  // Content already includes hashtags from AI generation
  return (
    <div className="bg-black text-white rounded-xl p-4 max-w-[400px]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold">N</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold">Novique.AI</span>
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
            </svg>
          </div>
          <span className="text-gray-500 text-sm">@noviqueai</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-[15px] whitespace-pre-wrap break-words">
        {content}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-6 mt-4 text-gray-500 text-sm">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </span>
      </div>
    </div>
  )
}

function LinkedInPreview({ content }: { content: string }) {
  // Content already includes hashtags from AI generation
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[500px]">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-[#0A66C2] rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">N</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Novique.AI</div>
          <div className="text-sm text-gray-500">AI Consulting for Small Business</div>
          <div className="text-xs text-gray-400">Just now</div>
        </div>
      </div>

      {/* Content */}
      <div className="text-[14px] text-gray-900 whitespace-pre-wrap break-words">
        {content}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 text-gray-500 text-sm">
        <button className="flex items-center gap-1 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Like
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Repost
        </button>
      </div>
    </div>
  )
}

function InstagramPreview({ content }: { content: string }) {
  // Content already includes hashtags from AI generation
  return (
    <div className="bg-white border border-gray-200 rounded-lg max-w-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">N</span>
          </div>
        </div>
        <span className="font-semibold text-sm">noviqueai</span>
      </div>

      {/* Image Placeholder */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image required</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold">noviqueai</span>{' '}
          <span className="whitespace-pre-wrap">{content}</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">Link in bio</p>
      </div>
    </div>
  )
}

export default function PlatformPreview({
  platform,
  content,
  hashtags,
  className = '',
}: PlatformPreviewProps) {
  if (!content.trim()) {
    return (
      <div className={`text-center text-gray-400 py-8 ${className}`}>
        <p>Enter content to see preview</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {platform === 'twitter' && (
        <TwitterPreview content={content} />
      )}
      {platform === 'linkedin' && (
        <LinkedInPreview content={content} />
      )}
      {platform === 'instagram' && (
        <InstagramPreview content={content} />
      )}
    </div>
  )
}
