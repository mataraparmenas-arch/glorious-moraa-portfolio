import type { CSSProperties } from "react";
import GlassPanel from "./GlassPanel";
import { cn } from "../utils/cn";

const ROWS = [
  { k: "Range", v: "Active", d: "5.2s" },
  { k: "Motion", v: "Tracking", d: "3.8s" },
  { k: "Recovery", v: "Monitoring", d: "6.6s" },
];

/** The floating "movement analysis" glass monitor. Visual interface only. */
export default function MovementMonitor({ className }: { className?: string }) {
  return (
    <GlassPanel corners className={cn("w-full max-w-[340px] p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="mono-label !text-ice">Movement analysis</span>
        <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel/70">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
          Live
        </span>
      </div>
      <div className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-steel/60">Mobility</div>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-ice/50 to-transparent" />
      <ul className="mt-4 space-y-3.5">
        {ROWS.map((r) => (
          <li key={r.k} className="flex items-center gap-3">
            <span className="w-[4.6rem] font-mono text-[0.62rem] uppercase tracking-[0.2em] text-steel/80">{r.k}</span>
            <span className="relative h-px flex-1 bg-ice/25">
              <span className="track-dot" style={{ animationDuration: r.d } as CSSProperties} />
            </span>
            <span className="w-[5.6rem] text-right font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ice">
              {r.v}
            </span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
