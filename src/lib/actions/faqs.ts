"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checked } from "@/lib/utils";
import { faqSchema } from "@/lib/validators";

function readFaq(formData: FormData) {
  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    sortOrder: formData.get("sortOrder") || "0",
    active: checked(formData, "active"),
  });
  if (!parsed.success) return { ok: false as const, state: fail("Check the highlighted fields.", fieldErrors(parsed.error.issues)) };
  return { ok: true as const, data: parsed.data };
}

export async function createFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = readFaq(formData);
  if (!result.ok) return result.state;
  await prisma.faq.create({ data: result.data });
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}

export async function updateFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.faq.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return fail("That question no longer exists.");
  const result = readFaq(formData);
  if (!result.ok) return result.state;
  await prisma.faq.update({ where: { id }, data: result.data });
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}

export async function deleteFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.faq.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}
