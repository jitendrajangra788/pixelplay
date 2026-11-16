import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const numbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="mt-10 flex flex-wrap items-center gap-2" aria-label="Pagination">
      <PageLink href={page > 1 ? hrefFor(page - 1) : undefined}>Previous</PageLink>
      {numbers.map((number) => (
        <Link
          key={number}
          href={hrefFor(number)}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm",
            number === page ? "bg-white text-navy-950" : "border border-white/15 text-white hover:border-violet-300",
          )}
        >
          {number}
        </Link>
      ))}
      <PageLink href={page < pages ? hrefFor(page + 1) : undefined}>Next</PageLink>
    </nav>
  );
}

function PageLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) {
    return <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/30">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-violet-300">
      {children}
    </Link>
  );
}
