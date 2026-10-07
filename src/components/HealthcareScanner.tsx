import type { CSSProperties, ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
  children?: ReactNode;
  className?: string;
  /** "loop" repeats with a pause; "once" runs a single sweep (re-run by changing runKey). */
  mode?: "loop" | "once";
  axis?: "x" | "y";
  duration?: number;
  delay?: number;
  runKey?: number | string;
  active?: boolean;
}

/**
 * Reusable medical-scanner sweep. Wrap content, or place as an absolutely
 * positioned overlay inside any relatively positioned container.
 */
export default function HealthcareScanner({
  children,
  className,
  mode = "loop",
  axis = "y",
  duration = 6,
  delay = 0,
  runKey = 0,
  active = true,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {active && (
        <span
          key={runKey}
          aria-hidden
          className={cn(axis === "y" ? "scan-sweep-y" : "scan-sweep-x", mode === "loop" && "loop")}
          style={{ "--scan-d": `${duration}s`, "--scan-delay": `${delay}s` } as CSSProperties}
        />
      )}
    </div>
  );
}
