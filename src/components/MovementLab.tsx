import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { world } from "../lib/world";
import AnalysisGraphs from "./AnalysisGraphs";
import GlassPanel from "./GlassPanel";
import MedicalWaveform from "./MedicalWaveform";
import SectionHeader from "./SectionHeader";
import { cn } from "../utils/cn";

const PHASES = [
  { code: "A", joint: "Shoulder", title: "Abduction path", note: "The arms trace a wide arc through the frontal plane." },
  { code: "B", joint: "Elbow", title: "Flexion path", note: "The forearm folds and extends at shoulder height." },
  { code: "C", joint: "Hip · Knee", title: "Controlled flexion", note: "Hip and knee flex together while the trunk stays balanced." },
  { code: "D", joint: "Ankle", title: "Heel-raise path", note: "The ankle rolls through plantar flexion as the heel lifts." },
];

const LEADERS = [
  { a: "Mobility", b: "Analysis", joint: "hipR", side: "left", top: "62%" },
  { a: "Movement", b: "Path", joint: "kneeR", side: "left", top: "76%" },
  { a: "Motion", b: "Tracking", joint: "wristL", side: "right", top: "62%" },
  { a: "Rehabilitation", b: "", joint: "ankleL", side: "right", top: "76%" },
] as const;

/** Docked interface labels with leader lines that follow the projected 3D joints. */
function LabLeaders({ host }: { host: RefObject<HTMLDivElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const rings = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const h = host.current;
      const w = wrap.current;
      if (h && w) {
        const hr = h.getBoundingClientRect();
        const visible = hr.bottom > 0 && hr.top < window.innerHeight;
        const o = visible ? Math.min(1, Math.max(0, (world.kf.move - 0.35) / 0.65)) : 0;
        w.style.opacity = o.toFixed(3);
        if (o > 0.01) {
          LEADERS.forEach((L, i) => {
            const j = world.joints[L.joint];
            const lab = labels.current[i];
            const line = lines.current[i];
            const dot = dots.current[i];
            const ring = rings.current[i];
            if (!j || !lab || !line || !dot || !ring) return;
            const lr = lab.getBoundingClientRect();
            const ax = (L.side === "left" ? lr.right : lr.left) - hr.left;
            const ay = lr.top + lr.height / 2 - hr.top;
            const jx = j.x - hr.left;
            const jy = j.y - hr.top;
            line.setAttribute("x1", ax.toFixed(1));
            line.setAttribute("y1", ay.toFixed(1));
            line.setAttribute("x2", jx.toFixed(1));
            line.setAttribute("y2", jy.toFixed(1));
            dot.setAttribute("cx", jx.toFixed(1));
            dot.setAttribute("cy", jy.toFixed(1));
            ring.setAttribute("cx", jx.toFixed(1));
            ring.setAttribute("cy", jy.toFixed(1));
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [host]);

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-0 lg:block">
      <svg className="absolute inset-0 h-full w-full" fill="none">
        {LEADERS.map((L, i) => (
          <g key={L.a}>
            <line
              ref={(el) => {
                lines.current[i] = el;
              }}
              stroke="rgba(167,236,255,.45)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle
              ref={(el) => {
                rings.current[i] = el;
              }}
              r="9"
              stroke="rgba(167,236,255,.55)"
            />
            <circle
              ref={(el) => {
                dots.current[i] = el;
              }}
              r="2.4"
              fill="#e6fbff"
            />
          </g>
        ))}
      </svg>
      {LEADERS.map((L, i) => (
        <div
          key={L.a}
          ref={(el) => {
            labels.current[i] = el;
          }}
          className={cn(
            "glass !rounded-[2px] absolute px-3 py-2",
            L.side === "left" ? "left-12 text-left" : "right-12 text-right",
          )}
          style={{ top: L.top }}
        >
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ice">{L.a}</div>
          {L.b && <div className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-steel/70">{L.b}</div>}
        </div>
      ))}
    </div>
  );
}

function Segment({ p, i }: { p: MotionValue<number>; i: number }) {
  const scaleX = useTransform(p, [i * 0.25, (i + 1) * 0.25], [0, 1], { clamp: true });
  return (
    <span className="relative h-[3px] flex-1 overflow-hidden bg-ice/15">
      <motion.span style={{ scaleX, originX: 0 }} className="absolute inset-0 bg-gradient-to-r from-ice to-mint" />
    </span>
  );
}

export default function MovementLab() {
  const track = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPhase(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3);
  });

  const cur = PHASES[phase];

  return (
    <>
      <section id="movement" className="relative">
        <div ref={track} className="relative h-[340svh]">
          <div ref={host} className="sticky top-0 h-[100svh] overflow-hidden">
            <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-5 pb-5 pt-24 sm:px-8 lg:px-12">
              {/* top row */}
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-[340px]">
                  <SectionHeader index="05" label="Movement" />
                  <h2 className="heading-xl mt-5 !text-[clamp(2.4rem,5vw,4.2rem)]">
                    Movement <span className="text-ice-gradient font-semibold">lab</span>
                  </h2>
                  <ol className="mt-6 hidden space-y-1.5 lg:block">
                    {PHASES.map((p, i) => {
                      const on = i === phase;
                      return (
                        <li
                          key={p.code}
                          className={cn(
                            "flex items-center gap-3 border-l py-1.5 pl-3 transition-all duration-500",
                            on ? "border-ice text-clinic" : "border-ice/15 text-steel/45",
                          )}
                        >
                          <span className="font-mono text-[0.62rem] tracking-[0.2em] text-ice/70">{p.code}</span>
                          <span className="font-display text-[0.95rem] uppercase tracking-[0.12em]">{p.joint}</span>
                          <span className="ml-auto font-mono text-[0.56rem] uppercase tracking-[0.2em]">
                            {on ? "Tracking" : "Standby"}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <GlassPanel corners className="hidden w-[300px] p-5 lg:block">
                  <div className="flex items-center justify-between">
                    <span className="mono-label !text-ice">Motion graph</span>
                    <span className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-steel/60">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
                      Illustrative
                    </span>
                  </div>
                  <MedicalWaveform variant="motion" height={78} className="mt-3" speed={1.1} />
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-ice/10 pt-3 font-mono text-[0.58rem] uppercase tracking-[0.2em]">
                    {PHASES.map((p, i) => (
                      <div key={p.code} className="flex items-center justify-between">
                        <span className={i === phase ? "text-ice" : "text-steel/50"}>{p.joint.split(" ")[0]}</span>
                        <span className={i === phase ? "text-mint" : "text-steel/35"}>{i === phase ? "●" : "○"}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>

              {/* bottom caption */}
              <GlassPanel corners className="relative z-10 mx-auto w-full max-w-[540px] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="mono-label !text-ice">
                    Phase {cur.code} <span className="mx-1 text-ice/30">/</span> {cur.joint}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel/70">{cur.title}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-steel">{cur.note}</p>
                <div className="mt-4 flex gap-1.5">
                  {PHASES.map((p, i) => (
                    <Segment key={p.code} p={scrollYProgress} i={i} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-[0.54rem] uppercase tracking-[0.22em] text-steel/50">
                  <span>Scroll to move the figure</span>
                  <span>Conceptual · not a measurement</span>
                </div>
              </GlassPanel>
            </div>

            <LabLeaders host={host} />
          </div>
        </div>
      </section>
      <AnalysisGraphs />
    </>
  );
}
