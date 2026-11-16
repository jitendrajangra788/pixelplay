import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import type { IdProps } from "@/lib/page-types";

export const metadata: Metadata = { title: "Edit question" };

export default async function EditFaqPage({ params }: IdProps) {
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) notFound();
  return (
    <>
      <AdminHeader title="Edit question" />
      <FaqForm faq={faq} />
    </>
  );
}
