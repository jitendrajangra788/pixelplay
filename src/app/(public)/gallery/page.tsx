import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyNote, PageHero } from "@/components/site/chrome";
import { GalleryGrid } from "@/components/site/gallery";
import { Pagination } from "@/components/site/pagination";
import { PUBLIC_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { fieldClass, ghostButtonClass } from "@/lib/styles";
import type { SearchProps } from "@/lib/page-types";
import { cn, firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A photo gallery of setups, events, and game stills.",
};

export default async function GalleryPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const category = firstParam(params.category);
  const where = {
    category: { active: true, ...(category ? { slug: category } : {}) },
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [total, categories] = await Promise.all([
    prisma.photo.count({ where }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);
  const pages = pageCount(total, PUBLIC_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const photos = await prisma.photo.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PUBLIC_PAGE_SIZE,
    take: PUBLIC_PAGE_SIZE,
  });

  return (
    <>
      <PageHero eyebrow="Stills" title="Photo gallery" text="Click any frame to open it. Use the arrows, or the keyboard, to move through the set." />
      <Container className="py-12">
        <form className="mb-5 flex max-w-xl gap-2" method="get">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <input name="q" defaultValue={q} placeholder="Search photos" className={fieldClass} />
          <button className={ghostButtonClass}>Search</button>
        </form>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={withQuery("/gallery", { q })} className={chip(!category)}>
            All
          </Link>
          {categories.map((item) => (
            <Link key={item.slug} href={withQuery("/gallery", { q, category: item.slug })} className={chip(category === item.slug)}>
              {item.name}
            </Link>
          ))}
        </div>
        {photos.length ? (
          <GalleryGrid
            items={photos.map((photo) => ({
              id: photo.id,
              title: photo.title,
              description: photo.description,
              imageUrl: photo.imageUrl,
              category: photo.category.name,
            }))}
          />
        ) : (
          <EmptyNote>No photos match this view.</EmptyNote>
        )}
        <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/gallery", { q, category }, next)} />
      </Container>
    </>
  );
}

function chip(active: boolean) {
  return cn("rounded-full px-3 py-1.5 text-sm", active ? "bg-white text-navy-950" : "border border-white/15 text-white hover:border-violet-300");
}
