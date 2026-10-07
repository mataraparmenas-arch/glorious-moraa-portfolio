import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Joint model                                                               */
/* -------------------------------------------------------------------------- */
export const JOINTS = [
  "pelvis",
  "spineMid",
  "chest",
  "neck",
  "headTop",
  "shoulderL",
  "shoulderR",
  "elbowL",
  "elbowR",
  "wristL",
  "wristR",
  "handL",
  "handR",
  "hipL",
  "hipR",
  "kneeL",
  "kneeR",
  "ankleL",
  "ankleR",
  "toeL",
  "toeR",
] as const;
export type JointName = (typeof JOINTS)[number];
export const JI = {} as Record<JointName, number>;
JOINTS.forEach((j, i) => {
  JI[j] = i;
});

export interface Limb {
  abd: number; // shoulder abduction (arms) — radians
  flex: number; // shoulder flexion
  elbow: number; // elbow flexion
  hip: number; // hip flexion
  knee: number; // knee flexion
  ankle: number; // plantar flexion
  hipAbd: number; // hip abduction
}
export interface Pose {
  L: Limb;
  R: Limb;
  lean: number;
  breath: number;
}

const newLimb = (): Limb => ({ abd: 0.14, flex: 0, elbow: 0.14, hip: 0, knee: 0.03, ankle: 0, hipAbd: 0.04 });
export const newPose = (): Pose => ({ L: newLimb(), R: newLimb(), lean: 0, breath: 0.5 });
const LIMB_KEYS = ["abd", "flex", "elbow", "hip", "knee", "ankle", "hipAbd"] as const;

export function mixPose(a: Pose, b: Pose, t: number, out: Pose) {
  for (const side of ["L", "R"] as const) {
    for (const k of LIMB_KEYS) out[side][k] = a[side][k] + (b[side][k] - a[side][k]) * t;
  }
  out.lean = a.lean + (b.lean - a.lean) * t;
  out.breath = a.breath + (b.breath - a.breath) * t;
}

/* -------------------------------------------------------------------------- */
/*  Forward kinematics                                                        */
/* -------------------------------------------------------------------------- */
type QKey = "trunk" | "armU" | "armF" | "thigh" | "shin" | "foot";
export interface Solved {
  pos: THREE.Vector3[];
  q: Record<QKey, THREE.Quaternion[]>;
}
export function newSolved(): Solved {
  const mk = (n: number) => Array.from({ length: n }, () => new THREE.Quaternion());
  return {
    pos: JOINTS.map(() => new THREE.Vector3()),
    q: { trunk: mk(1), armU: mk(2), armF: mk(2), thigh: mk(2), shin: mk(2), foot: mk(2) },
  };
}

const AX = new THREE.Vector3(1, 0, 0);
const AZ = new THREE.Vector3(0, 0, 1);
const DOWN = new THREE.Vector3(0, -1, 0);
const FOOT = new THREE.Vector3(0, -0.1, 0.26);
const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();
const tv = new THREE.Vector3();
const REST_ANKLE_Y = -0.05 - 0.78 - 0.76;

const LEN = { upper: 0.52, fore: 0.46, hand: 0.18, thigh: 0.78, shin: 0.76 };

