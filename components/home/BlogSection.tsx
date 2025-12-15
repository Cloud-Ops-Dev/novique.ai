import Link from "next/link";
import Image from "next/image";
import Section from "../Section";
import Button from "../Button";
import { getFeaturedPosts } from "@/lib/blog";

export default function BlogSection() {
  const featuredPosts = getFeaturedPosts();

  return (
    <Section className="bg-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Latest Insights
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with our latest articles on AI, automation, and small business technology.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {featuredPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-cyan-100">
                {/* Placeholder for blog header image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-sm">Blog Image</span>
                </div>
              </div>
            </Link>

            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{post.author}</span>
              </div>

              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                  {post.title}
                </h3>
              </Link>

              <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>

              <Link
                href={`/blog/${post.slug}`}
                className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-2"
              >
                Read More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Button href="/blog" variant="outline" size="lg">
          View All Articles
        </Button>
      </div>
    </Section>
  );
}
