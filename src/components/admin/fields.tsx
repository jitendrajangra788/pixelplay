"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialState } from "@/lib/action-state";
import { buttonClass, dangerButtonClass, fieldClass, labelClass } from "@/lib/styles";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100" role="alert">
      {message}
    </p>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-sm text-rose-300">{message}</span>;
}

export function TextField({
  label,
  name,
  error,
  ...props
}: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input name={name} className={fieldClass} {...props} />
      <FieldError message={error} />
    </label>
  );
}

export function TextArea({
  label,
  name,
  error,
  ...props
}: { label: string; name: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea name={name} className={fieldClass} {...props} />
      <FieldError message={error} />
    </label>
  );
}

export function SelectField({
  label,
  name,
  error,
  children,
  ...props
}: { label: string; name: string; error?: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select name={name} className={fieldClass} {...props}>
        {children}
      </select>
      <FieldError message={error} />
    </label>
  );
}

export function CheckField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-200">
      <input type="hidden" name={name} value="false" />
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="h-4 w-4 accent-violet-500" />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Saving..." : children}
    </button>
  );
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this item? This cannot be undone.")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={dangerButtonClass}>
        {label}
      </button>
      {state.message && !state.ok ? <span className="mt-1 block max-w-48 text-xs text-rose-300">{state.message}</span> : null}
    </form>
  );
}
