"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fail, fieldErrors, type ActionState } from "@/lib/action-state";
import { safeNextPath } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, signSession } from "@/lib/session-token";
import { loginSchema } from "@/lib/validators";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail("Check the form and try again.", fieldErrors(parsed.error.issues));

  const email = parsed.data.email.toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;
  if (!admin || !valid) return fail("Those credentials don't match an admin account.");

  const token = await signSession({ sub: admin.id, email: admin.email, name: admin.name });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(safeNextPath(formData.get("next")));
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
