export const CAM_Y = 1.6;
export const CAM_Z = 8;
export const FOV = 40;

/** Height of the anatomical figure in local units, and its vertical centre. */
export const FIG_H = 3.2;
export const FIG_CY = -0.095;

export type Detail = 0 | 1 | 2;

export const TISSUE: Record<Detail, number> = { 0: 140, 1: 380, 2: 900 };
export const PARTICLES: Record<Detail, number> = { 0: 34, 1: 80, 2: 170 };
export const DPR_MAX: Record<Detail, number> = { 0: 1, 1: 1.5, 2: 1.75 };

export function viewMetrics(aspect: number) {
  const dist = Math.hypot(CAM_Y, CAM_Z);
  const visH = 2 * dist * Math.tan((FOV * Math.PI) / 360);
  const cosP = CAM_Z / dist;
  return { visH, visW: visH * aspect, cosP };
}

export function computeDetail(): Detail {
  if (typeof window === "undefined") return 1;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  if (mem <= 2 || cores <= 2) return 0;
  if (coarse || narrow || mem <= 4) return 1;
  return 2;
}
