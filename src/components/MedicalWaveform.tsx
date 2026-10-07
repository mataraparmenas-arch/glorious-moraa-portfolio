import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { world } from "../lib/world";

type Variant = "ecg" | "respiration" | "motion";

interface Props {
  variant?: Variant;
  height?: number;
  className?: string;
  speed?: number;
  amplitude?: number;
  /** r,g,b triplet */
  color?: string;
  ticks?: boolean;
}

const g = (x: number, c: number, s: number) => Math.exp(-((x - c) * (x - c)) / (2 * s * s));

const PERIOD: Record<Variant, number> = { ecg: 230, respiration: 320, motion: 360 };

function sample(variant: Variant, u: number, t: number) {
  if (variant === "ecg") {
    const p = u - Math.floor(u);
    return (
      0.12 * g(p, 0.18, 0.03) -
      0.12 * g(p, 0.34, 0.008) +
      1.0 * g(p, 0.37, 0.011) -
      0.28 * g(p, 0.405, 0.01) +
      0.22 * g(p, 0.62, 0.05) -
      0.1
    );
  }
  if (variant === "respiration") {
    return Math.sin(u * Math.PI * 2) * 0.72 + Math.sin(u * Math.PI * 4 + 1) * 0.1;
  }
  const env = 0.65 + 0.35 * Math.sin(t * 0.7);
  return env * Math.sin(u * Math.PI * 2) * 0.62 + 0.28 * Math.sin(u * Math.PI * 2 * 2.3 + t * 0.6) + 0.1 * Math.sin(u * 19 + t);
}

/**
 * Canvas waveform inspired by clinical monitors. Purely illustrative — it does
 * not represent any person's physiological signal.
 */
export default function MedicalWaveform({
  variant = "ecg",
  height = 64,
  className,
  speed = 1,
  amplitude = 1,
  color = "167,236,255",
  ticks = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const period = PERIOD[variant];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.floor(w * dpr));
      cv.height = Math.max(1, Math.floor(h * dpr));
    };

    const draw = (ts: number) => {
      const t = world.reduced ? 2.2 : (ts / 1000) * speed;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mid = h * 0.52;
      const amp = h * 0.38 * amplitude;

      // baseline
      ctx.strokeStyle = `rgba(${color},0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      if (ticks) {
        ctx.fillStyle = `rgba(${color},0.12)`;
        for (let x = 0; x < w; x += 24) ctx.fillRect(x, mid - (x % 96 === 0 ? 4 : 2), 1, x % 96 === 0 ? 8 : 4);
      }

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(0.3, `rgba(${color},0.4)`);
      grad.addColorStop(1, `rgba(${color},0.95)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let lastY = mid;
      for (let x = 0; x <= w; x += 2) {
        const u = (x + t * 62) / period;
        lastY = mid - sample(variant, u, t) * amp;
        if (x === 0) ctx.moveTo(x, lastY);
        else ctx.lineTo(x, lastY);
      }
      ctx.stroke();

      // leading point
      ctx.fillStyle = `rgba(${color},1)`;
      ctx.shadowColor = `rgba(${color},0.9)`;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(w - 2, lastY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const loop = (ts: number) => {
      if (visible) draw(ts);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (world.reduced) draw(0);
    });
    ro.observe(cv);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "80px" },
    );
    io.observe(cv);

    if (world.reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [variant, speed, amplitude, color, ticks]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("block w-full", className)}
      style={{ height }}
    />
  );
}
