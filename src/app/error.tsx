"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-start justify-center px-5">
      <h1 className="font-display text-4xl text-white">Something went wrong</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{error.message || "The page could not be loaded."}</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
        Try again
      </button>
    </div>
  );
}
