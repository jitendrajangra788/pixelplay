import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/chrome";
import { Cover } from "@/components/site/cover";
import { getCounts, getSettings } from "@/lib/queries";
import { ghostButtonClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "About",
  description: "About the Nexora gaming promotion studio.",
};

export default async function AboutPage() {
  const [settings, counts] = await Promise.all([getSettings(), getCounts()]);
  const stats = [
    ["Active categories", counts.categories],
    ["Published videos", counts.videos],
    ["Gallery photos", counts.photos],
    ["Published stories", counts.blogs],
  ];

  return (
    <>
      <section className="border-b border-white/10">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">The studio</p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-white">{settings.aboutTitle}</h1>
            <div className="mt-5 space-y-4 text-base leading-7 text-muted">
              {settings.aboutBody.split(/\n\n+/).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
            <Cover src={settings.aboutImage} alt="" priority />
          </div>
        </Container>
      </section>
      <Container className="py-16">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-white/10 bg-navy-900 p-5">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-2 font-display text-4xl text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 max-w-2xl">
          <h2 className="font-display text-3xl text-white">How the library is organized</h2>
          <p className="mt-4 leading-7 text-muted">
            Categories hold the public record: videos, photos, and outbound links to the games themselves. Stories in the journal explain the work. Questions live in the FAQ, and every enquiry lands in the studio inbox.
          </p>
          <Link href="/contact" className={`${ghostButtonClass} mt-6`}>
            Talk to the studio
          </Link>
        </div>
      </Container>
    </>
  );
}
