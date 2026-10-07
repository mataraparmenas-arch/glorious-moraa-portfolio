import { useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "../data/profile";
import { useActiveSection, world } from "../lib/world";
import type { SectionId } from "../lib/keyframes";
import { cn } from "../utils/cn";

const NAV_OF: Record<SectionId, string> = {
  home: "home",
  about: "about",
  care: "care",
  physiotherapy: "physiotherapy",
  expertise: "physiotherapy",
  movement: "movement",
  analysis: "movement",
  rehab: "movement",
  journey: "journey",
  cv: "cv",
  contact: "contact",
};

export default function Navigation() {
  const active = NAV_OF[useActiveSection()];
  const [open, setOpen] = useState(false);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: world.reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
      className="fixed left-1/2 top-3 z-50 w-[min(1240px,calc(100%-1.5rem))] -translate-x-1/2"
    >
      <nav aria-label="Primary" className="glass !rounded-[4px] flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
        <a href="#home" onClick={go("home")} className="flex items-center gap-3" aria-label="Glorious Moraa — home">
          <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden>
            <rect x="1.5" y="1.5" width="61" height="61" rx="10" fill="none" stroke="#a7ecff" strokeOpacity=".35" />
            <path
              d="M6 34h12l5-8 6 20 7-30 6 18h16"
              fill="none"
              stroke="#a7ecff"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-[0.95rem] font-medium uppercase leading-none tracking-[0.18em] text-clinic">
            Glorious Moraa
          </span>
        </a>

        <ul className="hidden items-center lg:flex">
          {profile.nav.map((n) => {
            const on = active === n.id;
            return (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "relative block px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] transition-colors duration-300",
                    on ? "text-clinic" : "text-steel/70 hover:text-clinic",
                  )}
                >
                  {n.label}
                  {on && (
                    <>
                      <motion.span
                        layoutId="nav-glow"
                        className="absolute inset-0 -z-10 rounded-[3px] bg-ice/[0.07]"
                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      />
                      <motion.span
                        layoutId="nav-scan"
                        className="absolute inset-x-2 -bottom-[3px] h-px bg-gradient-to-r from-transparent via-ice to-transparent shadow-[0_0_10px_1px_rgba(167,236,255,0.7)]"
                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      />
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a href={profile.phoneHref} className="btn-sys btn-sys-solid hidden !px-4 !py-2.5 sm:inline-flex xl:!px-5">
            Call
          </a>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-[3px] border border-ice/25 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={cn(
                "absolute h-px w-5 bg-clinic transition-transform duration-300",
                open ? "rotate-45" : "-translate-y-[4px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-5 bg-clinic transition-transform duration-300",
                open ? "-rotate-45" : "translate-y-[4px]",
              )}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass !rounded-[4px] mt-2 p-3 lg:hidden"
          >
            <ul className="grid grid-cols-2 gap-1">
              {profile.nav.map((n, i) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-[3px] px-3 py-3 font-mono text-[0.72rem] uppercase tracking-[0.2em]",
                      active === n.id ? "bg-ice/10 text-clinic" : "text-steel/80",
                    )}
                  >
                    <span className="text-ice/50">{String(i + 1).padStart(2, "0")}</span>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
