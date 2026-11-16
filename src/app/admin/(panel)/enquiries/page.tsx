import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { AdminHeader } from "@/components/admin/shell";
import { Pagination } from "@/components/site/pagination";
import { deleteEnquiry, setEnquiryRead } from "@/lib/actions/enquiries";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { SearchProps } from "@/lib/page-types";
import { cn, firstParam, formatDate, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const filter = firstParam(params.filter);
  const where = filter === "unread" ? { read: false } : {};
  const total = await prisma.enquiry.count({ where });
  const pages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <>
      <AdminHeader title="Enquiries" description="Messages sent from the contact form. Mark one as read once it has been handled." />
      <div className="mb-4 flex gap-2">
        <Link href="/admin/enquiries" className={chip(filter !== "unread")}>
          All
        </Link>
        <Link href="/admin/enquiries?filter=unread" className={chip(filter === "unread")}>
          Unread
        </Link>
      </div>
      <div className="space-y-3">
        {enquiries.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-navy-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-white">
                  {item.subject} {!item.read ? <span className="text-sm text-accent-soft">New</span> : null}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {item.name} · {item.email}
                  {item.phone ? ` · ${item.phone}` : ""} · {formatDate(item.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setEnquiryRead}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="read" value={item.read ? "false" : "true"} />
                  <button type="submit" className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-violet-300">
                    {item.read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
                <DeleteButton action={deleteEnquiry} id={item.id} />
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.message}</p>
          </article>
        ))}
        {!enquiries.length ? <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-sm text-muted">No enquiries in this view.</p> : null}
      </div>
      <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/admin/enquiries", { filter: filter === "unread" ? "unread" : undefined }, next)} />
    </>
  );
}

function chip(active: boolean) {
  return cn("rounded-full px-3 py-1.5 text-sm", active ? "bg-white text-navy-950" : "border border-white/15 text-white");
}
