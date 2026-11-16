import type { Metadata } from "next";
import Link from "next/link";
import { VideoCard } from "@/components/site/cards";
import { Container, EmptyNote, PageHero } from "@/components/site/chrome";
import { Pagination } from "@/components/site/pagination";
import { PUBLIC_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { fieldClass, ghostButtonClass } from "@/lib/styles";
import type { SearchProps } from "@/lib/page-types";
import { cn, firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Videos",
  description: "Watch featured gaming videos, trailers, and desk footage.",
};

export default async function VideosPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const category = firstParam(params.category);
  const where = {
    published: true,
    category: { active: true, ...(category ? { slug: category } : {}) },
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [total, categories] = await Promise.all([
    prisma.video.count({ where }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);
  const pages = pageCount(total, PUBLIC_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const videos = await prisma.video.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PUBLIC_PAGE_SIZE,
    take: PUBLIC_PAGE_SIZE,
  });

  return (
    <>
      <PageHero eyebrow="Watch" title="Videos" text="Published films from every active category. Open one to play it on the page." />
      <Container className="py-12">
        <form className="mb-5 flex max-w-xl gap-2" method="get">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <input name="q" defaultValue={q} placeholder="Search videos" className={fieldClass} />
          <button className={ghostButtonClass}>Search</button>
        </form>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={withQuery("/videos", { q })} className={chip(!category)}>
            All
          </Link>
          {categories.map((item) => (
            <Link key={item.slug} href={withQuery("/videos", { q, category: item.slug })} className={chip(category === item.slug)}>
              {item.name}
            </Link>
          ))}
        </div>
        {videos.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} href={`/videos/${video.slug}`} title={video.title} category={video.category.name} image={video.thumbnail} videoUrl={video.videoUrl} />
            ))}
          </div>
        ) : (
          <EmptyNote>No videos match this view.</EmptyNote>
        )}
        <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/videos", { q, category }, next)} />
      </Container>
    </>
  );
}

function chip(active: boolean) {
  return cn("rounded-full px-3 py-1.5 text-sm", active ? "bg-white text-navy-950" : "border border-white/15 text-white hover:border-violet-300");
}
