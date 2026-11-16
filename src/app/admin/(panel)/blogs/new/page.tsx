import type { Metadata } from "next";
import { BlogForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "New post" };

export default async function NewBlogPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <AdminHeader title="New post" description="Use the toolbar for headings, lists, quotes, and links. The article is cleaned before it is saved." />
      <BlogForm categories={categories} />
    </>
  );
}
