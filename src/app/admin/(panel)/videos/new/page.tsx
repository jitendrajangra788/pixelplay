import type { Metadata } from "next";
import { VideoForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "New video" };

export default async function NewVideoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <AdminHeader title="New video" description="Paste a supported video URL and choose the category it belongs to." />
      <VideoForm categories={categories} />
    </>
  );
}
