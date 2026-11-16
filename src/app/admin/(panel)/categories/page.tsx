import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { AdminSearch, StatusPill } from "@/components/admin/search";
import { AdminHeader } from "@/components/admin/shell";
import { Pagination } from "@/components/site/pagination";
import { deleteCategory } from "@/lib/actions/categories";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { SearchProps } from "@/lib/page-types";
import { buttonClass } from "@/lib/styles";
import { firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }
    : {};
  const total = await prisma.category.count({ where });
  const pages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const categories = await prisma.category.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    include: { _count: { select: { videos: true, photos: true, blogs: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Categories"
        description="Name, description, cover, SEO, status, and the external links that belong with each shelf."
        action={
          <Link href="/admin/categories/new" className={buttonClass}>
            New category
          </Link>
        }
      />
      <AdminSearch placeholder="Search categories" query={q} />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Content</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{category.name}</p>
                  <p className="text-xs text-muted">/{category.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {category._count.videos} videos · {category._count.photos} photos · {category._count.blogs} posts
                </td>
                <td className="px-4 py-3">
                  <StatusPill on={category.active} onLabel="Active" offLabel="Inactive" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/categories/${category.id}/edit`} className="text-accent-soft hover:text-white">
                      Edit
                    </Link>
                    <DeleteButton action={deleteCategory} id={category.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!categories.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted">
                  No categories yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/admin/categories", { q }, next)} />
    </>
  );
}
