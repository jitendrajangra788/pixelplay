import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoCard } from "@/components/site/cards";
import { Container } from "@/components/site/chrome";
import { prisma } from "@/lib/db";
import type { SlugProps } from "@/lib/page-types";
import { excerpt, formatDate } from "@/lib/utils";
import { parseVideo } from "@/lib/video";

type Props = SlugProps;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug } });
  if (!video || !video.published) return { title: "Video" };
  return { title: video.title, description: excerpt(video.description) };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug }, include: { category: true } });
  if (!video || !video.published || !video.category.active) notFound();
  const parsed = parseVideo(video.videoUrl);
  const related = await prisma.video.findMany({
    where: { published: true, categoryId: video.categoryId, id: { not: video.id } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <Container className="py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
        <Link href="/videos" className="hover:text-white">
          Videos
        </Link>
        <span className="px-2 text-muted">/</span>
        <Link href={`/categories/${video.category.slug}`} className="hover:text-white">
          {video.category.name}
        </Link>
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-white md:text-5xl">{video.title}</h1>
      <p className="mt-3 text-sm text-muted">{formatDate(video.createdAt)}</p>
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">
        {parsed?.provider === "file" ? (
          <video controls poster={video.thumbnail || undefined} src={parsed.embedUrl} className="aspect-video w-full" />
        ) : parsed ? (
          <iframe
            className="aspect-video w-full"
            src={parsed.embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <p className="p-8 text-sm text-muted">This video URL is not supported.</p>
        )}
      </div>
      <p className="mt-6 max-w-3xl leading-7 text-muted">{video.description}</p>
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm text-accent-soft hover:text-white">
        Open original video
      </a>
      {related.length ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl text-white">More in {video.category.name}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <VideoCard key={item.id} href={`/videos/${item.slug}`} title={item.title} category={item.category.name} image={item.thumbnail} videoUrl={item.videoUrl} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
