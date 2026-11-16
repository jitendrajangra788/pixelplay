import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/fields";
import { AdminSearch } from "@/components/admin/search";
import { AdminHeader } from "@/components/admin/shell";
import { Pagination } from "@/components/site/pagination";
import { Cover } from "@/components/site/cover";
import { deletePhoto } from "@/lib/actions/photos";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { SearchProps } from "@/lib/page-types";
import { buttonClass } from "@/lib/styles";
import { firstParam, pageCount, parsePage, withQuery } from "@/lib/utils";

export const metadata: Metadata = { title: "Photos" };

export default async function AdminPhotosPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {};
  const total = await prisma.photo.count({ where });
  const pages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = Math.min(parsePage(params.page), pages);
  const photos = await prisma.photo.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <>
      <AdminHeader
        title="Photos"
        description="Upload one image or a batch. Edit the title, description, and category later."
        action={
          <Link href="/admin/photos/new" className={buttonClass}>
            Upload photos
          </Link>
        }
      />
      <AdminSearch placeholder="Search photos" query={q} />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {photos.map((photo) => (
              <tr key={photo.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg">
                      <Cover src={photo.imageUrl} alt="" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{photo.title}</p>
                      <p className="line-clamp-1 max-w-sm text-xs text-muted">{photo.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{photo.category.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/photos/${photo.id}/edit`} className="text-accent-soft hover:text-white">
                      Edit
                    </Link>
                    <DeleteButton action={deletePhoto} id={photo.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!photos.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-muted">
                  No photos yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} hrefFor={(next) => withQuery("/admin/photos", { q }, next)} />
    </>
  );
}
