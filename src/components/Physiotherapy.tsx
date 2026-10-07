import { profile } from "../data/profile";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const TRAJ = "M10 92 C 40 8, 92 8, 102 60 S 152 118, 190 28";

function RangeDial() {
  const ticks = [];
  for (let d = -90; d <= 90; d += 10) {
    const a = (d * Math.PI) / 180;
    const major = d % 30 === 0;
    const r0 = 80;
    const r1 = major ? 91 : 86;
    ticks.push(
      <line
        key={d}
        x1={100 + Math.sin(a) * r0}
        y1={100 - Math.cos(a) * r0}
        x2={100 + Math.sin(a) * r1}
        y2={100 - Math.cos(a) * r1}
        stroke="rgba(167,236,255,.45)"
        strokeWidth={major ? 1.2 : 0.7}
      />,
    );
  }
  return (
    <svg viewBox="0 0 200 118" className="w-full" fill="none" aria-hidden>
      <path d="M20 100 A80 80 0 0 1 180 100" stroke="rgba(167,236,255,.3)" />
      <path d="M40 100 A60 60 0 0 1 160 100" stroke="rgba(167,236,255,.14)" strokeDasharray="2 4" />
      {ticks}
      <g className="needle-swing">
        <line x1="100" y1="100" x2="100" y2="30" stroke="#a7ecff" strokeWidth="1.4" />
        <circle cx="100" cy="30" r="3.2" fill="#e6fbff" />
        <circle cx="100" cy="30" r="8" stroke="rgba(167,236,255,.5)" />
      </g>
      <circle cx="100" cy="100" r="4.5" fill="#050b14" stroke="#a7ecff" />
      <text x="14" y="114" fill="rgba(159,182,198,.7)" fontSize="7" letterSpacing="1.6" fontFamily="IBM Plex Mono, monospace">
        FLEXION
      </text>
      <text x="186" y="114" textAnchor="end" fill="rgba(159,182,198,.7)" fontSize="7" letterSpacing="1.6" fontFamily="IBM Plex Mono, monospace">
        EXTENSION
      </text>
    </svg>
  );
}

function MotionPath() {
  return (
    <svg viewBox="0 0 200 118" className="w-full" fill="none" aria-hidden>
      <g stroke="rgba(167,236,255,.08)">
        {[20, 40, 60, 80, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} />
        ))}
        {[40, 80, 120, 160].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="118" />
        ))}
      </g>
      <path d={TRAJ} stroke="rgba(167,236,255,.16)" strokeWidth="1.4" />
      <path d={TRAJ} pathLength={1} stroke="#a7ecff" strokeWidth="1.8" strokeLinecap="round" className="draw-loop" />
      <circle r="3.2" fill="#e6fbff">
        <animateMotion dur="7s" repeatCount="indefinite" path={TRAJ} />
      </circle>
      <circle cx="10" cy="92" r="2.6" stroke="rgba(167,236,255,.6)" />
      <circle cx="190" cy="28" r="2.6" stroke="rgba(143,240,212,.8)" />
    </svg>
  );
}

export default function Physiotherapy() {
  return (
    <section id="physiotherapy" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader index="03" label="Physiotherapy" />
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <h2 className="heading-xl">
                Movement changes <span className="text-ice-gradient font-semibold">everything.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-steel">{profile.physio.text}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {profile.physio.motifs.map((m) => (
                  <li
                    key={m}
                    className="border border-ice/20 bg-ice/[0.04] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ice"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <Reveal delay={0.1}>
                <GlassPanel corners className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="mono-label !text-ice">Range of motion</span>
                    <span className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-steel/60">Concept</span>
                  </div>
                  <div className="mt-4">
                    <RangeDial />
                  </div>
                </GlassPanel>
              </Reveal>
              <Reveal delay={0.2}>
                <GlassPanel corners className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="mono-label !text-ice">Motion path</span>
                    <span className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-steel/60">Concept</span>
                  </div>
                  <div className="mt-4">
                    <MotionPath />
                  </div>
                </GlassPanel>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
