import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { profile } from "../data/profile";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { cn } from "../utils/cn";

/** A vertical clinical-record interface; a scanner descends the rail as you scroll. */
export default function ProfessionalJourney() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 72%", "end 58%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const n = profile.journey.length;
  const [count, setCount] = useState(1);

  useMotionValueEvent(p, "change", (v) => {
    setCount(profile.journey.filter((_, i) => v >= i / (n - 1) - 0.05).length);
  });
  const top = useTransform(p, (v) => `${v * 100}%`);

  return (
    <section id="journey" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader index="08" label="Journey" />
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="heading-xl">
                Professional <span className="text-ice-gradient font-semibold">journey</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-steel">
                A record-style view of how care, movement and physiotherapy connect. Specific dates and details are
                available in the CV.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a href="#cv" className="btn-sys mt-8">
                Open the record
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <GlassPanel corners className="p-6 sm:p-9">
                <div className="flex items-center justify-between border-b border-ice/10 pb-4">
                  <span className="mono-label !text-ice">Professional record</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-steel/60">
                    {profile.name}
                  </span>
                </div>

                <ol ref={ref} className="relative mt-8 space-y-9">
                  <div aria-hidden className="absolute bottom-2 left-4 top-2 w-px bg-ice/15">
                    <motion.div
                      style={{ scaleY: p, originY: 0 }}
                      className="absolute inset-0 bg-gradient-to-b from-ice/30 via-ice to-mint"
                    />
                    <motion.span
                      style={{ top }}
                      className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-ice shadow-[0_0_18px_5px_rgba(167,236,255,0.65)]"
                    />
                  </div>

                  {profile.journey.map((j, i) => {
                    const on = i < count;
                    return (
                      <li key={j.n} className="relative pl-12">
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-[11px] top-[9px] h-[11px] w-[11px] rounded-full border transition-all duration-700",
                            on ? "border-ice bg-ink shadow-[0_0_14px_2px_rgba(167,236,255,0.6)]" : "border-ice/25 bg-ink-2",
                          )}
                        />
                        <div className={cn("transition-opacity duration-700", on ? "opacity-100" : "opacity-40")}>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-xs tracking-[0.2em] text-ice">{j.n}</span>
                            <span aria-hidden className="h-px w-8 bg-ice/40 sm:w-12" />
                            <h3 className="font-display text-xl font-medium uppercase tracking-[0.1em] text-clinic sm:text-2xl">
                              {j.title}
                            </h3>
                          </div>
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-steel">{j.text}</p>
                          <div className="mt-3">
                            {j.period ? (
                              <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-mint">
                                {j.period}
                              </span>
                            ) : (
                              <span className="border border-ice/15 px-2 py-1 font-mono text-[0.54rem] uppercase tracking-[0.22em] text-steel/60">
                                Details · see CV
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </GlassPanel>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
