import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { StatusPill } from "@/components/admin/search";
import { AdminHeader } from "@/components/admin/shell";
import { deleteFaq } from "@/lib/actions/faqs";
import { prisma } from "@/lib/db";
import { buttonClass } from "@/lib/styles";

export const metadata: Metadata = { title: "FAQ" };

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminHeader
        title="FAQ"
        description="Questions render as an accordion on the site. Inactive questions are hidden."
        action={
          <Link href="/admin/faqs/new" className={buttonClass}>
            New question
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td className="px-4 py-3 text-muted">{faq.sortOrder}</td>
                <td className="px-4 py-3 text-white">{faq.question}</td>
                <td className="px-4 py-3">
                  <StatusPill on={faq.active} onLabel="Active" offLabel="Hidden" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/faqs/${faq.id}/edit`} className="text-accent-soft hover:text-white">
                      Edit
                    </Link>
                    <DeleteButton action={deleteFaq} id={faq.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!faqs.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted">
                  No questions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
