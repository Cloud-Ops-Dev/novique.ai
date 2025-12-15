import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
// import { getAllPosts } from "@/lib/blog"; // Temporarily disabled for initial launch
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Novique AI Solutions",
  description: "Read our latest articles on AI, automation, and small business technology.",
};

export default function BlogPage() {
  // const allPosts = getAllPosts(); // Temporarily disabled for initial launch

  return (
    <>
      <Header />
      <main>
        {/* Header */}
        <section className="bg-gradient-to-br from-primary-50 to-cyan-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Blog & Insights
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Discover how AI and automation can transform your small business with practical insights and real-world examples.
            </p>
          </div>
        </section>

        {/* Under Construction Section */}
        <Section className="bg-white">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <svg
                className="w-32 h-32 mx-auto text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Blog Coming Soon
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              We&apos;re preparing insightful articles about AI, automation, and small business technology.
            </p>
            <p className="text-lg text-gray-500">
              Check back soon for practical tips and real-world examples to help transform your business!
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
