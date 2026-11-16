import type { Metadata } from "next";
import { CategoryCard } from "@/components/site/cards";
import { Container, EmptyNote, PageHero } from "@/components/site/chrome";
import { prisma } from "@/lib/db";
import { fieldClass, ghostButtonClass } from "@/lib/styles";
import type { SearchProps } from "@/lib/page-types";
import { firstParam, tally } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse gaming categories, from esports desks to retro rooms.",
};

export default async function CategoriesPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { videos: { where: { published: true } }, photos: true } } },
  });

  return (
    <>
      <PageHero eyebrow="Library" title="Categories" text="Every category is a shelf: footage, stills, stories, and the links that sit beside them." />
      <Container className="py-12">
        <form className="mb-8 flex max-w-xl gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search categories" className={fieldClass} />
          <button className={ghostButtonClass}>Search</button>
        </form>
        {categories.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                href={`/categories/${category.slug}`}
                name={category.name}
                description={category.description}
                image={category.coverImage}
                meta={`${tally(category._count.videos, "video", "videos")} · ${tally(category._count.photos, "photo", "photos")}`}
              />
            ))}
          </div>
        ) : (
          <EmptyNote>No categories match that search.</EmptyNote>
        )}
      </Container>
    </>
  );
}
