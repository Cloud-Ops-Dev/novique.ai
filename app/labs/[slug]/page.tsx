import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLabBySlug, getAllLabs } from '@/lib/labs'
import AnimatedWorkflow from '@/components/labs/AnimatedWorkflow'

interface LabPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const labs = await getAllLabs()
  return labs.map((lab) => ({ slug: lab.slug }))
}

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { slug } = await params
  const lab = await getLabBySlug(slug)

  if (!lab) {
    return { title: 'Lab Not Found | Novique.AI' }
  }

  // Strip HTML from overview for description
  const description = lab.overview.replace(/<[^>]*>/g, '').substring(0, 160)

  return {
    title: `${lab.title} | Labs | Novique.AI`,
    description,
    openGraph: {
      title: lab.title,
      description,
      type: 'article',
    },
  }
}

export default async function LabPage({ params }: LabPageProps) {
  const { slug } = await params
  const lab = await getLabBySlug(slug)

  if (!lab) {
    notFound()
  }

  const formattedDate = new Date(lab.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/labs"
            className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Labs
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{lab.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-purple-200">
            <time dateTime={lab.date}>{formattedDate}</time>
            <span>•</span>
            <span>{lab.author}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {lab.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Workflow Diagram */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <AnimatedWorkflow
            svg={lab.workflowSvg || ''}
            height="45vh"
            showControls={true}
          />
        </div>
        {lab.githubUrl && (
          <div className="text-center mt-4">
            <a
              href={lab.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        )}
      </section>

      {/* Content Sections */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Lab Overview */}
        {lab.overview && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-lg">
                1
              </span>
              Lab Overview
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 [&_ul]:space-y-1 [&_ol]:space-y-1"
              dangerouslySetInnerHTML={{ __html: lab.overview }}
            />
          </section>
        )}

        {/* Architecture */}
        {lab.architecture && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg">
                2
              </span>
              Architecture
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 [&_ul]:space-y-1 [&_ol]:space-y-1"
              dangerouslySetInnerHTML={{ __html: lab.architecture }}
            />
          </section>
        )}

        {/* Setup and Deployment */}
        {lab.setupDeployment && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 text-lg">
                3
              </span>
              Setup and Deployment
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 [&_ul]:space-y-1 [&_ol]:space-y-1"
              dangerouslySetInnerHTML={{ __html: lab.setupDeployment }}
            />
          </section>
        )}

        {/* Troubleshooting Highlights */}
        {lab.troubleshooting && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3 text-lg">
                4
              </span>
              Troubleshooting Highlights
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 [&_ul]:space-y-1 [&_ol]:space-y-1"
              dangerouslySetInnerHTML={{ __html: lab.troubleshooting }}
            />
          </section>
        )}

        {/* Practical Business Use */}
        {lab.businessUse && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-lg">
                5
              </span>
              Practical Business Use
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 [&_ul]:space-y-1 [&_ol]:space-y-1"
              dangerouslySetInnerHTML={{ __html: lab.businessUse }}
            />
          </section>
        )}
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Need Help Implementing This?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Our team can help you customize this infrastructure for your organization,
            or train your team on infrastructure as code best practices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Book a Consultation
            </Link>
            <Link
              href="/labs"
              className="inline-flex items-center justify-center px-8 py-3 border border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
            >
              View More Labs
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
