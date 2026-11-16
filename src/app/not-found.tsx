import Link from "next/link";
import { buttonClass } from "@/lib/styles";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-start justify-center px-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">404</p>
      <h1 className="mt-3 font-display text-4xl text-white">That page is not on the shelf.</h1>
      <p className="mt-3 text-muted">The link may be old, or the piece is still unpublished.</p>
      <Link href="/" className={`${buttonClass} mt-6`}>
        Back home
      </Link>
    </div>
  );
}
