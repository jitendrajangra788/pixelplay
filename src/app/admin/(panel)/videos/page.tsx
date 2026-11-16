import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { AdminSearch, StatusPill } from "@/components/admin/search";
import { AdminHeader } from "@/components/admin/shell";
import { Pagination } from "@/components/site/pagination";
import { deleteVideo } from "@/lib/actions/videos";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { SearchProps } from "@/lib/page-types";
import { buttonClass } from "@/lib/styles";
import { firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "Videos" };

export default async function AdminVideosPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {};
  const total = await prisma.video.count({ where });
  const pages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const videos = await prisma.video.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <>
      <AdminHeader
        title="Videos"
        description="YouTube, Vimeo, or a direct video file. Featured videos appear on the homepage."
        action={
          <Link href="/admin/videos/new" className={buttonClass}>
            New video
          </Link>
        }
      />
      <AdminSearch placeholder="Search videos" query={q} />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-4 py-3 text-white">{video.title}</td>
                <td className="px-4 py-3 text-muted">{video.category.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <StatusPill on={video.published} onLabel="Published" offLabel="Draft" />
                    {video.featured ? <StatusPill on onLabel="Featured" offLabel="" /> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/videos/${video.id}/edit`} className="text-accent-soft hover:text-white">
                      Edit
                    </Link>
                    <DeleteButton action={deleteVideo} id={video.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!videos.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted">
                  No videos yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/admin/videos", { q }, next)} />
    </>
  );
}
