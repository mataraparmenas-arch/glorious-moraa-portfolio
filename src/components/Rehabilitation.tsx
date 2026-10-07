import { useRef } from "react";
import { useInView } from "motion/react";
import Container from "./Container";
import { BodyFlow, BodyGhost, BodyReveal } from "./BodySilhouette";
import { Corners } from "./GlassPanel";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { cn } from "../utils/cn";

/**
 * Digital anatomical silhouette: a beam travels down the body, outlines, points,
 * slices and movement vectors illuminate, then the body dissolves into a network
 * of motion lines — the transition into rehabilitation.
 */
export default function Rehabilitation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-8% 0px -8% 0px" });
  const mask = "radial-gradient(circle at 50% 50%, #000 30%, transparent 72%)";

  return (
    <section id="rehab" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader index="07" label="Rehabilitation" />
        <div className="mt-10 grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div
              ref={ref}
              className={cn("relative mx-auto aspect-square w-full max-w-[520px]", !inView && "bs-paused")}
              role="img"
              aria-label="An anatomical silhouette being scanned, then dissolving into lines of movement"
            >
              <div
                aria-hidden
                className="bg-dotgrid absolute inset-0 opacity-[0.22]"
                style={{ maskImage: mask, WebkitMaskImage: mask }}
              />
              <BodyGhost className="bs-base absolute inset-0 h-full w-full" />
              <BodyReveal className="bs-reveal absolute inset-0 h-full w-full" />
              <div
                aria-hidden
                className="bs-beam pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice to-transparent shadow-[0_0_20px_4px_rgba(167,236,255,0.55)]"
              />
              <BodyFlow className="bs-flow absolute inset-0 h-full w-full" />
              <Corners className="!h-4 !w-4" />
              <div className="absolute bottom-3 left-4 font-mono text-[0.54rem] uppercase tracking-[0.24em] text-steel/50">
                Scan sequence · illustrative
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <Reveal>
              <h2 className="heading-xl !text-[clamp(2.2rem,5.2vw,4.6rem)]">
                Rehabil<span className="text-ice-gradient font-semibold">itation</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-steel">
                Recovery is rarely a single moment — it is a pathway. Rehabilitation joins compassionate care with an
                understanding of movement, supporting people as they rebuild function, confidence and independence.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-ice">
                {["Care", "Movement", "Function"].map((s, i) => (
                  <span key={s} className="flex items-center gap-3">
                    <span className="border border-ice/25 bg-ice/[0.05] px-3 py-1.5">{s}</span>
                    {i < 2 && <span className="text-ice/40">→</span>}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
