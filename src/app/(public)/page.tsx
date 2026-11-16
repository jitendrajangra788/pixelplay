import Link from "next/link";
import { BlogCard, CategoryCard, VideoCard } from "@/components/site/cards";
import { Container, SectionTitle } from "@/components/site/chrome";
import { Cover } from "@/components/site/cover";
import { FaqList } from "@/components/site/faq-list";
import { GalleryGrid } from "@/components/site/gallery";
import { getHomePage } from "@/lib/queries";
import { accentButtonClass, buttonClass, ghostButtonClass } from "@/lib/styles";
import { formatDate, tally } from "@/lib/utils";

export default async function HomePage() {
  const { settings, categories, videos, photos, puzzlePhotos, blogs, faqs, counts, feed } = await getHomePage();
  const frames = puzzlePhotos.length ? puzzlePhotos : photos;
  const lead = frames[0];
  const companion = frames[3] ?? frames[1];
  const puzzleHref = puzzlePhotos[0] ? `/categories/${puzzlePhotos[0].category.slug}` : "/gallery";

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <Container className="relative grid items-center gap-6 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div className="fade-up order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">{settings.heroEyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">{settings.heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{settings.heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={puzzleHref} className={buttonClass}>
                See the puzzles
              </Link>
              <Link href="/gallery" className={ghostButtonClass}>
                Open gallery
              </Link>
            </div>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-5">
              {[
                ["Categories", counts.categories],
                ["Photos", counts.photos],
                ["Stories", counts.blogs],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted sm:text-xs sm:tracking-[0.16em]">{label}</dt>
                  <dd className="mt-1 font-display text-2xl text-white sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="order-1 lg:order-2">
            <Link href={puzzleHref} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-navy-800">
              <Cover src={lead?.imageUrl || settings.heroImage} alt={lead?.title || ""} priority sizes="(min-width: 1024px) 46vw, 100vw" className="transition duration-700 group-hover:scale-[1.03]" />
              {companion ? (
                <span className="absolute bottom-3 left-3 w-[4.5rem] overflow-hidden rounded-xl border-2 border-navy-950 shadow-xl sm:bottom-4 sm:left-4 sm:w-32 md:w-40">
                  <span className="relative block aspect-square">
                    <Cover src={companion.imageUrl} alt="" sizes="160px" />
                  </span>
                </span>
              ) : null}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-24">
        <Container>
          <SectionTitle eyebrow="Categories" title="Popular categories" text="Each shelf collects the footage, stills, and notes that belong together." href="/categories" action="All categories" />
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
        </Container>
      </section>

      <section className="border-y border-white/10 bg-navy-900 py-12 md:py-24">
        <Container>
          <SectionTitle eyebrow="Latest" title="New on the desk" text="Fresh videos and stories, in the order they were published." />
          <div className="grid gap-4 md:grid-cols-2">
            {feed.map((item) => (
              <Link key={item.id} href={item.href} className="group flex gap-4 rounded-2xl border border-white/10 bg-navy-950 p-3 transition hover:border-violet-300/40">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                  <Cover src={item.image} alt="" />
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                    {item.kind} · {item.meta}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-white group-hover:text-accent-soft sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted">{formatDate(item.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-24">
        <Container>
          <SectionTitle eyebrow="Videos" title="Featured footage" text="Trailers and desk pieces worth a full watch." href="/videos" action="All videos" />
          <div className="grid gap-5 lg:grid-cols-3">
            {videos.map((video, index) => (
              <div key={video.id} className={index === 0 ? "lg:col-span-2" : ""}>
                <VideoCard
                  href={`/videos/${video.slug}`}
                  title={video.title}
                  category={video.category.name}
                  image={video.thumbnail}
                  videoUrl={video.videoUrl}
                  large={index === 0}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-12 md:py-24">
        <Container>
          <SectionTitle
            eyebrow="The set"
            title={puzzlePhotos.length ? "Five frames from the table" : "Stills from the floor"}
            text={puzzlePhotos.length ? "Shift Lock from the side, overhead, and underneath. The letter wheel from above and tipped onto its edge." : undefined}
            href={puzzleHref}
            action={puzzlePhotos.length ? "Open this shelf" : "Open gallery"}
          />
          <GalleryGrid
            items={frames.map((photo) => ({
              id: photo.id,
              title: photo.title,
              description: photo.description,
              imageUrl: photo.imageUrl,
              category: photo.category.name,
            }))}
          />
        </Container>
      </section>

      <section className="py-12 md:py-24">
        <Container>
          <SectionTitle eyebrow="Journal" title="Latest from the blog" href="/blog" action="All posts" />
          <div className="grid gap-5 md:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                href={`/blog/${blog.slug}`}
                title={blog.title}
                excerpt={blog.excerpt}
                category={blog.category.name}
                image={blog.featuredImage}
                date={blog.createdAt}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-navy-900 py-12 md:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <Cover src={settings.aboutImage} alt="" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">About</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{settings.aboutTitle}</h2>
              <div className="mt-4 space-y-4 leading-7 text-muted">
                {settings.aboutBody.split(/\n\n+/).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
              <Link href="/about" className={`${ghostButtonClass} mt-6`}>
                More about the studio
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-24">
        <Container>
          <SectionTitle eyebrow="FAQ" title="Questions, answered" href="/faq" action="All questions" />
          <FaqList items={faqs} />
        </Container>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.38),transparent_36%),linear-gradient(160deg,#17132d,#0b1220)] px-5 py-10 sm:rounded-[2rem] sm:px-8 sm:py-12 md:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">Contact</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">Have a game, a roster, or a story to put in front of players?</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">Send a note. The studio reads every enquiry and replies with the next useful step.</p>
          <Link href="/contact" className={`${accentButtonClass} mt-8`}>
            Contact the studio
          </Link>
        </div>
      </section>
    </>
  );
}
