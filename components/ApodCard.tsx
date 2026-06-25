"use client";

import { useState } from "react";
import type { Apod } from "@/lib/apod";

interface ApodCardProps {
  apod: Apod;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function ApodCard({
  apod,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: ApodCardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  if (apod.mediaType !== "image") return null;

  return (
    <>
      {!hideTrigger && (
      <button
        onClick={() => setOpen(true)}
        className="group hidden md:flex absolute left-6 top-24 z-10 items-center gap-3 rounded-xl border border-white/10 bg-black/55 p-2 pr-3 text-left backdrop-blur transition hover:bg-black/70"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={apod.url}
          alt={apod.title}
          className="h-12 w-12 rounded-md object-cover"
        />
        <div className="max-w-[180px]">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">
            Astronomy Picture of the Day
          </div>
          <div className="truncate text-xs font-medium text-zinc-100">
            {apod.title}
          </div>
        </div>
      </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={apod.hdurl ?? apod.url}
              alt={apod.title}
              className="w-full"
            />
            <div className="p-5">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-400">
                NASA APOD · {apod.date}
              </div>
              <h2 className="text-lg font-semibold">{apod.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {apod.explanation}
              </p>
              {apod.copyright && (
                <p className="mt-3 text-xs text-zinc-500">
                  © {apod.copyright.trim()}
                </p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm text-zinc-200 transition hover:bg-black/80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
