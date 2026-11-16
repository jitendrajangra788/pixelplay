import Link from "next/link";
import { Cover } from "@/components/site/cover";
import { formatDate } from "@/lib/utils";
import { videoPoster } from "@/lib/video";

export function CategoryCard({
  href,
  name,
  description,
  image,
  meta,
}: {
  href: string;
  name: string;
  description: string;
  image?: string | null;
  meta: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-navy-800">
        <Cover src={image} alt="" className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
        <p className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-[0.16em] text-white/80">{meta}</p>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-white transition group-hover:text-accent-soft">{name}</h3>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{description}</p>
    </Link>
  );
}

export function VideoCard({
  href,
  title,
  category,
  image,
  videoUrl,
  large = false,
}: {
  href: string;
  title: string;
  category: string;
  image: string;
  videoUrl: string;
  large?: boolean;
}) {
  const poster = videoPoster(image, videoUrl);
  return (
    <Link href={href} className="group block h-full">
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800 ${large ? "aspect-[16/9]" : "aspect-video"}`}>
        <Cover src={poster} alt="" className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-navy-950/20 transition group-hover:bg-navy-950/10" />
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy-950 shadow-lg transition group-hover:scale-105">
          <svg viewBox="0 0 20 20" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M6 4.5v11l9-5.5-9-5.5Z" />
          </svg>
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">{category}</p>
      <h3 className={`mt-1 font-display font-semibold text-white ${large ? "text-2xl" : "text-lg"}`}>{title}</h3>
    </Link>
  );
}

export function BlogCard({
  href,
  title,
  excerpt,
  category,
  image,
  date,
}: {
  href: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string | null;
  date: Date | string;
}) {
  return (
    <Link href={href} className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
      <div className="relative aspect-[16/9]">
        <Cover src={image} alt="" className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
          {category} · {formatDate(date)}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-white transition group-hover:text-accent-soft">{title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{excerpt}</p>
      </div>
    </Link>
  );
}
