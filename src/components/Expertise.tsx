import { useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { profile } from "../data/profile";
import { world } from "../lib/world";
import Container from "./Container";
import HealthcareScanner from "./HealthcareScanner";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

function Glyph({ kind }: { kind: string }) {
  const s = "rgba(167,236,255,.75)";
  const f = "rgba(167,236,255,.3)";
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-[7.5rem]" fill="none" aria-hidden>
      {kind === "wave" && (
        <path d="M0 18 H30 L38 8 L46 28 L54 18 H70 Q80 4 90 18 T120 18" stroke={s} strokeWidth="1.4" />
      )}
      {kind === "track" && (
        <>
          <line x1="0" y1="18" x2="120" y2="18" stroke={f} />
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={i * 10} y1="14" x2={i * 10} y2="22" stroke={f} />
          ))}
          <circle cx="84" cy="18" r="4" stroke={s} />
          <circle cx="84" cy="18" r="1.4" fill="#e6fbff" />
        </>
      )}
      {kind === "arc" && (
        <>
          <path d="M6 32 A54 54 0 0 1 114 32" stroke={f} />
          <path d="M6 32 A54 54 0 0 1 80 7" stroke={s} strokeWidth="1.4" />
          <circle cx="80" cy="7" r="2.6" fill="#e6fbff" />
        </>
      )}
      {kind === "steps" && (
        <polyline points="0,32 22,32 22,23 46,23 46,14 72,14 72,5 120,5" stroke={s} strokeWidth="1.4" strokeLinejoin="round" />
      )}
      {kind === "joint" && (
        <>
          <line x1="14" y1="30" x2="58" y2="19" stroke={s} />
          <line x1="62" y1="17" x2="108" y2="6" stroke={s} />
          <circle cx="60" cy="18" r="7" stroke={s} />
          <circle cx="60" cy="18" r="2" fill="#e6fbff" />
          <circle cx="14" cy="30" r="2.4" stroke={f} />
          <circle cx="108" cy="6" r="2.4" stroke={f} />
        </>
      )}
    </svg>
  );
}

type Mod = (typeof profile.expertise)[number];

function Module({ m, i }: { m: Mod; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const [run, setRun] = useState(0);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || world.reduced) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${(px * 9).toFixed(2)}deg) rotateX(${(-py * 9).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${e.clientX - r.left}px`);
    el.style.setProperty("--gy", `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      onViewportEnter={() => setRun((r) => r + 1)}
      transition={{ duration: 0.9, delay: i * 0.09, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <article
        ref={ref}
        data-hover
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => setRun((r) => r + 1)}
        className="glass group relative h-full overflow-hidden p-5 transition-transform duration-300 ease-out will-change-transform"
      >
        <HealthcareScanner
          mode="once"
          duration={1.7}
          runKey={run}
          active={run > 0}
          delay={i * 0.08}
          className="pointer-events-none absolute inset-0"
        />
        {/* border illumination */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-ice/0 shadow-[inset_0_0_0_0_rgba(167,236,255,0)] transition-all duration-500 group-hover:border-ice/55 group-hover:shadow-[inset_0_0_30px_-6px_rgba(167,236,255,0.25)]"
        />
        {/* light sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-[transform,opacity] duration-1000 group-hover:translate-x-[320%] group-hover:opacity-100"
        />

        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-ice/70">{m.code}</span>
          <span className="flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-steel/60">
            <span className="pulse-dot h-1 w-1 rounded-full bg-mint" />
            Module
          </span>
        </div>
        <div className="relative mt-8">
          <Glyph kind={m.glyph} />
        </div>
        <h3 className="relative mt-8 font-display text-[1.6rem] font-medium uppercase leading-[0.95] tracking-[0.04em] text-clinic">
          {m.title}
        </h3>
        <div className="relative mt-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ice">{m.sub}</div>
        <p className="relative mt-5 border-t border-ice/10 pt-4 text-sm leading-relaxed text-steel">{m.text}</p>
      </article>
    </motion.div>
  );
}

export default function Expertise() {
  return (
    <section id="expertise" className="relative py-28 md:py-40">
      <HealthcareScanner mode="loop" axis="x" duration={16} delay={3} className="pointer-events-none absolute inset-0" />
      <Container>
        <SectionHeader index="04" label="Expertise" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="heading-lg">
                Professional <span className="text-ice-gradient font-semibold">expertise</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <p className="max-w-md text-[1rem] leading-relaxed text-steel">
                Five focus areas that shape how Glorious approaches healthcare — from the first moment of care to the
                last step of recovery.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {profile.expertise.map((m, i) => (
            <Module key={m.code} m={m} i={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
