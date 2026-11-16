import Link from "next/link";
import type { Setting } from "@prisma/client";
import { primaryNav } from "@/lib/constants";

const socials = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X" },
  { key: "facebook", label: "Facebook" },
  { key: "discord", label: "Discord" },
] as const;

export function Footer({ settings }: { settings: Setting }) {
  const links = socials.filter((item) => settings[item.key]);

  return (
    <footer className="mt-auto border-t border-white/10 bg-navy-900">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold text-white">{settings.siteName}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{settings.tagline}</p>
          {links.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {links.map((item) => (
                <a
                  key={item.key}
                  href={settings[item.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-violet-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">Studio</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>{settings.contactAddress}</li>
            <li>
              <a className="hover:text-white" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`tel:${settings.contactPhone}`}>
                {settings.contactPhone}
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact the studio
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
