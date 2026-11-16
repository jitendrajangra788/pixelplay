import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import type { IdProps } from "@/lib/page-types";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: IdProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, include: { links: { orderBy: { title: "asc" } } } });
  if (!category) notFound();
  return (
    <>
      <AdminHeader title="Edit category" description={category.name} />
      <CategoryForm category={category} />
    </>
  );
}
