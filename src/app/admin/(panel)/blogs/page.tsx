import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { AdminSearch, StatusPill } from "@/components/admin/search";
import { AdminHeader } from "@/components/admin/shell";
import { Pagination } from "@/components/site/pagination";
import { deleteBlog } from "@/lib/actions/blogs";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { SearchProps } from "@/lib/page-types";
import { buttonClass } from "@/lib/styles";
import { firstParam, formatDate, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogsPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { excerpt: { contains: q, mode: "insensitive" as const } }] } : {};
  const total = await prisma.blog.count({ where });
  const pages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const posts = await prisma.blog.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <>
      <AdminHeader
        title="Blog"
        description="Drafts stay private. Published posts use the SEO title and description when those fields are filled in."
        action={
          <Link href="/admin/blogs/new" className={buttonClass}>
            New post
          </Link>
        }
      />
      <AdminSearch placeholder="Search posts" query={q} />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3 text-white">{post.title}</td>
                <td className="px-4 py-3 text-muted">{post.category.name}</td>
                <td className="px-4 py-3 text-muted">{formatDate(post.updatedAt)}</td>
                <td className="px-4 py-3">
                  <StatusPill on={post.published} onLabel="Published" offLabel="Draft" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/blogs/${post.id}/edit`} className="text-accent-soft hover:text-white">
                      Edit
                    </Link>
                    <DeleteButton action={deleteBlog} id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!posts.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No posts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/admin/blogs", { q }, next)} />
    </>
  );
}
