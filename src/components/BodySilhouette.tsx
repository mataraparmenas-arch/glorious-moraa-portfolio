/**
 * 2D anatomical silhouette layers. Used by the Rehabilitation body-scan and as
 * the graceful fallback when WebGL is unavailable. Coordinates: 520 × 520.
 */

const J = {
  head: [260, 42],
  neck: [260, 88],
  shL: [216, 100],
  shR: [304, 100],
  chest: [260, 112],
  spine: [260, 172],
  pelvis: [260, 236],
  elL: [198, 168],
  elR: [322, 168],
  wrL: [186, 226],
  wrR: [334, 226],
  haL: [182, 252],
  haR: [338, 252],
  hipL: [240, 242],
  hipR: [280, 242],
  knL: [236, 364],
  knR: [284, 364],
  anL: [232, 470],
  anR: [288, 470],
  toL: [222, 492],
  toR: [298, 492],
} as const;
type JK = keyof typeof J;

const PAIRS: [JK, JK][] = [
  ["head", "neck"],
  ["neck", "chest"],
  ["chest", "spine"],
  ["spine", "pelvis"],
  ["chest", "shL"],
  ["chest", "shR"],
  ["shL", "elL"],
  ["elL", "wrL"],
  ["wrL", "haL"],
  ["shR", "elR"],
  ["elR", "wrR"],
  ["wrR", "haR"],
  ["pelvis", "hipL"],
  ["pelvis", "hipR"],
  ["hipL", "knL"],
  ["knL", "anL"],
  ["anL", "toL"],
  ["hipR", "knR"],
  ["knR", "anR"],
  ["anR", "toR"],
];

const BIG_JOINTS: JK[] = ["shL", "shR", "elL", "elR", "hipL", "hipR", "knL", "knR", "anL", "anR"];
const SMALL_JOINTS: JK[] = ["head", "neck", "chest", "spine", "pelvis", "wrL", "wrR", "haL", "haR", "toL", "toR"];

const torsoSlices = Array.from({ length: 11 }, (_, i) => {
  const y = 102 + i * 13.5;
  return { cx: 260, cy: y, rx: 44 - 12 * Math.sin((Math.PI * (y - 100)) / 150), ry: 6 };
});

const legSlices = Array.from({ length: 10 }, (_, i) => {
  const y = 268 + i * 21;
  const upper = y < 364;
  const x = upper ? 240 - (4 * (y - 242)) / 122 : 236 - (4 * (y - 364)) / 106;
  const rx = upper ? 16 - (5 * (y - 242)) / 122 : 11 - (4 * (y - 364)) / 106;
  return { y, x, rx };
});

const VECTORS: [number, number, number, number][] = [
  [198, 168, 150, 128],
  [322, 168, 370, 128],
  [186, 226, 140, 212],
  [334, 226, 380, 212],
  [236, 364, 196, 350],
  [284, 364, 324, 350],
  [232, 470, 196, 486],
  [288, 470, 324, 486],
];

const FLOW_SRC: [number, number][] = [
  [260, 112],
  [216, 100],
  [304, 100],
  [198, 168],
  [322, 168],
  [260, 236],
  [236, 364],
  [284, 364],
  [232, 470],
  [288, 470],
  [186, 226],
  [334, 226],
];
const FLOW = Array.from({ length: 18 }, (_, k) => {
  const [sx, sy] = FLOW_SRC[k % FLOW_SRC.length];
  const dir = k % 2 ? 1 : -1;
  const ex = dir > 0 ? 520 : 0;
  const ey = 40 + ((k * 53) % 440);
  const c1x = sx + dir * (60 + ((k * 17) % 50));
  const c1y = sy - 40 + ((k * 29) % 80);
  const c2x = ex - dir * (140 + ((k * 11) % 60));
  const c2y = ey + ((k * 37) % 90) - 45;
  return `M${sx} ${sy} C${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`;
});

const TORSO = "M214 94 Q260 84 306 94 L300 152 Q292 202 282 246 L238 246 Q228 202 220 152 Z";

export function BodyGhost({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 520" fill="none" className={className} aria-hidden>
      <g stroke="rgba(167,236,255,0.09)" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="216,100 198,168 186,226 182,252" strokeWidth="16" />
        <polyline points="304,100 322,168 334,226 338,252" strokeWidth="16" />
        <polyline points="240,242 236,364" strokeWidth="28" />
        <polyline points="280,242 284,364" strokeWidth="28" />
        <polyline points="236,364 232,470" strokeWidth="19" />
        <polyline points="284,364 288,470" strokeWidth="19" />
        <polyline points="232,470 222,492" strokeWidth="12" />
        <polyline points="288,470 298,492" strokeWidth="12" />
      </g>
      <path d={TORSO} fill="rgba(167,236,255,0.045)" stroke="rgba(167,236,255,0.3)" strokeWidth="1" />
      <circle cx="260" cy="42" r="22" fill="rgba(167,236,255,0.05)" stroke="rgba(167,236,255,0.3)" strokeWidth="1" />
      <path d="M252 62 L252 90 M268 62 L268 90" stroke="rgba(167,236,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

export function BodyReveal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 520" fill="none" className={className} aria-hidden>
      <defs>
        <marker id="bs-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#8ff0d4" strokeWidth="1" />
        </marker>
      </defs>
      <g stroke="rgba(167,236,255,0.34)" strokeWidth="0.8">
        {torsoSlices.map((s) => (
          <ellipse key={s.cy} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />
        ))}
        {legSlices.map((s) => (
          <g key={s.y}>
            <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={3.6} />
            <ellipse cx={520 - s.x} cy={s.y} rx={s.rx} ry={3.6} />
          </g>
        ))}
      </g>
      <g stroke="rgba(200,247,255,0.85)" strokeWidth="1.2" strokeLinecap="round">
        {PAIRS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={J[a][0]} y1={J[a][1]} x2={J[b][0]} y2={J[b][1]} />
        ))}
      </g>
      <g stroke="rgba(143,240,212,0.8)" strokeWidth="1" markerEnd="url(#bs-arrow)">
        {VECTORS.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#bs-arrow)" />
        ))}
      </g>
      {BIG_JOINTS.map((k) => (
        <g key={k}>
          <circle cx={J[k][0]} cy={J[k][1]} r="9" stroke="rgba(167,236,255,0.75)" strokeWidth="1" />
          <circle cx={J[k][0]} cy={J[k][1]} r="2.6" fill="#e6fbff" />
        </g>
      ))}
      {SMALL_JOINTS.map((k) => (
        <circle key={k} cx={J[k][0]} cy={J[k][1]} r="2.2" fill="#bff3ff" />
      ))}
    </svg>
  );
}

export function BodyFlow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 520" fill="none" className={className} aria-hidden style={{ overflow: "visible" }}>
      <g stroke="rgba(167,236,255,0.28)" strokeWidth="0.8">
        {FLOW.map((d, i) => (
          <path key={`s-${i}`} d={d} />
        ))}
      </g>
      <g stroke="rgba(190,244,255,0.85)" strokeWidth="1.1" strokeDasharray="5 11" strokeLinecap="round">
        {FLOW.map((d, i) => (
          <path key={`d-${i}`} d={d} className="dash-flow" style={{ animationDuration: `${4 + (i % 5)}s` }} />
        ))}
      </g>
    </svg>
  );
}
