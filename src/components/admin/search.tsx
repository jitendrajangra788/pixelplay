import { fieldClass, ghostButtonClass } from "@/lib/styles";

export function AdminSearch({ placeholder, query }: { placeholder: string; query: string }) {
  return (
    <form className="mb-4 flex max-w-xl gap-2" method="get">
      <input name="q" defaultValue={query} placeholder={placeholder} className={fieldClass} />
      <button className={ghostButtonClass}>Search</button>
    </form>
  );
}

export function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${on ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-slate-300"}`}>
      {on ? onLabel : offLabel}
    </span>
  );
}
