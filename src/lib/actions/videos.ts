"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { removeUpload, saveImage } from "@/lib/uploads";
import { checked } from "@/lib/utils";
import { parseVideo } from "@/lib/video";
import { videoSchema } from "@/lib/validators";

async function readVideo(formData: FormData) {
  const parsed = videoSchema.safeParse({
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
  });
  if (!parsed.success) return { ok: false as const, state: fail("Check the highlighted fields.", fieldErrors(parsed.error.issues)) };
  if (!parseVideo(parsed.data.videoUrl)) {
    return {
      ok: false as const,
      state: fail("Use a YouTube, Vimeo, or direct .mp4, .webm, or .ogg URL.", {
        videoUrl: "That video URL is not supported.",
      }),
    };
  }
  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return { ok: false as const, state: fail("Choose a valid category.", { categoryId: "Choose a valid category." }) };
  return { ok: true as const, data: parsed.data };
}

export async function createVideo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = await readVideo(formData);
  if (!result.ok) return result.state;

  let thumbnail = "";
  try {
    thumbnail = (await saveImage(formData.get("image") as File)) ?? "";
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The thumbnail could not be saved.");
  }

  const slug = await uniqueSlug(result.data.title, async (candidate) => {
    const found = await prisma.video.findUnique({ where: { slug: candidate }, select: { id: true } });
    return Boolean(found);
  });

  await prisma.video.create({ data: { ...result.data, slug, thumbnail } });
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

export async function updateVideo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return fail("That video no longer exists.");

  const result = await readVideo(formData);
  if (!result.ok) return result.state;

  let thumbnail = existing.thumbnail;
  try {
    const uploaded = await saveImage(formData.get("image") as File);
    if (uploaded) {
      await removeUpload(existing.thumbnail);
      thumbnail = uploaded;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The thumbnail could not be saved.");
  }

  await prisma.video.update({ where: { id }, data: { ...result.data, thumbnail } });
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

export async function deleteVideo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) return fail("That video no longer exists.");
  await prisma.video.delete({ where: { id } });
  await removeUpload(existing.thumbnail);
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}
