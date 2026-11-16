"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enquirySchema } from "@/lib/validators";

export async function createEnquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (String(formData.get("company") ?? "").trim()) return { ok: true, message: "Thanks. Your message is with the studio." };

  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error.issues));

  await prisma.enquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone ?? "",
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true, message: "Thanks. Your message is with the studio." };
}

export async function setEnquiryRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  await prisma.enquiry.update({ where: { id }, data: { read } }).catch(() => null);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.enquiry.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  redirect("/admin/enquiries");
}
