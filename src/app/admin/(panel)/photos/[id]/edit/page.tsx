import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoEditForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import type { IdProps } from "@/lib/page-types";

export const metadata: Metadata = { title: "Edit photo" };

export default async function EditPhotoPage({ params }: IdProps) {
  const { id } = await params;
  const [photo, categories] = await Promise.all([
    prisma.photo.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!photo) notFound();
  return (
    <>
      <AdminHeader title="Edit photo" description={photo.title} />
      <PhotoEditForm categories={categories} photo={photo} />
    </>
  );
}
