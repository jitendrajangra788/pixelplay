"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";
import { adminNav } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminShell({
  name,
  email,
  unread,
  children,
}: {
  name: string;
  email: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function active(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-navy-950 text-mist lg:grid lg:grid-cols-[250px_1fr]">
      {open ? <button type="button" className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-[250px] border-r border-white/10 bg-navy-900 p-5 lg:static", open ? "block" : "hidden lg:block")}>
        <Link href="/" className="font-display text-lg font-semibold text-white">
          Nexora
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent-soft">Admin</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Admin">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                active(item.href) ? "bg-white text-navy-950" : "text-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <span>{item.label}</span>
              {item.href === "/admin/enquiries" && unread > 0 ? (
                <span className={cn("rounded-full px-2 py-0.5 text-xs", active(item.href) ? "bg-violet-500 text-white" : "bg-violet-500/20 text-accent-soft")}>
                  {unread}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="text-sm text-white">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-sm text-muted transition hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:hidden">
          <button type="button" className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white" onClick={() => setOpen(true)}>
            Menu
          </button>
          <Link href="/" className="text-sm text-muted">
            View site
          </Link>
        </div>
        <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
