import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/forms";
import { AdminHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import type { IdProps } from "@/lib/page-types";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditBlogPage({ params }: IdProps) {
  const { id } = await params;
  const [blog, categories] = await Promise.all([
    prisma.blog.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!blog) notFound();
  return (
    <>
      <AdminHeader title="Edit post" description={blog.title} />
      <BlogForm categories={categories} blog={blog} />
    </>
  );
}
