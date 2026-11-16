"use client";

import { useState } from "react";

export function FaqList({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-sm text-muted">No questions have been published yet.</p>;
  }

  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
      {items.map((item) => {
        const expanded = open === item.id;
        return (
          <div key={item.id} className="bg-navy-900/60">
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : item.id)}
              >
                <span className="font-medium text-white">{item.question}</span>
                <span className="text-accent-soft" aria-hidden="true">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            {expanded ? <p className="px-5 pb-5 text-sm leading-7 text-muted">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
