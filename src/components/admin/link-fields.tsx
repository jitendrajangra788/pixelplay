"use client";

import { useState } from "react";
import { FieldError } from "@/components/admin/fields";
import { fieldClass, ghostButtonClass, labelClass } from "@/lib/styles";

export function LinkFields({
  links,
  error,
}: {
  links: { title: string; url: string }[];
  error?: string;
}) {
  const [rows, setRows] = useState(() =>
    (links.length ? links : [{ title: "", url: "" }]).map((row) => ({ ...row, key: crypto.randomUUID() })),
  );

  return (
    <fieldset>
      <legend className={labelClass}>External game links</legend>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <input name="linkTitle" defaultValue={row.title} placeholder="Link title" className={fieldClass} />
            <input name="linkUrl" defaultValue={row.url} placeholder="https://" className={fieldClass} />
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={`${ghostButtonClass} mt-3`} onClick={() => setRows((current) => [...current, { title: "", url: "", key: crypto.randomUUID() }])}>
        Add link
      </button>
      <FieldError message={error} />
    </fieldset>
  );
}
