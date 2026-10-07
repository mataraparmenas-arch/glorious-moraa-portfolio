import { profile } from "../data/profile";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import HealthcareScanner from "./HealthcareScanner";
import MedicalWaveform from "./MedicalWaveform";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

/** Patient-care environment: bedside-observation interface language, no clinical readings. */
export default function CareJourney() {
  return (
    <section id="care" className="relative py-28 md:py-40">
      <HealthcareScanner mode="loop" duration={14} delay={2} className="pointer-events-none absolute inset-0" />
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-6">
            <SectionHeader index="02" label="Care" />
            <Reveal>
              <h2 className="heading-xl mt-8">
                Patient <span className="text-ice-gradient font-semibold">care</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-steel">{profile.care.text}</p>
            </Reveal>

            <Reveal delay={0.2} className="relative mt-10">
              {/* attentiveness rings */}
              <span
                aria-hidden
                className="ring-ping pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-mint/40"
              />
              <span
                aria-hidden
                className="ring-ping pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-mint/30"
                style={{ animationDelay: "2.5s" }}
              />
              <GlassPanel corners className="relative p-6">
                <div className="flex items-center justify-between">
                  <span className="mono-label !text-ice">Bedside observation</span>
                  <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mint">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
                    Attentive
                  </span>
                </div>
                <MedicalWaveform variant="respiration" height={68} color="143,240,212" speed={0.8} className="mt-4" />
                <ul className="mt-5 space-y-3.5">
                  {profile.care.principles.map((p, i) => (
                    <li key={p.k} className="flex items-center gap-4">
                      <span className="w-[8.5rem] font-mono text-[0.64rem] uppercase tracking-[0.2em] text-steel/80">
                        {p.k}
                      </span>
                      <span className="relative h-px flex-1 bg-ice/20">
                        <span className="track-dot" style={{ animationDuration: `${4.5 + i * 1.1}s` }} />
                      </span>
                      <span className="w-14 text-right font-mono text-[0.64rem] uppercase tracking-[0.2em] text-ice">
                        {p.v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-ice/10 pt-4 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-steel/50">
                  Interface illustration · not patient data
                </p>
              </GlassPanel>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
