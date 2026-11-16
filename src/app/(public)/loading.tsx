export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-white/5" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
