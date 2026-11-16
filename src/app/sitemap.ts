import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [categories, videos, posts] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.video.findMany({ where: { published: true, category: { active: true } }, select: { slug: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { published: true, category: { active: true } }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    "",
    "/categories",
    "/videos",
    "/gallery",
    "/about",
    "/blog",
    "/faq",
    "/contact",
  ].map((path) => ({ url: `${base}${path || "/"}`, lastModified: new Date() })).concat(
    categories.map((item) => ({ url: `${base}/categories/${item.slug}`, lastModified: item.updatedAt })),
    videos.map((item) => ({ url: `${base}/videos/${item.slug}`, lastModified: item.updatedAt })),
    posts.map((item) => ({ url: `${base}/blog/${item.slug}`, lastModified: item.updatedAt })),
  );
}
