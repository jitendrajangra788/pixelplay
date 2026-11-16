"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { initialState } from "@/lib/action-state";
import { buttonClass, fieldClass, labelClass } from "@/lib/styles";
import { FormError } from "@/components/admin/fields";
import { useFormStatus } from "react-dom";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action] = useActionState(login, initialState);
  return (
    <form action={action} className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-navy-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Nexora</p>
      <h1 className="font-display text-3xl text-white">Admin sign in</h1>
      <p className="text-sm text-muted">Use the studio account to manage categories, media, stories, and enquiries.</p>
      <FormError message={state.ok ? undefined : state.message} />
      <input type="hidden" name="next" value={nextPath} />
      <label className="block">
        <span className={labelClass}>Email</span>
        <input name="email" type="email" autoComplete="username" className={fieldClass} required />
      </label>
      <label className="block">
        <span className={labelClass}>Password</span>
        <input name="password" type="password" autoComplete="current-password" className={fieldClass} required />
      </label>
      <Submit />
    </form>
  );
}
