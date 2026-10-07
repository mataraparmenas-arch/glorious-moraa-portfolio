import type { ReactNode } from "react";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import MedicalWaveform from "./MedicalWaveform";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const MONO = "IBM Plex Mono, monospace";

function GraphPanel({ title, children, note }: { title: string; children: ReactNode; note: string }) {
  return (
    <GlassPanel corners className="h-full p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="mono-label !text-ice">{title}</span>
        <span className="flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-steel/60">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
          Illustrative
        </span>
      </div>
      <div className="mt-5">{children}</div>
      <p className="mt-4 border-t border-ice/10 pt-3 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-steel/50">
        {note}
      </p>
    </GlassPanel>
  );
}

/* ----------------------------- movement trajectory ----------------------------- */
const TRAJ = "M20 140 C 70 20, 130 20, 160 90 S 240 190, 290 80 S 350 20, 380 70";
function Trajectory() {
  return (
    <svg viewBox="0 0 400 180" className="w-full" fill="none" aria-hidden>
      <g stroke="rgba(167,236,255,.07)">
        {[30, 60, 90, 120, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} />
        ))}
        {[50, 100, 150, 200, 250, 300, 350].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="180" />
        ))}
      </g>
      <path d={TRAJ} stroke="rgba(167,236,255,.14)" strokeWidth="1.5" />
      <path d={TRAJ} pathLength={1} stroke="#a7ecff" strokeWidth="2" strokeLinecap="round" className="draw-loop" style={{ ["--d" as string]: "8s" }} />
      <circle r="3.6" fill="#e6fbff">
        <animateMotion dur="8s" repeatCount="indefinite" path={TRAJ} />
      </circle>
      <circle cx="20" cy="140" r="3" stroke="rgba(167,236,255,.6)" />
      <circle cx="380" cy="70" r="3" stroke="rgba(143,240,212,.85)" />
    </svg>
  );
}

/* ------------------------------ mobility radar ------------------------------ */
const CX = 150;
const CY = 98;
const R = 66;
const AXES = ["Shoulder", "Elbow", "Hip", "Knee", "Ankle"];
const pt = (i: number, v: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [CX + Math.cos(a) * R * v, CY + Math.sin(a) * R * v] as const;
};
const poly = (vals: number[]) =>
  vals
    .map((v, i) => {
      const [x, y] = pt(i, v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
const S0 = [0.55, 0.7, 0.5, 0.8, 0.6];
const S1 = [0.85, 0.5, 0.78, 0.55, 0.88];
const S2 = [0.62, 0.88, 0.62, 0.72, 0.5];

function Radar() {
  return (
    <svg viewBox="0 0 300 196" className="w-full" fill="none" aria-hidden>
      {[0.33, 0.66, 1].map((k) => (
        <polygon key={k} points={poly([k, k, k, k, k])} stroke="rgba(167,236,255,.16)" />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(167,236,255,.14)" />;
      })}
      <polygon points={poly(S0)} fill="rgba(167,236,255,.12)" stroke="#a7ecff" strokeWidth="1.4">
        <animate
          attributeName="points"
          dur="10s"
          repeatCount="indefinite"
          values={[poly(S0), poly(S1), poly(S2), poly(S0)].join(";")}
          keyTimes="0;0.33;0.66;1"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
        />
      </polygon>
      {AXES.map((label, i) => {
        const [x, y] = pt(i, 1.2);
        const anchor = x < CX - 6 ? "end" : x > CX + 6 ? "start" : "middle";
        return (
          <text
            key={label}
            x={x}
            y={y + 3}
            textAnchor={anchor}
            fill="rgba(159,182,198,.85)"
            fontSize="8"
            letterSpacing="1.8"
            fontFamily={MONO}
          >
            {label.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

/* ----------------------------- recovery pathway ----------------------------- */
const REC = "M30 125 C 110 125, 130 80, 200 78 C 270 76, 290 35, 370 32";
function Recovery() {
  const label = { fill: "rgba(234,247,252,.9)", fontSize: 8.5, letterSpacing: 2, fontFamily: MONO } as const;
  return (
    <svg viewBox="0 0 400 168" className="w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id="rec-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#a7ecff" />
          <stop offset="1" stopColor="#8ff0d4" />
        </linearGradient>
      </defs>
      <path d={REC} stroke="rgba(167,236,255,.14)" strokeWidth="1.5" />
      <path d={REC} pathLength={1} stroke="url(#rec-g)" strokeWidth="2" strokeLinecap="round" className="draw-loop" style={{ ["--d" as string]: "9s" }} />
      {[
        [30, 125],
        [200, 78],
        [370, 32],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="9" stroke="rgba(167,236,255,.45)" />
          <circle cx={x} cy={y} r="3" fill="#e6fbff" />
        </g>
      ))}
      <circle r="3.6" fill="#ffffff">
        <animateMotion dur="9s" repeatCount="indefinite" path={REC} />
      </circle>
      <text x="30" y="152" {...label}>CARE</text>
      <text x="200" y="106" textAnchor="middle" {...label}>MOVEMENT</text>
      <text x="370" y="62" textAnchor="end" {...label}>FUNCTION</text>
    </svg>
  );
}

export default function AnalysisGraphs() {
  return (
    <section id="analysis" className="relative py-24 md:py-32">
      <Container>
        <SectionHeader index="06" label="Analysis workstation" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="heading-lg">
                Movement, <span className="text-ice-gradient font-semibold">visualized.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <p className="max-w-md text-[1rem] leading-relaxed text-steel">
                A physiotherapy-style analysis workstation, reimagined as visual storytelling. These graphs illustrate
                ideas — they are not measurements, results or clinical data.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal>
            <GraphPanel title="Movement trajectory" note="A line that continuously draws itself">
              <Trajectory />
            </GraphPanel>
          </Reveal>
          <Reveal delay={0.1}>
            <GraphPanel title="Mobility visualization" note="Radial diagram · expanding and contracting">
              <Radar />
            </GraphPanel>
          </Reveal>
          <Reveal>
            <GraphPanel title="Recovery pathway" note="Care → movement → function">
              <Recovery />
            </GraphPanel>
          </Reveal>
          <Reveal delay={0.1}>
            <GraphPanel title="Motion graph" note="Continuously animated waveform">
              <MedicalWaveform variant="motion" height={168} speed={1} />
            </GraphPanel>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
