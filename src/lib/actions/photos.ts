"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removeUpload, saveImage } from "@/lib/uploads";
import { photoSchema } from "@/lib/validators";

function filesFrom(formData: FormData, name: string) {
  return formData.getAll(name).filter((file): file is File => file instanceof File && file.size > 0);
}

async function readPhoto(formData: FormData) {
  const parsed = photoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) return { ok: false as const, state: fail("Check the highlighted fields.", fieldErrors(parsed.error.issues)) };
  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return { ok: false as const, state: fail("Choose a valid category.", { categoryId: "Choose a valid category." }) };
  return { ok: true as const, data: { ...parsed.data, description: parsed.data.description ?? "" } };
}

export async function createPhotos(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = await readPhoto(formData);
  if (!result.ok) return result.state;

  const files = filesFrom(formData, "images");
  if (!files.length) return fail("Choose at least one image.", { images: "Choose at least one image." });
  if (files.length > 12) return fail("Upload up to 12 images at a time.", { images: "Upload up to 12 images at a time." });

  const created: { title: string; description: string; imageUrl: string; categoryId: string }[] = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const imageUrl = await saveImage(files[index]);
      if (!imageUrl) continue;
      created.push({
        title: files.length === 1 ? result.data.title : `${result.data.title} ${index + 1}`,
        description: result.data.description,
        imageUrl,
        categoryId: result.data.categoryId,
      });
    }
  } catch (error) {
    await Promise.all(created.map((photo) => removeUpload(photo.imageUrl)));
    return fail(error instanceof Error ? error.message : "The images could not be saved.");
  }

  if (!created.length) return fail("Choose at least one image.", { images: "Choose at least one image." });
  await prisma.photo.createMany({ data: created });
  revalidatePath("/", "layout");
  redirect("/admin/photos");
}

export async function updatePhoto(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) return fail("That photo no longer exists.");

  const result = await readPhoto(formData);
  if (!result.ok) return result.state;

  let imageUrl = existing.imageUrl;
  try {
    const uploaded = await saveImage(formData.get("image") as File);
    if (uploaded) {
      await removeUpload(existing.imageUrl);
      imageUrl = uploaded;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The image could not be saved.");
  }

  await prisma.photo.update({ where: { id }, data: { ...result.data, imageUrl } });
  revalidatePath("/", "layout");
  redirect("/admin/photos");
}

export async function deletePhoto(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) return fail("That photo no longer exists.");
  await prisma.photo.delete({ where: { id } });
  await removeUpload(existing.imageUrl);
  revalidatePath("/", "layout");
  redirect("/admin/photos");
}
