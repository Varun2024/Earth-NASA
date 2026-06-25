"use client";

import { useEffect, useRef, useState } from "react";

interface TimelineScrubberProps {
  minDate: number;
  maxDate: number;
  value: number;
  onChange: (value: number) => void;
}

const DAY_MS = 86_400_000;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineScrubber({
  minDate,
  maxDate,
  value,
  onChange,
}: TimelineScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    const step = (t: number) => {
      if (!lastTickRef.current) lastTickRef.current = t;
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      const speed = (maxDate - minDate) / 8000;
      const next = value + dt * speed;
      if (next >= maxDate) {
        onChange(maxDate);
        setPlaying(false);
        lastTickRef.current = 0;
        return;
      }
      onChange(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [playing, value, minDate, maxDate, onChange]);

  const togglePlay = () => {
    if (value >= maxDate) onChange(minDate);
    setPlaying((p) => !p);
  };

  const reset = () => {
    setPlaying(false);
    onChange(maxDate);
  };

  return (
    <div className="pointer-events-auto absolute bottom-20 left-1/2 z-10 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur md:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-zinc-400">
        <span>{formatDate(minDate)}</span>
        <span className="font-mono text-xs text-zinc-100">
          showing as of {formatDate(value)}
        </span>
        <span>{formatDate(maxDate)}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/15"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <input
          type="range"
          min={minDate}
          max={maxDate}
          step={DAY_MS / 4}
          value={value}
          onChange={(e) => {
            setPlaying(false);
            onChange(Number(e.target.value));
          }}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-sky-400"
        />
        <button
          onClick={reset}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 transition hover:bg-white/15"
        >
          now
        </button>
      </div>
    </div>
  );
}