export function solve(p: Pose, S: Solved) {
  const { pos, q } = S;
  q.trunk[0].setFromAxisAngle(AX, p.lean);

  const hipI = [JI.hipL, JI.hipR];
  const kneeI = [JI.kneeL, JI.kneeR];
  const ankleI = [JI.ankleL, JI.ankleR];
  const toeI = [JI.toeL, JI.toeR];

  let minY = Infinity;
  let zSum = 0;
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const L = i === 0 ? p.L : p.R;
    q.thigh[i].setFromAxisAngle(AZ, s * L.hipAbd).multiply(qb.setFromAxisAngle(AX, -L.hip));
    q.shin[i].copy(q.thigh[i]).multiply(qb.setFromAxisAngle(AX, L.knee));
    q.foot[i].copy(q.shin[i]).multiply(qb.setFromAxisAngle(AX, L.ankle));

    const hip = pos[hipI[i]].set(s * 0.17, -0.05, 0);
    tv.copy(DOWN).applyQuaternion(q.thigh[i]).multiplyScalar(LEN.thigh);
    const knee = pos[kneeI[i]].copy(tv).add(hip);
    tv.copy(DOWN).applyQuaternion(q.shin[i]).multiplyScalar(LEN.shin);
    const ankle = pos[ankleI[i]].copy(tv).add(knee);
    tv.copy(FOOT).applyQuaternion(q.foot[i]);
    pos[toeI[i]].copy(tv).add(ankle);

    minY = Math.min(minY, ankle.y);
    zSum += ankle.z;
  }

  const lift = Math.max(p.L.ankle, p.R.ankle, 0) * 0.22;
  const rootY = REST_ANKLE_Y - minY + lift;
  const rootZ = -zSum / 2;
  for (let i = 0; i < 2; i++) {
    for (const idx of [hipI[i], kneeI[i], ankleI[i], toeI[i]]) {
      pos[idx].y += rootY;
      pos[idx].z += rootZ;
    }
  }
  pos[JI.pelvis].set(0, rootY, rootZ);

  const qt = q.trunk[0];
  const upper = (idx: number, x: number, y: number, z: number) => {
    pos[idx].set(x, y, z).applyQuaternion(qt);
    pos[idx].y += rootY;
    pos[idx].z += rootZ;
  };
  upper(JI.spineMid, 0, 0.42, 0);
  upper(JI.chest, 0, 0.85, 0);
  upper(JI.neck, 0, 1.0, 0);
  upper(JI.headTop, 0, 1.5, 0);
  upper(JI.shoulderL, 0.37, 0.9, 0);
  upper(JI.shoulderR, -0.37, 0.9, 0);

  const shI = [JI.shoulderL, JI.shoulderR];
  const elI = [JI.elbowL, JI.elbowR];
  const wrI = [JI.wristL, JI.wristR];
  const haI = [JI.handL, JI.handR];
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const A = i === 0 ? p.L : p.R;
    q.armU[i]
      .copy(qt)
      .multiply(qa.setFromAxisAngle(AZ, s * A.abd))
      .multiply(qb.setFromAxisAngle(AX, -A.flex));
    q.armF[i].copy(q.armU[i]).multiply(qa.setFromAxisAngle(AZ, s * A.elbow));

    tv.copy(DOWN).applyQuaternion(q.armU[i]).multiplyScalar(LEN.upper);
    const elbow = pos[elI[i]].copy(tv).add(pos[shI[i]]);
    tv.copy(DOWN).applyQuaternion(q.armF[i]).multiplyScalar(LEN.fore);
    const wrist = pos[wrI[i]].copy(tv).add(elbow);
    tv.copy(DOWN).applyQuaternion(q.armF[i]).multiplyScalar(LEN.hand);
    pos[haI[i]].copy(tv).add(wrist);
  }
}

/* -------------------------------------------------------------------------- */
/*  Anatomical contour model                                                  */
/* -------------------------------------------------------------------------- */
interface BoneDef {
  a: JointName;
  b: JointName;
  ia: number;
  ib: number;
  ra: number;
  rb: number;
  rings: number;
  seg: number;
  qk: QKey;
  qi: 0 | 1;
  sphere?: boolean;
  ell?: [number, number];
  torso?: boolean;
  ax?: "x";
}
const B = (d: Omit<BoneDef, "ia" | "ib">): BoneDef => ({ ...d, ia: JI[d.a], ib: JI[d.b] });

