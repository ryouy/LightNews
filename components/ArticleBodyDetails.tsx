"use client";

import { useState, type SyntheticEvent } from "react";

type Props = { body: string };

export function ArticleBodyDetails({ body }: Props) {
  const [open, setOpen] = useState(false);

  function onToggle(e: SyntheticEvent<HTMLDetailsElement>) {
    setOpen(e.currentTarget.open);
  }

  return (
    <details
      className="mt-2 rounded border border-neutral-100 bg-neutral-50/70"
      onToggle={onToggle}
    >
      <summary className="cursor-pointer list-none px-2 py-1.5 text-xs text-neutral-600 [&::-webkit-details-marker]:hidden">
        <span className="underline decoration-neutral-300 underline-offset-1">
          {open ? "本文を閉じる" : "本文を表示"}
        </span>
      </summary>
      <div className="max-h-40 overflow-y-auto border-t border-neutral-100 px-2 py-1.5">
        <p className="whitespace-pre-wrap text-[16.5px] leading-snug text-neutral-700">
          {body}
        </p>
      </div>
    </details>
  );
}
