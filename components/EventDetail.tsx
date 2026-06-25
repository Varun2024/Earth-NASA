"use client";

import { colorFor, type EventPoint } from "@/lib/eonet";

interface EventDetailProps {
  event: EventPoint | null;
  onClose: () => void;
  className?: string;
}

const DESKTOP_CLASS =
  "hidden md:block absolute right-6 top-6 z-10 w-80 rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur";

export function EventDetail({ event, onClose, className }: EventDetailProps) {
  if (!event) return null;

  const date = new Date(event.date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <aside className={className ?? DESKTOP_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: colorFor(event.categoryId) }}
          />
          <span className="text-xs uppercase tracking-wider text-zinc-400">
            {event.categoryTitle}
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

      <h3 className="mt-2 text-base font-semibold leading-snug">
        {event.title}
      </h3>

      <dl className="mt-4 space-y-2 text-xs text-zinc-400">
        <div className="flex justify-between gap-3">
          <dt>Date</dt>
          <dd className="text-zinc-200">{date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Coordinates</dt>
          <dd className="font-mono text-zinc-200">
            {event.lat.toFixed(2)}, {event.lon.toFixed(2)}
          </dd>
        </div>
        {event.magnitudeValue !== undefined && (
          <div className="flex justify-between gap-3">
            <dt>Magnitude</dt>
            <dd className="text-zinc-200">
              {event.magnitudeValue} {event.magnitudeUnit ?? ""}
            </dd>
          </div>
        )}
      </dl>

      {event.sources.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
            Sources
          </p>
          <ul className="space-y-1">
            {event.sources.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-300 underline-offset-2 hover:underline"
                >
                  {s.id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
