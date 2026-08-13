import type { MetadataRoute } from "next";
import { getAllApps, appPath } from "@/lib/apps/registry";
import { getAllPosts } from "@/lib/blog";
import { getAllLabs } from "@/lib/labs";
import { SEGMENT_URL_SLUGS } from "@/lib/roi/segments";

const BASE_URL = "https://www.novique.ai";

// Public, indexable static routes. /links is deliberately excluded (noindex
// link-in-bio page); auth/admin/editor surfaces never belong here.
const STATIC_ROUTES = [
  "/",
  "/work",
  "/services",
  "/about",
  "/consultation",
  "/contact",
  "/blog",
  "/labs",
  "/roi",
  "/roi/compare-plans",
  "/apps",
  "/privacy",
  "/terms",
];

/** Parse a stored date string; undefined when missing or unparseable. */
function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, labs] = await Promise.all([getAllPosts(), getAllLabs()]);
  const apps = getAllApps();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  const roiSegmentEntries: MetadataRoute.Sitemap = SEGMENT_URL_SLUGS.map(
    (segment) => ({
      url: `${BASE_URL}/roi/${segment}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  // Each app ships a landing page plus the App Store Connect-required public
  // /privacy and /support subpages — all three must stay reachable.
  const appEntries: MetadataRoute.Sitemap = apps.flatMap((app) => {
    const lastModified = toDate(app.privacy.effectiveDate);
    return (["", "privacy", "support"] as const).map((sub) => ({
      url: `${BASE_URL}${appPath(app.slug, sub)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: sub === "" ? 0.7 : 0.5,
    }));
  });

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: toDate(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const labEntries: MetadataRoute.Sitemap = labs.map((lab) => ({
    url: `${BASE_URL}/labs/${lab.slug}`,
    lastModified: toDate(lab.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...roiSegmentEntries,
    ...appEntries,
    ...postEntries,
    ...labEntries,
  ];
}
