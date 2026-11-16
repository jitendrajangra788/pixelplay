"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createEnquiry } from "@/lib/actions/enquiries";
import { initialState } from "@/lib/action-state";
import { buttonClass, fieldClass, labelClass } from "@/lib/styles";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Sending..." : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(createEnquiry, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.ok && state.message) {
    return (
      <div className="rounded-3xl border border-violet-300/30 bg-violet-500/10 p-8" role="status">
        <h2 className="font-display text-3xl text-white">Message received</h2>
        <p className="mt-3 leading-7 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-white/10 bg-navy-900 p-6 md:p-8" noValidate>
      {state.message ? (
        <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Name</span>
          <input name="name" autoComplete="name" className={fieldClass} required />
          {errors.name ? <span className="mt-1 block text-sm text-rose-300">{errors.name}</span> : null}
        </label>
        <label>
          <span className={labelClass}>Email</span>
          <input name="email" type="email" autoComplete="email" className={fieldClass} required />
          {errors.email ? <span className="mt-1 block text-sm text-rose-300">{errors.email}</span> : null}
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Phone</span>
          <input name="phone" autoComplete="tel" className={fieldClass} />
          {errors.phone ? <span className="mt-1 block text-sm text-rose-300">{errors.phone}</span> : null}
        </label>
        <label>
          <span className={labelClass}>Subject</span>
          <input name="subject" className={fieldClass} required />
          {errors.subject ? <span className="mt-1 block text-sm text-rose-300">{errors.subject}</span> : null}
        </label>
      </div>
      <label>
        <span className={labelClass}>Message</span>
        <textarea name="message" rows={6} className={fieldClass} required />
        {errors.message ? <span className="mt-1 block text-sm text-rose-300">{errors.message}</span> : null}
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Submit />
    </form>
  );
}
