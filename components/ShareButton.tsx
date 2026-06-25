"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={copy}
      className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-white/10"
    >
      {copied ? "Copied!" : "Share view"}
    </button>
  );
}