export const BONES: BoneDef[] = [
  B({ a: "pelvis", b: "spineMid", ra: 0.22, rb: 0.2, rings: 4, seg: 12, qk: "trunk", qi: 0, ell: [1.3, 0.75], torso: true }),
  B({ a: "spineMid", b: "chest", ra: 0.2, rb: 0.26, rings: 4, seg: 12, qk: "trunk", qi: 0, ell: [1.3, 0.75], torso: true }),
  B({ a: "chest", b: "neck", ra: 0.1, rb: 0.085, rings: 2, seg: 8, qk: "trunk", qi: 0 }),
  B({ a: "neck", b: "headTop", ra: 0.2, rb: 0.2, rings: 7, seg: 10, qk: "trunk", qi: 0, sphere: true, ell: [0.95, 1.05] }),
  B({ a: "shoulderR", b: "shoulderL", ra: 0.07, rb: 0.07, rings: 5, seg: 6, qk: "trunk", qi: 0, ax: "x" }),
];
(
  [
    ["L", 0],
    ["R", 1],
  ] as const
).forEach(([s, i]) => {
  const j = (n: string) => `${n}${s}` as JointName;
  BONES.push(
    B({ a: j("shoulder"), b: j("elbow"), ra: 0.085, rb: 0.07, rings: 4, seg: 8, qk: "armU", qi: i }),
    B({ a: j("elbow"), b: j("wrist"), ra: 0.065, rb: 0.045, rings: 4, seg: 8, qk: "armF", qi: i }),
    B({ a: j("wrist"), b: j("hand"), ra: 0.045, rb: 0.03, rings: 2, seg: 6, qk: "armF", qi: i }),
    B({ a: j("hip"), b: j("knee"), ra: 0.13, rb: 0.09, rings: 5, seg: 8, qk: "thigh", qi: i }),
    B({ a: j("knee"), b: j("ankle"), ra: 0.09, rb: 0.055, rings: 5, seg: 8, qk: "shin", qi: i }),
    B({ a: j("ankle"), b: j("toe"), ra: 0.055, rb: 0.03, rings: 2, seg: 6, qk: "foot", qi: i }),
  );
});

export const SK_PAIRS: [JointName, JointName][] = [
  ["pelvis", "spineMid"],
  ["spineMid", "chest"],
  ["chest", "neck"],
  ["neck", "headTop"],
  ["chest", "shoulderL"],
  ["chest", "shoulderR"],
  ["shoulderL", "elbowL"],
  ["elbowL", "wristL"],
  ["wristL", "handL"],
  ["shoulderR", "elbowR"],
  ["elbowR", "wristR"],
  ["wristR", "handR"],
  ["pelvis", "hipL"],
  ["pelvis", "hipR"],
  ["hipL", "kneeL"],
  ["kneeL", "ankleL"],
  ["ankleL", "toeL"],
  ["hipR", "kneeR"],
  ["kneeR", "ankleR"],
  ["ankleR", "toeR"],
];

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const radiusAt = (b: BoneDef, t: number) =>
  b.sphere ? b.ra * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.8) : b.ra + (b.rb - b.ra) * t;

function localOff(b: BoneDef, ang: number, rMul: number, R: number, zOff: number): [number, number, number] {
  const ex = b.ell?.[0] ?? 1;
  const ez = b.ell?.[1] ?? 1;
  const c = Math.cos(ang) * ex * R * rMul;
  const s = Math.sin(ang) * ez * R * rMul + zOff;
  return b.ax === "x" ? [0, c, s] : [c, 0, s];
}

export interface Figure {
  count: number;
  surfaceCount: number;
  bone: Uint8Array;
  t: Float32Array;
  off: Float32Array;
  positions: Float32Array;
  size: Float32Array;
  seed: Float32Array;
  kind: Float32Array;
  lineIndex: Uint16Array;
}

