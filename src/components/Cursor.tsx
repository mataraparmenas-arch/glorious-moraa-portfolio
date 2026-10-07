import { useEffect, useRef, useState } from "react";
import { world } from "../lib/world";

/**
 * A restrained clinical reticle that trails the native cursor and tightens
 * around interactive elements. Desktop / fine pointers only.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && window.matchMedia("(hover: hover)").matches;
    setEnabled(fine);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let shown = false;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        el.style.opacity = "1";
      }
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      el.dataset.hover = t?.closest?.("a,button,[data-hover]") ? "1" : "0";
    };
    const down = () => {
      el.dataset.down = "1";
    };
    const up = () => {
      el.dataset.down = "0";
    };
    const leave = () => {
      shown = false;
      el.style.opacity = "0";
    };

    const loop = () => {
      const k = world.reduced ? 1 : 0.2;
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      el.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const tick = "absolute bg-ice/70";
  return (
    <div
      ref={ref}
      aria-hidden
      data-hover="0"
      data-down="0"
      className="group pointer-events-none fixed left-0 top-0 z-[90] opacity-0 transition-opacity duration-300"
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-9 w-9 rounded-full border border-ice/35 transition-all duration-300 group-data-[hover=1]:h-14 group-data-[hover=1]:w-14 group-data-[hover=1]:border-ice/80 group-data-[down=1]:scale-75">
          <span className={`${tick} left-1/2 top-[-4px] h-[7px] w-px -translate-x-1/2`} />
          <span className={`${tick} bottom-[-4px] left-1/2 h-[7px] w-px -translate-x-1/2`} />
          <span className={`${tick} left-[-4px] top-1/2 h-px w-[7px] -translate-y-1/2`} />
          <span className={`${tick} right-[-4px] top-1/2 h-px w-[7px] -translate-y-1/2`} />
        </div>
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ice/80" />
      </div>
    </div>
  );
}
