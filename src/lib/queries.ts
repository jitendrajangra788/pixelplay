import "server-only";

import { prisma } from "@/lib/db";

export async function getSettings() {
  const settings = await prisma.setting.findUnique({ where: { id: "site" } });
  if (!settings) {
    throw new Error("Site settings are missing. Run npm run dev so the database can seed.");
  }
  return settings;
}

export async function getCounts() {
  const [categories, videos, photos, blogs, enquiries] = await Promise.all([
    prisma.category.count({ where: { active: true } }),
    prisma.video.count({ where: { published: true } }),
    prisma.photo.count(),
    prisma.blog.count({ where: { published: true } }),
    prisma.enquiry.count({ where: { read: false } }),
  ]);
  return { categories, videos, photos, blogs, enquiries };
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: [{ videos: { _count: "desc" } }, { name: "asc" }],
    include: {
      _count: { select: { videos: { where: { published: true } }, photos: true, blogs: { where: { published: true } } } },
    },
  });
}

const videoInclude = { category: true } as const;

export async function getHomePage() {
  const [settings, categories, featured, latestVideos, photos, puzzlePhotos, blogs, faqs, counts] = await Promise.all([
    getSettings(),
    getActiveCategories(),
    prisma.video.findMany({
      where: { published: true, featured: true, category: { active: true } },
      include: videoInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.video.findMany({
      where: { published: true, category: { active: true } },
      include: videoInclude,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.photo.findMany({
      where: { category: { active: true } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.photo.findMany({
      where: { category: { slug: "iq-puzzles", active: true } },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.blog.findMany({
      where: { published: true, category: { active: true } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.faq.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    getCounts(),
  ]);

  const videos = [...featured];
  for (const video of latestVideos) {
    if (videos.length >= 3) break;
    if (!videos.some((item) => item.id === video.id)) videos.push(video);
  }

  const feed = [
    ...latestVideos.map((video) => ({
      id: `video-${video.id}`,
      kind: "Video" as const,
      title: video.title,
      href: `/videos/${video.slug}`,
      image: video.thumbnail,
      meta: video.category.name,
      date: video.createdAt,
    })),
    ...blogs.map((blog) => ({
      id: `blog-${blog.id}`,
      kind: "Story" as const,
      title: blog.title,
      href: `/blog/${blog.slug}`,
      image: blog.featuredImage,
      meta: blog.category.name,
      date: blog.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  const puzzleCategory = categories.find((category) => category.slug === "iq-puzzles");
  const otherCategories = categories.filter((category) => category.slug !== "iq-puzzles");

  return {
    settings,
    categories: [...(puzzleCategory ? [puzzleCategory] : []), ...otherCategories].slice(0, 6),
    videos,
    photos,
    puzzlePhotos,
    blogs,
    faqs,
    counts,
    feed,
  };
}
