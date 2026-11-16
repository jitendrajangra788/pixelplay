"use client";

import { useEffect, useState } from "react";
import { Cover } from "@/components/site/cover";

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
};

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : items[index];

  useEffect(() => {
    if (index === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") setIndex((value) => (value === null ? value : (value + 1) % items.length));
      if (event.key === "ArrowLeft") setIndex((value) => (value === null ? value : (value - 1 + items.length) % items.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-sm text-muted">No photos in this view yet.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
        {items.map((item, itemIndex) => (
          <li key={item.id} className={itemIndex === 0 ? "col-span-2 md:col-span-1" : ""}>
            <button
              type="button"
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 text-left sm:rounded-2xl"
              onClick={() => setIndex(itemIndex)}
            >
              <Cover src={item.imageUrl} alt={item.title} className="transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-2 pt-8 sm:p-3 sm:pt-10">
                <span className="line-clamp-2 text-xs font-medium text-white sm:text-sm">{item.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {current ? (
        <div className="fixed inset-0 z-50 flex items-end bg-navy-950/92 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={current.title}>
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close photo" onClick={() => setIndex(null)} />
          <div className="relative z-10 w-full max-w-4xl">
            <div className="relative mx-auto aspect-[4/3] max-h-[68dvh] w-full overflow-hidden rounded-2xl bg-black sm:aspect-[16/10]">
              <Cover src={current.imageUrl} alt={current.title} fit="contain" sizes="100vw" />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-accent-soft">{current.category}</p>
                <h2 className="mt-1 font-display text-xl text-white sm:text-2xl">{current.title}</h2>
                {current.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{current.description}</p> : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm text-white" onClick={() => setIndex((value) => (value === null ? value : (value - 1 + items.length) % items.length))}>
                  Prev
                </button>
                <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm text-white" onClick={() => setIndex((value) => (value === null ? value : (value + 1) % items.length))}>
                  Next
                </button>
                <button type="button" className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-navy-950" onClick={() => setIndex(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
