import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [categories, videos, photos, blogs, faqs, unread, recent] = await Promise.all([
    prisma.category.count(),
    prisma.video.count(),
    prisma.photo.count(),
    prisma.blog.count(),
    prisma.faq.count(),
    prisma.enquiry.count({ where: { read: false } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    ["Categories", categories, "/admin/categories"],
    ["Videos", videos, "/admin/videos"],
    ["Photos", photos, "/admin/photos"],
    ["Blog posts", blogs, "/admin/blogs"],
    ["FAQ entries", faqs, "/admin/faqs"],
    ["Unread enquiries", unread, "/admin/enquiries"],
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="A snapshot of the library and the inbox." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="rounded-2xl border border-white/10 bg-navy-900 p-5 transition hover:border-violet-300/40">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-4xl text-white">{value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="font-display text-2xl text-white">Recent enquiries</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          {recent.length ? (
            <ul className="divide-y divide-white/10">
              {recent.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm text-white">
                      {item.subject} {!item.read ? <span className="text-accent-soft">· New</span> : null}
                    </p>
                    <p className="text-xs text-muted">
                      {item.name} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <Link href="/admin/enquiries" className="text-sm text-accent-soft hover:text-white">
                    Open inbox
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-muted">No enquiries yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
