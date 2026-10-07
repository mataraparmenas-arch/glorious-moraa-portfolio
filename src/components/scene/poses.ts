import { newPose, type Pose } from "./skeleton";

export const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Gentle ambient demonstration — used outside the Movement Lab. */
export function idlePose(t: number, amp: number, o: Pose) {
  const w = 0.5 + 0.5 * Math.sin(t * 0.55);
  const w2 = 0.5 + 0.5 * Math.sin(t * 0.55 + 0.8);
  const sides = [
    [o.L, w],
    [o.R, w2],
  ] as const;
  for (const [L, ww] of sides) {
    L.abd = 0.14 + ww * 0.9 * amp + 0.025 * Math.sin(t * 0.9);
    L.flex = 0.05 * Math.sin(t * 0.7 + ww);
    L.elbow = 0.14 + ww * 0.75 * amp;
    L.hip = 0.16 * amp * ww;
    L.knee = 0.03 + 0.34 * amp * ww;
    L.ankle = 0;
    L.hipAbd = 0.04 + 0.07 * amp * ww;
  }
  o.lean = 0.02 * Math.sin(t * 0.5);
  o.breath = 0.5 + 0.5 * Math.sin(t * 1.25);
}

/**
 * Scroll-driven movement sequence (m: 0..1).
 *  A 0.00–0.25  shoulder abduction through an overhead arc
 *  B 0.25–0.50  elbow flexion at shoulder height
 *  C 0.50–0.75  controlled hip + knee flexion
 *  D 0.75–1.00  ankle heel-raise
 */
export function labPose(m: number, o: Pose) {
  const up = sstep(0, 0.13, m);
  const d1 = sstep(0.13, 0.25, m);
  const d2 = sstep(0.44, 0.5, m);
  const abd = 0.14 + 2.16 * up - 0.75 * d1 - 1.41 * d2;
  const elb = 0.14 + 1.5 * (sstep(0.27, 0.37, m) - sstep(0.4, 0.48, m));
  const sq = sstep(0.5, 0.6, m) - sstep(0.66, 0.76, m);
  const ank = sstep(0.78, 0.86, m) - sstep(0.9, 0.97, m);
  for (const L of [o.L, o.R]) {
    L.abd = abd;
    L.flex = 0;
    L.elbow = elb;
    L.hip = 1.0 * sq;
    L.knee = 0.03 + 1.7 * sq;
    L.ankle = 0.6 * ank;
    L.hipAbd = 0.04;
  }
  o.lean = 0.5 * sq;
  o.breath = 0.5;
}

/** Rotation of the figure through the lab so side-on movements read clearly. */
export function labYaw(m: number) {
  return 0.05 + 0.75 * (sstep(0.46, 0.56, m) - sstep(0.94, 1.0, m));
}

/** Weights of the four lab phases (A..D) for highlighting joints. */
export function phaseWeights(m: number, out: number[]) {
  const a = 1 - sstep(0.2, 0.28, m);
  const b = sstep(0.2, 0.28, m) * (1 - sstep(0.45, 0.53, m));
  const c = sstep(0.45, 0.53, m) * (1 - sstep(0.7, 0.78, m));
  const d = sstep(0.7, 0.78, m);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
}

export const makePose = newPose;
