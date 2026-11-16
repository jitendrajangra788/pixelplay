"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize";
import { uniqueSlug } from "@/lib/slug";
import { removeUpload, saveImage } from "@/lib/uploads";
import { checked } from "@/lib/utils";
import { blogSchema } from "@/lib/validators";

async function readBlog(formData: FormData) {
  const content = sanitizeContent(String(formData.get("content") ?? ""));
  const parsed = blogSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content,
    categoryId: formData.get("categoryId"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    published: checked(formData, "published"),
  });
  if (!parsed.success) return { ok: false as const, state: fail("Check the highlighted fields.", fieldErrors(parsed.error.issues)) };
  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return { ok: false as const, state: fail("Choose a valid category.", { categoryId: "Choose a valid category." }) };
  return { ok: true as const, data: parsed.data };
}

export async function createBlog(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = await readBlog(formData);
  if (!result.ok) return result.state;

  let featuredImage = "";
  try {
    featuredImage = (await saveImage(formData.get("image") as File)) ?? "";
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The featured image could not be saved.");
  }
  if (!featuredImage) return fail("Add a featured image.", { image: "A featured image is required." });

  const slug = await uniqueSlug(result.data.title, async (candidate) => {
    const found = await prisma.blog.findUnique({ where: { slug: candidate }, select: { id: true } });
    return Boolean(found);
  });

  await prisma.blog.create({
    data: {
      ...result.data,
      seoTitle: result.data.seoTitle ?? "",
      seoDescription: result.data.seoDescription ?? "",
      slug,
      featuredImage,
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/blogs");
}

export async function updateBlog(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return fail("That post no longer exists.");

  const result = await readBlog(formData);
  if (!result.ok) return result.state;

  let featuredImage = existing.featuredImage;
  try {
    const uploaded = await saveImage(formData.get("image") as File);
    if (uploaded) {
      await removeUpload(existing.featuredImage);
      featuredImage = uploaded;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The featured image could not be saved.");
  }

  await prisma.blog.update({
    where: { id },
    data: {
      ...result.data,
      seoTitle: result.data.seoTitle ?? "",
      seoDescription: result.data.seoDescription ?? "",
      featuredImage,
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/blogs");
}

export async function deleteBlog(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) return fail("That post no longer exists.");
  await prisma.blog.delete({ where: { id } });
  await removeUpload(existing.featuredImage);
  revalidatePath("/", "layout");
  redirect("/admin/blogs");
}
