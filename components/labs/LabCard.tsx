import Link from 'next/link'
import { Lab } from '@/lib/labs'
import AnimatedWorkflow from './AnimatedWorkflow'

interface LabCardProps {
  lab: Lab
}

export default function LabCard({ lab }: LabCardProps) {
  const formattedDate = new Date(lab.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Strip HTML tags from overview for preview
  const overviewText = lab.overview.replace(/<[^>]*>/g, '').substring(0, 150)

  return (
    <Link href={`/labs/${lab.slug}`}>
      <article className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* SVG Preview */}
        <div className="relative h-48 bg-gray-50">
          {lab.workflowSvg ? (
            <AnimatedWorkflow svg={lab.workflowSvg} height="100%" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-16 h-16 text-gray-300"
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
            </div>
          )}

          {/* Featured badge */}
          {lab.featured && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <time dateTime={lab.date}>{formattedDate}</time>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {lab.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {overviewText}...
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {lab.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {tag}
              </span>
            ))}
            {lab.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{lab.tags.length - 3} more</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
