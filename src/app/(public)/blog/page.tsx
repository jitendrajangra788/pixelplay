import type { Metadata } from "next";
import { BlogCard } from "@/components/site/cards";
import { Container, EmptyNote, PageHero } from "@/components/site/chrome";
import { Pagination } from "@/components/site/pagination";
import { PUBLIC_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { fieldClass, ghostButtonClass } from "@/lib/styles";
import type { SearchProps } from "@/lib/page-types";
import { firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on promotion, footage, and the games worth gathering around.",
};

export default async function BlogPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const where = {
    published: true,
    category: { active: true },
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const total = await prisma.blog.count({ where });
  const pages = pageCount(total, PUBLIC_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const posts = await prisma.blog.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PUBLIC_PAGE_SIZE,
    take: PUBLIC_PAGE_SIZE,
  });

  return (
    <>
      <PageHero eyebrow="Journal" title="Blog" text="Short essays from the studio. Drafts stay in the admin until they are ready." />
      <Container className="py-12">
        <form className="mb-8 flex max-w-xl gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search posts" className={fieldClass} />
          <button className={ghostButtonClass}>Search</button>
        </form>
        {posts.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} href={`/blog/${post.slug}`} title={post.title} excerpt={post.excerpt} category={post.category.name} image={post.featuredImage} date={post.createdAt} />
            ))}
          </div>
        ) : (
          <EmptyNote>No posts match that search.</EmptyNote>
        )}
        <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/blog", { q }, next)} />
      </Container>
    </>
  );
}
