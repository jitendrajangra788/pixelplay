"use client";

import { useEffect, useRef, useState } from "react";
import { FieldError } from "@/components/admin/fields";
import { labelClass } from "@/lib/styles";

const commands = [
  { label: "Bold", command: "bold" },
  { label: "Italic", command: "italic" },
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "List", command: "insertUnorderedList" },
  { label: "Numbered", command: "insertOrderedList" },
  { label: "Quote", command: "formatBlock", value: "blockquote" },
];

export function RichTextEditor({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !ref.current) return;
    ref.current.innerHTML = defaultValue;
    loaded.current = true;
  }, [defaultValue]);

  function sync() {
    setHtml(ref.current?.innerHTML ?? "");
  }

  function apply(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert("Use an http or https link.");
      return;
    }
    apply("createLink", url);
  }

  return (
    <div>
      <span className={labelClass}>Article</span>
      <div className="mb-2 flex flex-wrap gap-2">
        {commands.map((item) => (
          <button
            key={item.label}
            type="button"
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:border-violet-300"
            onClick={() => apply(item.command, item.value)}
          >
            {item.label}
          </button>
        ))}
        <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-xs text-white" onClick={addLink}>
          Link
        </button>
        <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-xs text-white" onClick={() => apply("removeFormat")}>
          Clear
        </button>
      </div>
      <div
        ref={ref}
        className="richtext editor rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm focus:border-violet-400"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Article"
        onInput={sync}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          sync();
        }}
      />
      <input type="hidden" name="content" value={html} />
      <FieldError message={error} />
    </div>
  );
}
