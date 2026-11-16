"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { removeUpload, saveImage } from "@/lib/uploads";
import { optionalSocial, seoSchema, websiteSchema } from "@/lib/validators";

const socialFields = ["facebook", "instagram", "youtube", "twitter", "discord"] as const;

export async function updateWebsite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = websiteSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    heroEyebrow: formData.get("heroEyebrow"),
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    aboutTitle: formData.get("aboutTitle"),
    aboutBody: formData.get("aboutBody"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    contactAddress: formData.get("contactAddress"),
    facebook: formData.get("facebook") ?? "",
    instagram: formData.get("instagram") ?? "",
    youtube: formData.get("youtube") ?? "",
    twitter: formData.get("twitter") ?? "",
    discord: formData.get("discord") ?? "",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error.issues));

  const socialErrors: Record<string, string> = {};
  const socials: Record<string, string> = {};
  for (const field of socialFields) {
    const value = optionalSocial(parsed.data[field]);
    if (value === null) socialErrors[field] = "Enter a full http or https URL, or leave this blank.";
    else socials[field] = value;
  }
  if (Object.keys(socialErrors).length) return fail("Check the social links.", socialErrors);

  const current = await prisma.setting.findUnique({ where: { id: "site" } });
  if (!current) return fail("Site settings are missing.");

  let heroImage = current.heroImage;
  let aboutImage = current.aboutImage;
  try {
    const nextHero = await saveImage(formData.get("heroImage") as File);
    const nextAbout = await saveImage(formData.get("aboutImage") as File);
    if (nextHero) {
      await removeUpload(current.heroImage);
      heroImage = nextHero;
    }
    if (nextAbout) {
      await removeUpload(current.aboutImage);
      aboutImage = nextAbout;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "An image could not be saved.");
  }

  await prisma.setting.update({
    where: { id: "site" },
    data: {
      siteName: parsed.data.siteName,
      tagline: parsed.data.tagline,
      heroEyebrow: parsed.data.heroEyebrow,
      heroTitle: parsed.data.heroTitle,
      heroSubtitle: parsed.data.heroSubtitle,
      aboutTitle: parsed.data.aboutTitle,
      aboutBody: parsed.data.aboutBody,
      contactEmail: parsed.data.contactEmail.toLowerCase(),
      contactPhone: parsed.data.contactPhone,
      contactAddress: parsed.data.contactAddress,
      ...socials,
      heroImage,
      aboutImage,
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function updateSeo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = seoSchema.safeParse({
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    seoKeywords: formData.get("seoKeywords") ?? "",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error.issues));

  await prisma.setting.update({
    where: { id: "site" },
    data: {
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      seoKeywords: parsed.data.seoKeywords ?? "",
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/seo?saved=1");
}
