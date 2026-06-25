"use client";

export interface LayerState {
  eonet: boolean;
  neo: boolean;
  iss: boolean;
}

interface LayersPanelProps {
  layers: LayerState;
  onToggle: (key: keyof LayerState) => void;
  counts: { eonet: number; neo: number };
  className?: string;
}

const DESKTOP_CLASS =
  "hidden md:block absolute right-6 bottom-6 z-10 w-60 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur";

const ITEMS: Array<{
  key: keyof LayerState;
  label: string;
  color: string;
  hint: string;
}> = [
  {
    key: "eonet",
    label: "Earth events",
    color: "#22c55e",
    hint: "surface pillars",
  },
  {
    key: "neo",
    label: "Near-Earth objects",
    color: "#cbd5e1",
    hint: "orbiting rocks",
  },
  {
    key: "iss",
    label: "ISS (live)",
    color: "#22d3ee",
    hint: "satellite",
  },
];

export function LayersPanel({
  layers,
  onToggle,
  counts,
  className,
}: LayersPanelProps) {
  return (
    <aside className={className ?? DESKTOP_CLASS}>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
        Layers
      </h2>
      <ul className="space-y-1">
        {ITEMS.map((item) => {
          const on = layers[item.key];
          const count =
            item.key === "eonet"
              ? counts.eonet
              : item.key === "neo"
                ? counts.neo
                : null;
          return (
            <li key={item.key}>
              <button
                onClick={() => onToggle(item.key)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${
                  on
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-500 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.color,
                      opacity: on ? 1 : 0.35,
                      boxShadow: on ? `0 0 8px ${item.color}` : "none",
                    }}
                  />
                  <span>
                    {item.label}
                    <span className="ml-1 text-[10px] text-zinc-500">
                      · {item.hint}
                    </span>
                  </span>
                </span>
                {count !== null && (
                  <span className="text-xs tabular-nums text-zinc-500">
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
