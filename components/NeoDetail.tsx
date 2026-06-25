"use client";

import type { NeoObject } from "@/lib/neo";

interface NeoDetailProps {
  neo: NeoObject | null;
  onClose: () => void;
  className?: string;
}

const DESKTOP_CLASS =
  "hidden md:block absolute right-6 top-6 z-10 w-80 rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur";

export function NeoDetail({ neo, onClose, className }: NeoDetailProps) {
  if (!neo) return null;

  const date = new Date(neo.approachTime).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <aside className={className ?? DESKTOP_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: neo.hazardous ? "#ef4444" : "#cbd5e1" }}
          />
          <span className="text-xs uppercase tracking-wider text-zinc-400">
            Near-Earth Object {neo.hazardous && "· Potentially Hazardous"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 transition hover:text-zinc-200"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-snug">{neo.name}</h3>

      <dl className="mt-4 space-y-2 text-xs text-zinc-400">
        <div className="flex justify-between gap-3">
          <dt>Close approach</dt>
          <dd className="text-zinc-200">{date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Estimated size</dt>
          <dd className="text-zinc-200">
            ~{Math.round(neo.diameterMeters)} m
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Miss distance</dt>
          <dd className="text-zinc-200">
            {neo.missDistanceLunar.toFixed(2)} LD
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt></dt>
          <dd className="font-mono text-[10px] text-zinc-500">
            {Math.round(neo.missDistanceKm).toLocaleString()} km
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Velocity</dt>
          <dd className="text-zinc-200">{neo.velocityKmS.toFixed(2)} km/s</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/10 pt-3">
        <a
          href={neo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-300 underline-offset-2 hover:underline"
        >
          JPL Small-Body Database →
        </a>
      </div>
    </aside>
  );
}