export function buildFigure(tissue: number): Figure {
  const rand = mulberry32(7);
  interface V {
    bone: number;
    t: number;
    off: [number, number, number];
    size: number;
    kind: number;
  }
  const vs: V[] = [];
  const lines: number[] = [];

  BONES.forEach((b, bi) => {
    const grid: number[][] = [];
    for (let i = 0; i < b.rings; i++) {
      const t = b.sphere ? (i + 1) / (b.rings + 1) : b.rings === 1 ? 0.5 : i / (b.rings - 1);
      const row: number[] = [];
      for (let j = 0; j < b.seg; j++) {
        const ang = (j / b.seg) * Math.PI * 2;
        row.push(vs.length);
        vs.push({ bone: bi, t, off: localOff(b, ang, 1, radiusAt(b, t), 0), size: 3.1, kind: 1 });
      }
      grid.push(row);
    }
    grid.forEach((row, i) =>
      row.forEach((v, j) => {
        lines.push(v, row[(j + 1) % row.length]);
        if (i < grid.length - 1 && j % 2 === 0) lines.push(v, grid[i + 1][j]);
      }),
    );
  });
  const surfaceCount = vs.length;

  // rest pose for volume weights
  const S0 = newSolved();
  solve(newPose(), S0);
  const weights = BONES.map((b) => {
    const len = S0.pos[b.ia].distanceTo(S0.pos[b.ib]);
    const r = (b.ra + b.rb) / 2;
    return len * r * r * (b.ell ? b.ell[0] * b.ell[1] : 1);
  });
  const total = weights.reduce((a, b) => a + b, 0);

  // deep tissue cloud
  for (let k = 0; k < tissue; k++) {
    let pick = rand() * total;
    let bi = 0;
    for (; bi < weights.length - 1; bi++) {
      pick -= weights[bi];
      if (pick <= 0) break;
    }
    const b = BONES[bi];
    const t = rand();
    const ang = rand() * Math.PI * 2;
    vs.push({
      bone: bi,
      t,
      off: localOff(b, ang, 0.25 + 0.85 * rand(), radiusAt(b, t), 0),
      size: 1.7 + rand() * 1.4,
      kind: 0,
    });
  }

  // vertebrae — a brighter detail that the scan reveals
  [0, 1].forEach((bi) => {
    for (let k = 0; k < 7; k++) {
      vs.push({ bone: bi, t: (k + 0.5) / 7, off: [0, 0, -0.06], size: 4.2, kind: 2 });
    }
  });
  [0.3, 0.75].forEach((t) => vs.push({ bone: 2, t, off: [0, 0, -0.04], size: 3.6, kind: 2 }));

  const N = vs.length;
  const fig: Figure = {
    count: N,
    surfaceCount,
    bone: new Uint8Array(N),
    t: new Float32Array(N),
    off: new Float32Array(N * 3),
    positions: new Float32Array(N * 3),
    size: new Float32Array(N),
    seed: new Float32Array(N),
    kind: new Float32Array(N),
    lineIndex: new Uint16Array(lines),
  };
  vs.forEach((v, i) => {
    fig.bone[i] = v.bone;
    fig.t[i] = v.t;
    fig.off[i * 3] = v.off[0];
    fig.off[i * 3 + 1] = v.off[1];
    fig.off[i * 3 + 2] = v.off[2];
    fig.size[i] = v.size;
    fig.seed[i] = rand();
    fig.kind[i] = v.kind;
  });
  updateVertices(fig, S0, 0.5, fig.positions);
  return fig;
}

const tmp = new THREE.Vector3();
export function updateVertices(F: Figure, S: Solved, breath: number, out: Float32Array) {
  const f = 1 + 0.028 * breath;
  for (let i = 0; i < F.count; i++) {
    const b = BONES[F.bone[i]];
    const A = S.pos[b.ia];
    const Bp = S.pos[b.ib];
    const t = F.t[i];
    const k = b.torso ? f : 1;
    tmp.set(F.off[i * 3] * k, F.off[i * 3 + 1] * k, F.off[i * 3 + 2] * k).applyQuaternion(S.q[b.qk][b.qi]);
    const o = i * 3;
    out[o] = A.x + (Bp.x - A.x) * t + tmp.x;
    out[o + 1] = A.y + (Bp.y - A.y) * t + tmp.y;
    out[o + 2] = A.z + (Bp.z - A.z) * t + tmp.z;
  }
}

export function updateSkeleton(S: Solved, out: Float32Array) {
  for (let k = 0; k < SK_PAIRS.length; k++) {
    const a = S.pos[JI[SK_PAIRS[k][0]]];
    const b = S.pos[JI[SK_PAIRS[k][1]]];
    const o = k * 6;
    out[o] = a.x;
    out[o + 1] = a.y;
    out[o + 2] = a.z;
    out[o + 3] = b.x;
    out[o + 4] = b.y;
    out[o + 5] = b.z;
  }
}

export function updateMarkers(S: Solved, out: Float32Array) {
  for (let i = 0; i < JOINTS.length; i++) {
    const p = S.pos[i];
    out[i * 3] = p.x;
    out[i * 3 + 1] = p.y;
    out[i * 3 + 2] = p.z;
  }
}
