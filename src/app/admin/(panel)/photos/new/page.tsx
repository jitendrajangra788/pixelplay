import type { Metadata } from "next";
import { PhotoUploadForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Upload photos" };

export default async function NewPhotosPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <AdminHeader title="Upload photos" description="Images are resized and saved as WebP before they appear in the gallery." />
      <PhotoUploadForm categories={categories} />
    </>
  );
}
