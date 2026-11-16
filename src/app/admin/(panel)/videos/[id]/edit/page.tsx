import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideoForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import type { IdProps } from "@/lib/page-types";

export const metadata: Metadata = { title: "Edit video" };

export default async function EditVideoPage({ params }: IdProps) {
  const { id } = await params;
  const [video, categories] = await Promise.all([
    prisma.video.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!video) notFound();
  return (
    <>
      <AdminHeader title="Edit video" description={video.title} />
      <VideoForm categories={categories} video={video} />
    </>
  );
}
