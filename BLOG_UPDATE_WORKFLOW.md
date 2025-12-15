# Blog Update Workflow via Pull Request

This document explains how to update the blog content after the initial site deployment.

## Current State

The site is deployed with a "Coming Soon" placeholder for the blog section. The blog posts are already defined in `/lib/blog.ts` but are not currently displayed.

## Files to Update

### 1. `/app/blog/page.tsx`

**Current code (lines 1-5):**
```typescript
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
// import { getAllPosts } from "@/lib/blog"; // Temporarily disabled for initial launch
import { Metadata } from "next";
```

**Updated code:**
```typescript
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import { getAllPosts } from "@/lib/blog";
import { Metadata } from "next";
```

**Current code (line 15):**
```typescript
  // const allPosts = getAllPosts(); // Temporarily disabled for initial launch
```

**Updated code:**
```typescript
  const allPosts = getAllPosts();
```

**Replace the entire "Under Construction Section" (lines 33-61) with the original blog posts grid:**

```typescript
        {/* Blog Posts Grid */}
        <Section className="bg-white">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post) => (
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
                  {post.featured && (
                    <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      Featured
                    </span>
                  )}

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
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

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
        </Section>
```

## Pull Request Workflow

### Step 1: Create a New Branch

```bash
cd /home/clay/Documents/GitHub/novique.ai
git checkout -b blog-content-update
```

### Step 2: Make the Changes

Update `/app/blog/page.tsx` as described above to:
- Uncomment the imports for Link, Image, and getAllPosts
- Uncomment the `const allPosts = getAllPosts();` line
- Replace the "Under Construction" section with the blog posts grid

### Step 3: Test Locally

```bash
npm run build    # Test production build
npm run dev      # Test locally at http://localhost:3000
```

Visit http://localhost:3000/blog to verify the blog posts are displaying correctly.

### Step 4: Commit Changes

```bash
git add app/blog/page.tsx
git commit -m "Enable blog content display

- Uncommented getAllPosts import and usage
- Replaced 'Coming Soon' placeholder with blog posts grid
- Blog now displays all posts from lib/blog.ts
- All blog post pages remain functional"
```

### Step 5: Push Branch to GitHub

```bash
git push -u origin blog-content-update
```

### Step 6: Create Pull Request

Using GitHub CLI:
```bash
gh pr create --title "Enable blog content display" --body "$(cat <<'EOF'
## Summary
- Replaces 'Coming Soon' placeholder with actual blog posts
- All 5 blog posts now visible on /blog page
- Individual blog post pages remain functional

## Test plan
- ✅ Production build passes
- ✅ Blog listing page displays all posts
- ✅ Individual blog post pages load correctly
- ✅ Responsive design works on mobile/desktop
EOF
)"
```

Or via GitHub web interface:
1. Go to https://github.com/Cloud-Ops-Dev/novique.ai
2. Click "Compare & pull request" button
3. Add title: "Enable blog content display"
4. Add description summarizing changes
5. Click "Create pull request"

### Step 7: Review and Merge

1. Review the changes in the PR
2. Ensure Vercel preview deployment looks correct
3. Merge the PR to main
4. Vercel will automatically deploy the updated site

## Available Blog Posts

The following blog posts are already defined in `/lib/blog.ts` and will be displayed once the update is merged:

1. **The Accelerating Symphony** - AI, autonomous vehicles, and robotics (Featured)
2. **Introducing Novique** - AI solutions for small business (Featured)
3. **Localized AI with Docker and n8n** - Privacy-focused AI implementation
4. **How AI is Improving SOC Operations** - Security operations centers
5. **How Can AI Revolutionize Your Business Processes?** - Business automation (Featured)

## Adding New Blog Posts

To add new blog posts in the future:

1. Add a new post object to the `blogPosts` array in `/lib/blog.ts`
2. Follow the same PR workflow above
3. Test locally before creating PR

## Repository Information

- **GitHub Repository:** https://github.com/Cloud-Ops-Dev/novique.ai
- **Main Branch:** main
- **Local Path:** /home/clay/Documents/GitHub/novique.ai
