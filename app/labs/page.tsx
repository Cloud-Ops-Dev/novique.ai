import { Metadata } from 'next'
import { getAllLabs } from '@/lib/labs'
import LabCard from '@/components/labs/LabCard'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Labs | Novique.AI',
  description: 'Explore our hands-on infrastructure labs with animated workflow diagrams. Learn Terraform, AWS, Docker, and more through practical examples.',
}

export const revalidate = 60 // Revalidate every minute

export default async function LabsPage() {
  const labs = await getAllLabs()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium mb-6">
            Infrastructure Labs
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Learn by Building
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Explore hands-on infrastructure labs with animated workflow diagrams.
            Each lab walks you through real-world cloud deployments using Terraform, AWS, Docker, and more.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              Terraform
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              AWS
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              Docker
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
              Infrastructure as Code
            </span>
          </div>
        </div>
      </section>

      {/* Labs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-lg text-gray-600 mb-10">
          Here are some exploration/testing labs we built in GitHub while designing solutions for our customers.
          You can learn about these labs below, and there are links to GitHub if you want to try building them yourself.
        </p>

        {labs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Labs
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({labs.length} {labs.length === 1 ? 'lab' : 'labs'})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <LabCard key={lab.slug} lab={lab} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-300"
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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No Labs Yet</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Infrastructure labs are coming soon. Check back later for hands-on tutorials
              with animated workflow diagrams.
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Need Help with Your Infrastructure?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Our team can help you implement these patterns in your organization,
            customize solutions for your needs, or train your team on infrastructure as code.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
      </main>
      <Footer />
    </>
  )
}
