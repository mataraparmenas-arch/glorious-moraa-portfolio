/**
 * Scene keyframes: how the continuous 3D environment is composed in each
 * section of the page. Positions are expressed in NDC (-1..1) and as a fraction
 * of viewport height so the composition is resolution independent.
 */

export const SECTION_IDS = [
  "home",
  "about",
  "care",
  "physiotherapy",
  "expertise",
  "movement",
  "analysis",
  "rehab",
  "journey",
  "cv",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface KF {
  x: number; // figure centre, NDC x
  y: number; // figure centre, NDC y
  h: number; // figure height as a fraction of viewport height
  a: number; // figure intensity 0..1
  amp: number; // idle movement amplitude
  move: number; // 0 = idle demonstration, 1 = scroll-driven movement lab
  trail: number; // motion trail intensity
  scan: number; // scan beam intensity
  warm: number; // 0 = clinical cool, 1 = warm / human
  yaw: number; // base rotation
  swing: number; // rotation oscillation amplitude
  env: number; // gantry ring intensity
}

const base: KF = {
  x: 0,
  y: 0,
  h: 0.7,
  a: 0.5,
  amp: 0.2,
  move: 0,
  trail: 0,
  scan: 0.6,
  warm: 0,
  yaw: 0,
  swing: 0.3,
  env: 1,
};

const kf = (o: Partial<KF>): KF => ({ ...base, ...o });

export const KF_KEYS = Object.keys(base) as (keyof KF)[];
export const makeKF = (k: KF): KF => ({ ...k });

export function lerpKF(a: KF, b: KF, t: number, out: KF): KF {
  for (const k of KF_KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

export const DESKTOP_KF: Record<SectionId, KF> = {
  home: kf({ x: 0.2, y: -0.04, h: 0.74, a: 1, amp: 0.35, scan: 1, swing: 0.9 }),
  about: kf({ x: 0.6, y: -0.02, h: 0.66, a: 0.6, amp: 0.25, scan: 0.6, yaw: -0.4, swing: 0.35, env: 0.8 }),
  care: kf({ x: -0.58, y: 0, h: 0.62, a: 0.5, amp: 0.12, scan: 0.5, yaw: 0.5, swing: 0.3, env: 0.7 }),
  physiotherapy: kf({ x: 0.56, y: -0.02, h: 0.72, a: 0.9, amp: 1, trail: 0.7, scan: 0.6, yaw: -0.3, swing: 0.4, env: 0.9 }),
  expertise: kf({ x: 0, y: 0, h: 0.95, a: 0.1, amp: 0.1, scan: 0.3, swing: 0.2, env: 0.6 }),
  movement: kf({ x: 0, y: -0.03, h: 0.72, a: 1, amp: 0, move: 1, trail: 1, scan: 0.5, yaw: 0.1, swing: 0.08, env: 0.9 }),
  analysis: kf({ x: -0.62, y: 0, h: 0.62, a: 0.3, amp: 0.8, trail: 0.45, scan: 0.3, yaw: 0.4, swing: 0.3, env: 0.6 }),
  rehab: kf({ x: 0, y: 0, h: 0.8, a: 0, amp: 0.3, scan: 0.2, env: 0.8 }),
  journey: kf({ x: 0.74, y: 0, h: 0.8, a: 0.13, amp: 0.1, scan: 0.6, yaw: -0.3, swing: 0.3, env: 0.6 }),
  cv: kf({ x: -0.7, y: 0, h: 0.7, a: 0.15, amp: 0.1, scan: 0.3, yaw: 0.4, swing: 0.3, env: 0.5 }),
  contact: kf({ x: 0, y: -0.05, h: 0.85, a: 0.2, amp: 0.08, scan: 0.15, warm: 1, swing: 0.25, env: 0.45 }),
};

/** Portrait / mobile composition: reduced, lightweight, centred. */
export const PORTRAIT_KF: Record<SectionId, KF> = {
  home: kf({ x: 0, y: 0.34, h: 0.38, a: 1, amp: 0.35, scan: 1, swing: 0.9 }),
  about: kf({ x: 0.3, y: 0.1, h: 0.7, a: 0.12, amp: 0.2, scan: 0.4, yaw: -0.4, env: 0.6 }),
  care: kf({ x: -0.3, y: 0.1, h: 0.7, a: 0.12, amp: 0.1, scan: 0.4, yaw: 0.5, env: 0.5 }),
  physiotherapy: kf({ x: 0.25, y: 0, h: 0.7, a: 0.2, amp: 1, trail: 0.4, scan: 0.4, yaw: -0.3, env: 0.6 }),
  expertise: kf({ x: 0, y: 0, h: 0.9, a: 0.07, amp: 0.1, scan: 0.2, env: 0.4 }),
  movement: kf({ x: 0, y: 0.04, h: 0.5, a: 1, amp: 0, move: 1, trail: 1, scan: 0.45, yaw: 0.1, swing: 0.06, env: 0.7 }),
  analysis: kf({ x: -0.3, y: 0, h: 0.6, a: 0.1, amp: 0.8, trail: 0.2, scan: 0.2, env: 0.4 }),
  rehab: kf({ x: 0, y: 0, h: 0.7, a: 0, amp: 0.3, scan: 0.2, env: 0.5 }),
  journey: kf({ x: 0.3, y: 0, h: 0.8, a: 0.08, amp: 0.1, scan: 0.4, env: 0.4 }),
  cv: kf({ x: -0.3, y: 0, h: 0.7, a: 0.08, amp: 0.1, scan: 0.2, env: 0.4 }),
  contact: kf({ x: 0, y: -0.1, h: 0.8, a: 0.12, amp: 0.08, scan: 0.1, warm: 1, swing: 0.2, env: 0.3 }),
};
