import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import HealthcareScanner from "./HealthcareScanner";

/** Seconds after load at which hero content begins to reveal. */
export const INTRO_DELAY = 1.15;

/**
 * An extremely short "system activation" overlay. Never blocks: any key press
 * or tap skips it, and it is nearly instant under reduced-motion.
 */
export default function IntroSequence() {
  const [phase, setPhase] = useState<"run" | "out" | "done">("run");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = window.setTimeout(() => setPhase("out"), reduced ? 200 : 1450);
    const t2 = window.setTimeout(() => setPhase("done"), reduced ? 600 : 2000);
    const skip = () => setPhase((p) => (p === "run" ? "out" : p));
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (phase === "done") return null;

  const line = "intro-line font-mono text-[0.62rem] uppercase tracking-[0.3em]";
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-opacity duration-500",
        phase === "out" ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="bg-dotgrid absolute inset-0 opacity-30" />
      <HealthcareScanner mode="once" duration={1.4} className="absolute inset-0" />
      <div className="relative w-[min(420px,80vw)]">
        <div className="intro-line mono-label !text-ice" style={{ animationDelay: "0.05s" }}>
          Digital movement lab
        </div>
        <svg viewBox="0 0 400 70" className="mt-4 w-full" fill="none">
          <path
            d="M0 38 H96 L108 32 L120 38 H150 L158 42 L170 4 L182 62 L190 30 L198 38 H250 Q268 20 286 38 H400"
            pathLength={1}
            stroke="#a7ecff"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="draw-once"
          />
        </svg>
        <div className="mt-3 space-y-1.5">
          <div className={cn(line, "text-steel/80")} style={{ animationDelay: "0.2s" }}>
            System activating
          </div>
          <div className={cn(line, "text-steel/80")} style={{ animationDelay: "0.55s" }}>
            Scanning environment
          </div>
          <div className={cn(line, "text-ice")} style={{ animationDelay: "0.9s" }}>
            Glorious Moraa · ready
          </div>
        </div>
        <div className="mt-5 h-px bg-ice/15">
          <div className="intro-bar h-px bg-ice" />
        </div>
      </div>
    </div>
  );
}
