"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { removeUpload, saveImage } from "@/lib/uploads";
import { checked } from "@/lib/utils";
import { categorySchema, linkSchema } from "@/lib/validators";

function readLinks(formData: FormData) {
  const titles = formData.getAll("linkTitle").map(String);
  const urls = formData.getAll("linkUrl").map(String);
  const links: { title: string; url: string }[] = [];
  const errors: Record<string, string> = {};

  titles.forEach((title, index) => {
    const url = urls[index] ?? "";
    if (!title.trim() && !url.trim()) return;
    const parsed = linkSchema.safeParse({ title, url });
    if (!parsed.success) {
      errors.links = parsed.error.issues[0]?.message ?? "Check the external links.";
      return;
    }
    links.push(parsed.data);
  });

  return { links, errors };
}

async function readCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    active: checked(formData, "active"),
  });
  const { links, errors } = readLinks(formData);
  if (!parsed.success || Object.keys(errors).length) {
    return {
      ok: false as const,
      state: fail("Check the highlighted fields.", {
        ...(parsed.success ? {} : fieldErrors(parsed.error.issues)),
        ...errors,
      }),
    };
  }
  return { ok: true as const, data: parsed.data, links };
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = await readCategory(formData);
  if (!result.ok) return result.state;

  let cover = "";
  try {
    cover = (await saveImage(formData.get("image") as File)) ?? "";
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The cover image could not be saved.");
  }
  if (!cover) return fail("Add a cover image.", { image: "A cover image is required." });

  const slug = await uniqueSlug(result.data.name, async (candidate) => {
    const found = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
    return Boolean(found);
  });

  await prisma.category.create({
    data: {
      ...result.data,
      seoTitle: result.data.seoTitle ?? "",
      seoDescription: result.data.seoDescription ?? "",
      slug,
      coverImage: cover,
      links: { create: result.links },
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return fail("That category no longer exists.");

  const result = await readCategory(formData);
  if (!result.ok) return result.state;

  let cover = existing.coverImage;
  try {
    const uploaded = await saveImage(formData.get("image") as File);
    if (uploaded) {
      await removeUpload(existing.coverImage);
      cover = uploaded;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The cover image could not be saved.");
  }

  await prisma.$transaction([
    prisma.category.update({
      where: { id },
      data: {
        ...result.data,
        seoTitle: result.data.seoTitle ?? "",
        seoDescription: result.data.seoDescription ?? "",
        coverImage: cover,
      },
    }),
    prisma.gameLink.deleteMany({ where: { categoryId: id } }),
    ...(result.links.length
      ? [prisma.gameLink.createMany({ data: result.links.map((link) => ({ ...link, categoryId: id })) })]
      : []),
  ]);

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return fail("That category no longer exists.");

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return fail("Move or delete the videos, photos, and posts in this category first.");
    }
    throw error;
  }

  await removeUpload(existing.coverImage);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
