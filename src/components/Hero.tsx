import { motion } from "motion/react";
import { profile } from "../data/profile";
import Container from "./Container";
import FloatingDashboard from "./FloatingDashboard";
import HealthcareScanner from "./HealthcareScanner";
import MedicalWaveform from "./MedicalWaveform";
import MovementMonitor from "./MovementMonitor";
import PortraitScanner from "./PortraitScanner";
import { INTRO_DELAY } from "./IntroSequence";

const rise = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: INTRO_DELAY + i * 0.12, ease: [0.2, 0.7, 0.2, 1] as const },
});

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pb-28 pt-[52svh] lg:pb-32 lg:pt-28">
      <HealthcareScanner mode="loop" duration={12} delay={4} className="pointer-events-none absolute inset-0" />

      <Container className="relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          <motion.div {...rise(0)} className="flex items-center gap-3">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_2px_rgba(143,240,212,0.6)]" />
            <span className="mono-label">Digital human movement lab</span>
          </motion.div>

          <h1 className="mt-6 font-display uppercase leading-[0.88] tracking-[-0.02em]">
            <motion.span
              {...rise(1)}
              className="block text-[clamp(3rem,14vw,5.2rem)] font-extralight text-clinic lg:text-[clamp(4rem,7.3vw,8.2rem)]"
            >
              {profile.firstName}
            </motion.span>{" "}
            <motion.span
              {...rise(2)}
              className="text-ice-gradient block text-[clamp(3rem,14vw,5.2rem)] font-semibold lg:text-[clamp(4rem,7.3vw,8.2rem)]"
            >
              {profile.lastName}
            </motion.span>
          </h1>

          <motion.p
            {...rise(3)}
            className="mt-6 font-display text-[1rem] font-light uppercase tracking-[0.28em] text-clinic/90 sm:text-xl sm:tracking-[0.32em]"
          >
            CNA &amp; Physiotherapy Professional
          </motion.p>

          <motion.div {...rise(4)} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.26em] text-ice">
            {profile.tagline.map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                {t}
                {i < profile.tagline.length - 1 && <span className="text-ice/40">•</span>}
              </span>
            ))}
          </motion.div>

          <motion.p {...rise(5)} className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-steel">
            {profile.intro}
          </motion.p>

          <motion.div {...rise(6)} className="mt-8 flex flex-wrap gap-3">
            <a href="#cv" className="btn-sys btn-sys-solid">
              View CV
            </a>
            <a href="#contact" className="btn-sys">
              Contact
            </a>
          </motion.div>

          <motion.div {...rise(7)} className="mt-10 hidden lg:block">
            <MovementMonitor />
          </motion.div>
          <motion.div {...rise(7)} className="mt-9 lg:hidden">
            <FloatingDashboard />
          </motion.div>
        </div>

        <motion.div
          {...rise(5)}
          className="mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:col-span-3 lg:col-start-10 lg:mx-0 lg:max-w-[330px]"
        >
          <PortraitScanner />
          <FloatingDashboard className="mt-8 hidden !grid-cols-2 lg:grid" />
        </motion.div>
      </Container>

      {/* clinical monitor trace */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <Container className="flex items-end justify-between pb-1">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-steel/50">
            Movement signal · illustrative
          </span>
          <a
            href="#about"
            className="pointer-events-auto hidden items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.26em] text-steel/70 transition-colors hover:text-clinic sm:flex"
          >
            Scroll to enter
            <span className="relative block h-8 w-px overflow-hidden bg-ice/20">
              <span className="pulse-dot absolute inset-x-0 top-0 h-3 bg-ice" />
            </span>
          </a>
        </Container>
        <MedicalWaveform variant="ecg" height={64} className="opacity-70 [mask-image:linear-gradient(90deg,transparent,#000_20%,#000)]" />
      </div>
    </section>
  );
}
