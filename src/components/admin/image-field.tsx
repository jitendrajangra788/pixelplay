"use client";

import { useState } from "react";
import { fieldClass, labelClass } from "@/lib/styles";
import { FieldError } from "@/components/admin/fields";

type Preview = { key: string; src?: string; name?: string };

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,.heic,.heif";

function isHeicFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function ImageField({
  label,
  name = "image",
  current,
  error,
  required = false,
  multiple = false,
}: {
  label: string;
  name?: string;
  current?: string;
  error?: string;
  required?: boolean;
  multiple?: boolean;
}) {
  const [previews, setPreviews] = useState<Preview[]>(current ? [{ key: current, src: current }] : []);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setPreviews((existing) => {
      for (const preview of existing) {
        if (preview.src?.startsWith("blob:")) URL.revokeObjectURL(preview.src);
      }
      if (!files.length) return current ? [{ key: current, src: current }] : [];
      return files.map((file) =>
        isHeicFile(file)
          ? { key: `${file.name}-${file.size}-${file.lastModified}`, name: file.name }
          : {
              key: `${file.name}-${file.size}-${file.lastModified}`,
              src: URL.createObjectURL(file),
            },
      );
    });
  }

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {previews.length ? (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <div key={preview.key} className="relative aspect-video overflow-hidden rounded-xl border border-white/10">
              {preview.src ? (
                // blob and local previews are not passed through the image optimizer
                <img src={preview.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 bg-white/5 px-2 text-center">
                  <p className="w-full truncate text-[11px] font-medium text-white">{preview.name}</p>
                  <p className="text-[10px] text-muted">Converts on save</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
      <input
        name={name}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        required={required}
        className={`${fieldClass} file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1 file:text-xs file:font-semibold file:text-navy-950`}
        onChange={onChange}
      />
      <p className="mt-2 text-xs text-muted">PNG, JPG, WEBP, GIF, or iPhone HEIC. Images are stored as WebP.</p>
      <FieldError message={error} />
    </div>
  );
}
