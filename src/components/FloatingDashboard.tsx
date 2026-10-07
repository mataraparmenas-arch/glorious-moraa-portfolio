import type { CSSProperties } from "react";
import { cn } from "../utils/cn";

const DEFAULT_ITEMS = [
  { k: "System", v: "Online" },
  { k: "Movement", v: "Active" },
  { k: "Analysis", v: "Ready" },
  { k: "Profile", v: "Active" },
];

interface Props {
  className?: string;
  items?: { k: string; v: string }[];
}

/** Aesthetic status chips — interface language only, never clinical readings. */
export default function FloatingDashboard({ className, items = DEFAULT_ITEMS }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)} aria-hidden>
      {items.map((it, i) => (
        <div
          key={it.k}
          className="glass animate-float flex items-center gap-3 !rounded-[3px] px-3 py-2"
          style={{ animationDelay: `${i * 0.9}s`, animationDuration: `${6 + i}s` } as CSSProperties}
        >
          <span
            className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_8px_2px_rgba(143,240,212,0.55)]"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <span className="font-mono text-[0.62rem] uppercase leading-none tracking-[0.2em] text-steel/80">{it.k}</span>
          <span className="font-mono text-[0.62rem] uppercase leading-none tracking-[0.2em] text-ice">{it.v}</span>
        </div>
      ))}
    </div>
  );
}
