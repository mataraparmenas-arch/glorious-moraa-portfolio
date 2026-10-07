import { useEffect, useSyncExternalStore } from "react";
import { DESKTOP_KF, PORTRAIT_KF, SECTION_IDS, lerpKF, makeKF, type SectionId } from "./keyframes";

export interface JointScreen {
  x: number;
  y: number;
}

/**
 * Mutable, non-reactive "world" state shared between the DOM and the WebGL
 * scene. It is intentionally not React state: it changes every frame.
 */
export const world = {
  px: 0,
  py: 0,
  pxs: 0,
  pys: 0,
  pointerOn: false,
  scrollY: 0,
  vw: 1280,
  vh: 800,
  lab: 0,
  travel: 0,
  warmS: 0,
  kf: makeKF(DESKTOP_KF.home),
  reduced: false,
  lowPower: false,
  portrait: false,
  joints: {} as Record<string, JointScreen>,
  invalidate: null as null | (() => void),
};

/* ---------------------------- active section store ---------------------------- */
let activeId: SectionId = "home";
const listeners = new Set<() => void>();
const activeStore = {
  get: () => activeId,
  set: (id: SectionId) => {
    if (id !== activeId) {
      activeId = id;
      listeners.forEach((l) => l());
    }
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

export function useActiveSection(): SectionId {
  return useSyncExternalStore(activeStore.subscribe, activeStore.get, activeStore.get);
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Tracks scroll, pointer and viewport, and converts them into scene targets.
 * Mount once at the application root.
 */
export function useWorldTracker() {
  useEffect(() => {
    const n = SECTION_IDS.length;
    const tops: number[] = new Array(n).fill(0);
    const ends: number[] = new Array(n).fill(1);
    let labTop = 0;
    let labH = 1;
    let raf = 0;
    let measureQueued = false;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    world.reduced = mq.matches;

    function update() {
      const y = window.scrollY;
      const vh = world.vh;
      world.scrollY = y;
      const yc = y + vh * 0.5;

      let i = 0;
      for (let j = 0; j < n; j++) if (tops[j] <= yc) i = j;

      const table = world.portrait ? PORTRAIT_KF : DESKTOP_KF;
      const len = Math.max(1, ends[i] - tops[i]);
      const T = Math.min(vh * 0.5, len * 0.4);
      const local = yc - tops[i];
      let a = i;
      let b = i;
      let t = 0;
      if (local < T && i > 0) {
        a = i - 1;
        t = 0.5 + local / (2 * T);
      } else if (local > len - T && i < n - 1) {
        b = i + 1;
        t = (local - (len - T)) / (2 * T);
      }
      t = clamp(t, 0, 1);
      t = t * t * (3 - 2 * t);
      lerpKF(table[SECTION_IDS[a]], table[SECTION_IDS[b]], t, world.kf);

      world.lab = clamp((y - labTop) / Math.max(1, labH - vh), 0, 1);
      world.travel = y / Math.max(1, vh);
      activeStore.set(SECTION_IDS[i]);
      if (world.reduced) world.invalidate?.();
    }

    function measure() {
      measureQueued = false;
      const sy = window.scrollY;
      world.vw = window.innerWidth;
      world.vh = window.innerHeight;
      world.portrait = world.vw / world.vh < 0.9;
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        tops[i] = el ? el.getBoundingClientRect().top + sy : i ? tops[i - 1] : 0;
      });
      const docH = document.documentElement.scrollHeight;
      for (let i = 0; i < n; i++) ends[i] = i < n - 1 ? tops[i + 1] : docH;
      const lab = document.getElementById("movement");
      if (lab) {
        const r = lab.getBoundingClientRect();
        labTop = r.top + sy;
        labH = r.height;
      }
      update();
    }

    const queueMeasure = () => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(measure);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    const onPointer = (e: PointerEvent) => {
      world.px = (e.clientX / window.innerWidth) * 2 - 1;
      world.py = -((e.clientY / window.innerHeight) * 2 - 1);
      world.pointerOn = true;
    };
    const onLeave = () => {
      world.pointerOn = false;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") world.pointerOn = false;
    };
    const onMq = () => {
      world.reduced = mq.matches;
      update();
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (world.reduced) {
        world.pxs = 0;
        world.pys = 0;
        world.warmS = world.kf.warm;
      } else {
        const k = 1 - Math.exp(-dt * 5);
        world.pxs += (world.px - world.pxs) * k;
        world.pys += (world.py - world.pys) * k;
        world.warmS += (world.kf.warm - world.warmS) * (1 - Math.exp(-dt * 3));
      }
      raf = requestAnimationFrame(loop);
    };

    // detect a low-power device once
    const nav = navigator as Navigator & { deviceMemory?: number };
    const mem = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    world.lowPower = mem <= 2 || cores <= 2;

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", queueMeasure);
    window.addEventListener("load", queueMeasure);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    mq.addEventListener?.("change", onMq);

    const ro = new ResizeObserver(queueMeasure);
    ro.observe(document.body);
    const t1 = window.setTimeout(queueMeasure, 700);
    const t2 = window.setTimeout(queueMeasure, 2200);
    document.fonts?.ready.then(queueMeasure).catch(() => undefined);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", queueMeasure);
      window.removeEventListener("load", queueMeasure);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);
}
