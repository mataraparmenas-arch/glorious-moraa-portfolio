import { profile } from "../data/profile";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import MedicalWaveform from "./MedicalWaveform";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

/** The environment becomes calmer and warmer: technology → human connection. */
export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[85%]"
        style={{ background: "radial-gradient(70% 70% at 50% 100%, rgba(255,190,140,0.15), transparent 70%)" }}
      />
      <Container className="relative">
        <SectionHeader index="10" label="Contact" />
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <Reveal>
            <h2 className="heading-xl">
              {"Let's "}
              <span className="font-semibold text-warm">connect.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-xl text-[1.05rem] leading-relaxed text-steel">
              A question, an opportunity, or simply a conversation about care and movement — Glorious would love to
              hear from you.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-12">
            <GlassPanel className="!border-warm/20 px-6 py-10 sm:px-12">
              <div className="mono-label !text-warm/80">{profile.name}</div>

              <a
                href={profile.phoneHref}
                className="mt-6 block font-display text-[clamp(2.4rem,8vw,4.6rem)] font-light leading-none tracking-[0.04em] text-clinic transition-colors hover:text-warm"
              >
                {profile.phone}
              </a>
              <a
                href={profile.emailHref}
                className="mt-5 block break-all font-mono text-[0.85rem] tracking-[0.08em] text-steel transition-colors hover:text-warm sm:text-lg"
              >
                {profile.email}
              </a>

              <MedicalWaveform
                variant="respiration"
                height={44}
                speed={0.45}
                amplitude={0.7}
                color="255,210,170"
                ticks={false}
                className="mt-8 opacity-80"
              />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href={profile.phoneHref} className="btn-sys btn-sys-warm">
                  Call Glorious
                </a>
                <a href={profile.emailHref} className="btn-sys !border-warm/30 hover:!border-warm/70">
                  Send email
                </a>
              </div>
            </GlassPanel>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
