import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard, VideoCard } from "@/components/site/cards";
import { Container } from "@/components/site/chrome";
import { Cover } from "@/components/site/cover";
import { GalleryGrid } from "@/components/site/gallery";
import { prisma } from "@/lib/db";
import type { SlugProps } from "@/lib/page-types";
import { excerpt, hostLabel } from "@/lib/utils";

type Props = SlugProps;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || !category.active) return { title: "Category" };
  return {
    title: category.seoTitle || category.name,
    description: excerpt(category.seoDescription || category.description),
    openGraph: { images: category.coverImage ? [category.coverImage] : undefined },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      videos: { where: { published: true }, orderBy: { createdAt: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
      blogs: { where: { published: true }, orderBy: { createdAt: "desc" }, include: { category: true } },
      links: { orderBy: { title: "asc" } },
    },
  });
  if (!category || !category.active) notFound();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Cover src={category.coverImage} alt="" priority className="opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/30" />
        </div>
        <Container className="relative py-12 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">
            <Link href="/categories" className="hover:text-white">
              Categories
            </Link>
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl">{category.name}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-200">{category.description}</p>
        </Container>
      </section>
      <Container className="space-y-16 py-14">
        <section>
          <h2 className="font-display text-3xl text-white">Videos</h2>
          {category.videos.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {category.videos.map((video) => (
                <VideoCard key={video.id} href={`/videos/${video.slug}`} title={video.title} category={category.name} image={video.thumbnail} videoUrl={video.videoUrl} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No published videos in this category yet.</p>
          )}
        </section>
        <section>
          <h2 className="mb-6 font-display text-3xl text-white">Photos</h2>
          <GalleryGrid
            items={category.photos.map((photo) => ({
              id: photo.id,
              title: photo.title,
              description: photo.description,
              imageUrl: photo.imageUrl,
              category: category.name,
            }))}
          />
        </section>
        <section>
          <h2 className="font-display text-3xl text-white">Play and follow</h2>
          {category.links.length ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {category.links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-navy-900 px-5 py-4 transition hover:border-violet-300/40">
                  <p className="font-medium text-white">{link.title}</p>
                  <p className="mt-1 text-sm text-muted">{hostLabel(link.url)}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No external links have been added.</p>
          )}
        </section>
        {category.blogs.length ? (
          <section>
            <h2 className="font-display text-3xl text-white">Stories</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {category.blogs.map((blog) => (
                <BlogCard key={blog.id} href={`/blog/${blog.slug}`} title={blog.title} excerpt={blog.excerpt} category={category.name} image={blog.featuredImage} date={blog.createdAt} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}
