import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/chrome";
import { Cover } from "@/components/site/cover";
import { prisma } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize";
import type { SlugProps } from "@/lib/page-types";
import { excerpt, formatDate, siteUrl } from "@/lib/utils";

type Props = SlugProps;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({ where: { slug } });
  if (!post || !post.published) return { title: "Story" };
  return {
    title: post.seoTitle || post.title,
    description: excerpt(post.seoDescription || post.excerpt),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { images: post.featuredImage ? [post.featuredImage] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({ where: { slug }, include: { category: true } });
  if (!post || !post.published || !post.category.active) notFound();
  const html = sanitizeContent(post.content);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.featuredImage ? [`${siteUrl()}${post.featuredImage}`] : undefined,
    articleSection: post.category.name,
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
          <Link href="/blog" className="hover:text-white">
            Blog
          </Link>
          <span className="px-2 text-muted">/</span>
          {post.category.name}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-white md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">{formatDate(post.createdAt)}</p>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{post.excerpt}</p>
      </Container>
      <Container>
        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-white/10">
          <Cover src={post.featuredImage} alt="" priority />
        </div>
        <div className="richtext mx-auto max-w-3xl py-12" dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </article>
  );
}
