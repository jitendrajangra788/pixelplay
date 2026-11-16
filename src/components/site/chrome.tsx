import Link from "next/link";
import { ghostButtonClass } from "@/lib/styles";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 ${className}`}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  text,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">{title}</h2>
        {text ? <p className="mt-3 leading-7 text-muted">{text}</p> : null}
      </div>
      {href && action ? (
        <Link href={href} className={ghostButtonClass}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="border-b border-white/10 bg-navy-900">
      <Container className="py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{text}</p>
      </Container>
    </section>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-sm text-muted">{children}</p>;
}
