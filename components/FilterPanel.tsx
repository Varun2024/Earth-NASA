"use client";

import { colorFor } from "@/lib/eonet";

interface CategorySummary {
  id: string;
  title: string;
  count: number;
}

interface FilterPanelProps {
  categories: CategorySummary[];
  active: Set<string>;
  onToggle: (id: string) => void;
  onSetAll: (on: boolean) => void;
  className?: string;
}

const DESKTOP_CLASS =
  "hidden md:block absolute left-6 bottom-6 z-10 w-64 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur";

export function FilterPanel({
  categories,
  active,
  onToggle,
  onSetAll,
  className,
}: FilterPanelProps) {
  return (
    <aside className={className ?? DESKTOP_CLASS}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Categories
        </h2>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => onSetAll(true)}
            className="rounded px-1.5 py-0.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            All
          </button>
          <button
            onClick={() => onSetAll(false)}
            className="rounded px-1.5 py-0.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            None
          </button>
        </div>
      </div>
      <ul className="space-y-1">
        {categories.map((cat) => {
          const isOn = active.has(cat.id);
          return (
            <li key={cat.id}>
              <button
                onClick={() => onToggle(cat.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${
                  isOn
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-500 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: colorFor(cat.id),
                      opacity: isOn ? 1 : 0.35,
                    }}
                  />
                  {cat.title}
                </span>
                <span className="text-xs tabular-nums text-zinc-500">
                  {cat.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
