import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { cn } from "../utils/cn";

/** Four precise corner brackets — the "instrument frame" motif. */
export function Corners({ className }: { className?: string }) {
  const c = "pointer-events-none absolute h-2.5 w-2.5 border-ice/60";
  return (
    <>
      <span aria-hidden className={cn(c, "left-1.5 top-1.5 border-l border-t", className)} />
      <span aria-hidden className={cn(c, "right-1.5 top-1.5 border-r border-t", className)} />
      <span aria-hidden className={cn(c, "bottom-1.5 left-1.5 border-b border-l", className)} />
      <span aria-hidden className={cn(c, "bottom-1.5 right-1.5 border-b border-r", className)} />
    </>
  );
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  corners?: boolean;
}

/** Premium glass surface whose highlight follows the pointer. */
export default function GlassPanel({ className, children, corners = false, onPointerMove, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${e.clientX - r.left}px`);
      el.style.setProperty("--gy", `${e.clientY - r.top}px`);
    }
    onPointerMove?.(e);
  };
  return (
    <div ref={ref} onPointerMove={handleMove} className={cn("glass", className)} {...rest}>
      {corners && <Corners />}
      {children}
    </div>
  );
}
