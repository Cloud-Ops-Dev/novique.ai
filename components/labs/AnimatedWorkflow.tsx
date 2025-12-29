'use client'

import { useState, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'

interface AnimatedWorkflowProps {
  svg: string
  height?: string
  className?: string
  showControls?: boolean
}

export default function AnimatedWorkflow({
  svg,
  height = '25vh',
  className = '',
  showControls = false,
}: AnimatedWorkflowProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [key, setKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sanitize SVG on client side
  const sanitizedSvg = typeof window !== 'undefined'
    ? DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['animate', 'animateTransform', 'animateMotion'],
        ADD_ATTR: [
          'attributeName',
          'values',
          'dur',
          'repeatCount',
          'begin',
          'fill',
          'calcMode',
          'keyTimes',
          'keySplines',
        ],
      })
    : svg

  // Handle animation pause/play
  useEffect(() => {
    if (!containerRef.current) return

    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) return

    if (isPlaying) {
      svgElement.unpauseAnimations?.()
    } else {
      svgElement.pauseAnimations?.()
    }
  }, [isPlaying])

  const handleRestart = () => {
    setKey((prev) => prev + 1)
    setIsPlaying(true)
  }

  if (!svg) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-gray-400">No workflow diagram available</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        key={key}
        ref={containerRef}
        className="w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
        style={{ height, minHeight: '200px' }}
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />

      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 text-sm bg-white/90 hover:bg-white rounded-md shadow-sm border border-gray-200 transition-colors"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleRestart}
            className="px-3 py-1.5 text-sm bg-white/90 hover:bg-white rounded-md shadow-sm border border-gray-200 transition-colors"
            aria-label="Restart animation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
