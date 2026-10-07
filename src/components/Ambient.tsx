import { useEffect, useRef } from "react";
import { world } from "../lib/world";

/**
 * Fixed environment layers: deep clinical background, overhead theatre light,
 * a parallaxing measurement grid, a cursor-following light, a warm "human"
 * overlay that fades in towards the contact section, and a vignette.
 * The WebGL canvas (z-1) sits between the back and front groups.
 */
export default function Ambient() {
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastPar = NaN;
    let lastMx = NaN;
    let lastMy = NaN;
    let lastWarm = NaN;
    const loop = () => {
      const par = world.reduced ? 0 : -((world.scrollY * 0.12) % 136);
      if (back.current && par !== lastPar) {
        back.current.style.setProperty("--par", `${par.toFixed(1)}px`);
        lastPar = par;
      }
      const f = front.current;
      if (f) {
        const mx = (world.pxs * 0.5 + 0.5) * 100;
        const my = (-world.pys * 0.5 + 0.5) * 100;
        if (Math.abs(mx - lastMx) > 0.05 || Math.abs(my - lastMy) > 0.05) {
          f.style.setProperty("--mx", `${mx.toFixed(2)}%`);
          f.style.setProperty("--my", `${my.toFixed(2)}%`);
          lastMx = mx;
          lastMy = my;
        }
        if (Math.abs(world.warmS - lastWarm) > 0.002) {
          f.style.setProperty("--warm", world.warmS.toFixed(3));
          lastWarm = world.warmS;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const coneMask = "linear-gradient(90deg, transparent, #000 28%, #000 72%, transparent)";
  const gridMask = "radial-gradient(ellipse at 50% 40%, #000 15%, transparent 75%)";

  return (
    <>
      <div
        ref={back}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: "radial-gradient(120% 85% at 72% -5%, #0c2a42 0%, #071522 42%, #04090f 100%)" }}
      >
        {/* overhead operating-theatre light */}
        <div
          className="absolute left-1/2 top-[-6%] h-[88%] w-[78%] -translate-x-1/2 opacity-70"
          style={{
            clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
            background:
              "linear-gradient(180deg, rgba(205,240,255,0.16), rgba(140,210,240,0.04) 55%, transparent 90%)",
            maskImage: coneMask,
            WebkitMaskImage: coneMask,
          }}
        />
        {/* measurement grid */}
        <div
          className="bg-dotgrid absolute inset-x-0 top-[-140px] bottom-[-140px] opacity-60"
          style={{
            transform: "translate3d(0, var(--par, 0px), 0)",
            maskImage: gridMask,
            WebkitMaskImage: gridMask,
          }}
        />
      </div>

      <div ref={front} aria-hidden className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(520px circle at var(--mx, 60%) var(--my, 40%), rgba(140,225,255,0.09), transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: "var(--warm, 0)",
            background:
              "radial-gradient(900px 600px at 50% 100%, rgba(255,196,150,0.17), transparent 70%), linear-gradient(180deg, transparent 30%, rgba(255,214,180,0.05))",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,6,12,0.62) 100%)" }}
        />
      </div>
    </>
  );
}
