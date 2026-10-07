import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "../data/profile";
import GlassPanel from "./GlassPanel";
import HealthcareScanner from "./HealthcareScanner";
import { cn } from "../utils/cn";

const TAGS = [
  { t: "Care", pos: "left-3 top-[16%]", delay: 0.55 },
  { t: "Movement", pos: "right-3 top-[27%]", delay: 0.85 },
  { t: "Rehabilitation", pos: "left-3 top-[56%]", delay: 1.55 },
  { t: "Physiotherapy", pos: "right-3 top-[68%]", delay: 1.85 },
];

/** Shown only until the real photograph is placed at public/images/glorious-moraa.jpg */
function PortraitPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-ink-3 to-ink-2">
      <svg viewBox="0 0 200 250" className="h-[90%] w-auto" fill="none" aria-hidden>
        <circle cx="100" cy="88" r="38" stroke="rgba(167,236,255,.45)" fill="rgba(167,236,255,.05)" />
        <ellipse cx="100" cy="88" rx="38" ry="12" stroke="rgba(167,236,255,.15)" />
        <path
          d="M20 250 C 26 178, 62 150, 100 150 C 138 150, 174 178, 180 250"
          stroke="rgba(167,236,255,.4)"
          fill="rgba(167,236,255,.05)"
        />
        <path d="M60 250 C 64 200, 80 176, 100 176 C 120 176, 136 200, 140 250" stroke="rgba(167,236,255,.15)" />
      </svg>
      <span className="absolute bottom-2 left-2 right-2 text-center font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel/60">
        Portrait slot · {profile.portrait.sources[0]}
      </span>
    </div>
  );
}

/** Real photograph inside a clinical glass panel with a hover / tap "profile scan". */
export default function PortraitScanner({ className }: { className?: string }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [labels, setLabels] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const trigger = useCallback(() => {
    setRunKey((k) => k + 1);
    setLabels(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLabels(false), 4300);
  }, []);

  // one automatic "identify" scan shortly after the boot sequence
  useEffect(() => {
    const t = window.setTimeout(trigger, 2600);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(timer.current);
    };
  }, [trigger]);

  const onError = () => {
    if (idx + 1 < profile.portrait.sources.length) setIdx(idx + 1);
    else setFailed(true);
  };

  return (
    <div className={cn("relative", className)}>
      {/* movement rings */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
        fill="none"
      >
        <g className="spin-slow" style={{ transformOrigin: "200px 200px" }}>
          <circle cx="200" cy="200" r="190" stroke="rgba(167,236,255,.16)" strokeDasharray="2 9" />
          <circle cx="390" cy="200" r="3" fill="#a7ecff" />
        </g>
        <g className="spin-slow-rev" style={{ transformOrigin: "200px 200px" }}>
          <circle cx="200" cy="200" r="168" stroke="rgba(143,240,212,.14)" />
          <path d="M200 32 A168 168 0 0 1 368 200" stroke="rgba(167,236,255,.5)" strokeWidth="1.2" />
        </g>
      </svg>

      <GlassPanel corners className="relative p-3">
        <div
          role="img"
          aria-label={profile.portrait.alt}
          tabIndex={0}
          data-hover
          onPointerEnter={() => {
            if (!labels) trigger();
          }}
          onFocus={() => {
            if (!labels) trigger();
          }}
          onClick={trigger}
          className="relative aspect-[4/5] cursor-crosshair overflow-hidden rounded-[3px] bg-ink-2 outline-none"
        >
          {failed ? (
            <PortraitPlaceholder />
          ) : (
            <img
              src={profile.portrait.sources[idx]}
              alt={profile.portrait.alt}
              width={888}
              height={770}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={onError}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: profile.portrait.objectPosition }}
            />
          )}

          {/* clinical grade: soft cool wash + bottom fade for legibility */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,20,34,0.12)_0%,rgba(5,20,34,0)_40%,rgba(5,11,20,0.78)_100%)]" />
          <div className="bg-dotgrid pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen" />

          {/* anatomical contour lines (revealed while scanning) */}
          <svg
            aria-hidden
            viewBox="0 0 100 125"
            preserveAspectRatio="none"
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700",
              labels ? "opacity-100" : "opacity-0",
            )}
            fill="none"
            stroke="rgba(190,244,255,.5)"
            strokeWidth=".25"
          >
            <ellipse cx="50" cy="40" rx="22" ry="27" />
            <ellipse cx="50" cy="40" rx="30" ry="35" strokeDasharray="1 2" />
            <path d="M12 125 C 16 92, 34 80, 50 80 C 66 80, 84 92, 88 125" />
            <line x1="50" y1="0" x2="50" y2="125" strokeDasharray="1 3" />
            <line x1="0" y1="40" x2="100" y2="40" strokeDasharray="1 3" />
          </svg>

          <HealthcareScanner
            mode="once"
            duration={2.7}
            runKey={runKey}
            active={runKey > 0}
            className="pointer-events-none absolute inset-0"
          />

          {TAGS.map((t) => (
            <span
              key={t.t}
              aria-hidden
              className={cn(
                "pointer-events-none absolute flex items-center gap-1.5 border border-ice/30 bg-ink/70 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ice backdrop-blur-sm transition-all duration-500",
                t.pos,
                labels ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
              )}
              style={{ transitionDelay: labels ? `${t.delay}s` : "0s" }}
            >
              <span className="h-1 w-1 rounded-full bg-mint shadow-[0_0_8px_2px_rgba(143,240,212,0.7)]" />
              {t.t}
            </span>
          ))}
        </div>

        {/* profile record */}
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 px-1 pb-1">
          <div>
            <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-steel/60">Profile</div>
            <div className="mt-1 font-display text-lg font-medium uppercase leading-none tracking-[0.1em] text-clinic">
              {profile.name}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-steel/60">Status</div>
            <div className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mint">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
              Professional
            </div>
          </div>
          <div className="col-span-2 flex gap-2 border-t border-ice/10 pt-3">
            {profile.roles.map((r) => (
              <span
                key={r}
                className="border border-ice/20 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ice"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
