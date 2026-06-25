"use client";

import { useEffect, useState } from "react";
import { startAmbient, stopAmbient } from "@/lib/audio";

interface SoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  useEffect(() => {
    if (enabled) startAmbient();
    else stopAmbient();
    return () => stopAmbient();
  }, [enabled]);

  return (
    <button
      onClick={() => onChange(!enabled)}
      className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-white/10"
      aria-label={enabled ? "Mute sound" : "Enable sound"}
    >
      {enabled ? "🔊 Sound" : "🔇 Muted"}
    </button>
  );
}

