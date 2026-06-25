"use client";

import { type ReactNode } from "react";

export type MobileSheetKey = "filters" | "layers" | "detail" | null;

interface MobileNavProps {
  active: MobileSheetKey;
  onSet: (key: MobileSheetKey) => void;
  hasDetail: boolean;
  hasApod: boolean;
  onOpenApod: () => void;
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileSheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-zinc-950/95 p-4 pb-24 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-2.5 py-0.5 text-lg leading-none text-zinc-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  label,
  icon,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] transition ${
        active ? "bg-white/15 text-zinc-100" : "text-zinc-400"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
      )}
    </button>
  );
}

export function MobileNav({
  active,
  onSet,
  hasDetail,
  hasApod,
  onOpenApod,
}: MobileNavProps) {
  return (
    <nav className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex items-stretch gap-1 border-t border-white/10 bg-black/85 p-1.5 backdrop-blur md:hidden">
      <NavButton
        active={active === "filters"}
        onClick={() =>
          onSet(active === "filters" ? null : "filters")
        }
        label="Filters"
        icon="⊟"
      />
      <NavButton
        active={active === "layers"}
        onClick={() => onSet(active === "layers" ? null : "layers")}
        label="Layers"
        icon="◐"
      />
      <NavButton
        active={active === "detail"}
        onClick={() => onSet(active === "detail" ? null : "detail")}
        label="Detail"
        icon="ⓘ"
        badge={hasDetail}
      />
      {hasApod && (
        <NavButton
          active={false}
          onClick={onOpenApod}
          label="APOD"
          icon="✦"
        />
      )}
    </nav>
  );
}
