/**
 * schema.org JSON-LD builders (site audit 2026-08-13, batch 5).
 *
 * Plain-object builders consumed via <JsonLd data={...} />. Organization and
 * WebSite live in the root layout and cascade site-wide; per-content types
 * inline a minimal publisher/author so each script tag stands alone.
 */

import type { NoviqueApp } from "@/lib/apps/registry";
import { appUrl } from "@/lib/apps/registry";
import type { BlogPost } from "@/lib/blog";
import type { Lab } from "@/lib/labs";

const SITE_URL = "https://www.novique.ai";
const ORG_ID = `${SITE_URL}/#organization`;

// Same profiles /links points at.
const SOCIAL_PROFILES = [
  "https://www.linkedin.com/company/novique-ai/",
  "https://www.instagram.com/noviqueai/",
  "https://x.com/noviqueai",
];

const publisher = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Novique",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon.png`,
  },
};

/** Organization + WebSite graph for the root layout (every page). */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...publisher,
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Novique",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** BlogPosting for /blog/[slug]. */
export function blogPostingSchema(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: url,
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.headerImage ? { image: [post.headerImage] } : {}),
    author:
      post.author && post.author !== "Unknown"
        ? { "@type": "Person", name: post.author }
        : { "@id": ORG_ID },
    publisher,
  };
}

/** TechArticle for /labs/[slug]. */
export function techArticleSchema(lab: Lab) {
  const url = `${SITE_URL}/labs/${lab.slug}`;
  const description = lab.overview
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: lab.title,
    description,
    url,
    mainEntityOfPage: url,
    ...(lab.date ? { datePublished: lab.date } : {}),
    author: { "@id": ORG_ID },
    publisher,
  };
}

/** SoftwareApplication for /apps/[slug]. */
export function softwareApplicationSchema(app: NoviqueApp) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.appStoreName,
    description: app.shortDescription,
    url: appUrl(app.slug),
    operatingSystem: "iOS",
    applicationCategory: `${app.category}Application`,
    image: app.icon.src1024,
    ...(app.appStoreUrl ? { installUrl: app.appStoreUrl } : {}),
    author: publisher,
  };
}

/** FAQPage for a rendered question/answer list (e.g. /contact). */
export function faqPageSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
