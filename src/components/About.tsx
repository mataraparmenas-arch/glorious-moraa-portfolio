import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { profile } from "../data/profile";
import Container from "./Container";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { cn } from "../utils/cn";

/** CNA → Patient care → Human understanding → Movement → Physiotherapy. A glowing line travels the stages as you scroll. */
function Pathway() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 62%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [count, setCount] = useState(1);
  const n = profile.pathway.length;

  useMotionValueEvent(p, "change", (v) => {
    setCount(profile.pathway.filter((_, i) => v >= i / (n - 1) - 0.03).length);
  });
  const left = useTransform(p, (v) => `${v * 100}%`);

  return (
    <div ref={ref} className="relative mt-20 md:mt-28">
      {/* horizontal track (md+) */}
      <div className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-ice/15 md:block">
        <motion.div
          style={{ scaleX: p, originX: 0 }}
          className="absolute inset-0 bg-gradient-to-r from-ice/30 via-ice to-mint"
        />
        <motion.span
          style={{ left }}
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_5px_rgba(167,236,255,0.75)]"
        />
      </div>
      {/* vertical track (mobile) */}
      <div className="absolute bottom-5 left-5 top-5 w-px bg-ice/15 md:hidden">
        <motion.div
          style={{ scaleY: p, originY: 0 }}
          className="absolute inset-0 bg-gradient-to-b from-ice/30 via-ice to-mint"
        />
      </div>

      <ol className="relative grid gap-9 md:grid-cols-5 md:gap-4">
        {profile.pathway.map((s, i) => {
          const on = i < count;
          return (
            <li key={s.code} className="flex gap-5 md:block md:text-center">
              <span
                className={cn(
                  "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border font-mono text-[0.65rem] transition-all duration-700 md:mx-auto",
                  on
                    ? "border-ice bg-ink-3 text-ice shadow-[0_0_26px_-2px_rgba(167,236,255,0.6)]"
                    : "border-ice/20 bg-ink-2 text-steel/50",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={cn("transition-opacity duration-700 md:mt-5", on ? "opacity-100" : "opacity-40")}>
                <div className="font-display text-lg font-medium uppercase tracking-[0.12em] text-clinic">{s.code}</div>
                <p className="mt-1.5 max-w-[15rem] text-sm leading-relaxed text-steel md:mx-auto">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader index="01" label="About" />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="heading-xl">
                Care begins
                <br />
                with the <span className="text-ice-gradient font-semibold">person.</span>
              </h2>
            </Reveal>
            <div className="mt-10 max-w-2xl space-y-5 text-[1.02rem] leading-relaxed text-steel">
              {profile.bio.map((para, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p>{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
        <Pathway />
      </Container>
    </section>
  );
}
