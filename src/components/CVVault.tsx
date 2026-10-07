import { profile } from "../data/profile";
import Container from "./Container";
import GlassPanel from "./GlassPanel";
import HealthcareScanner from "./HealthcareScanner";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const BARS = [
  [100, 3],
  [78, 3],
  [90, 3],
  [56, 3],
];

/**
 * Digital professional record. The PDF lives at a stable public path, so the CV
 * can be replaced by swapping public/cv/glorious-moraa-cv.pdf — no code changes.
 */
export default function CVVault() {
  const { cv } = profile;
  return (
    <section id="cv" className="relative py-28 md:py-40">
      <Container>
        <SectionHeader index="09" label="CV" />
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="heading-xl">
                Digital <span className="text-ice-gradient font-semibold">professional</span> record
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-steel">
                The complete professional record — qualifications, experience and details — is available as a clean PDF.
                View it in your browser or download a copy instantly.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1}>
              <GlassPanel corners className="p-6 sm:p-8">
                <div className="grid items-center gap-8 sm:grid-cols-[190px_1fr]">
                  {/* document scan */}
                  <HealthcareScanner
                    mode="loop"
                    duration={5}
                    className="mx-auto aspect-[3/4] w-full max-w-[190px] overflow-hidden rounded-[3px] border border-ice/25 bg-clinic/[0.05] p-4 sm:mx-0"
                  >
                    <div className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-ice/80">{profile.name}</div>
                    <div className="mt-1.5 h-[3px] w-10 bg-ice/60" />
                    <div className="mt-5 space-y-2">
                      {BARS.map(([w, h], i) => (
                        <div key={i} className="bg-white/[0.14]" style={{ width: `${w}%`, height: h }} />
                      ))}
                    </div>
                    <div className="mt-5 h-[3px] w-8 bg-mint/50" />
                    <div className="mt-3 space-y-2">
                      {[94, 70, 88, 40, 82].map((w, i) => (
                        <div key={i} className="h-[3px] bg-white/[0.1]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <div className="mt-5 h-[3px] w-8 bg-mint/50" />
                    <div className="mt-3 space-y-2">
                      {[76, 92, 58].map((w, i) => (
                        <div key={i} className="h-[3px] bg-white/[0.1]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </HealthcareScanner>

                  <div>
                    <div className="mono-label !text-ice">Professional record</div>
                    <h3 className="mt-3 font-display text-3xl font-medium uppercase leading-none tracking-[0.06em] text-clinic">
                      {profile.name}
                    </h3>
                    <div className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.24em] text-steel/80">
                      {profile.roles.join(" · ")}
                    </div>

                    <dl className="mt-6 space-y-2.5 border-y border-ice/10 py-4 font-mono text-[0.64rem] uppercase tracking-[0.22em]">
                      <div className="flex items-center justify-between">
                        <dt className="text-steel/60">Document status</dt>
                        <dd className="flex items-center gap-2 text-mint">
                          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
                          {cv.status}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-steel/60">Format</dt>
                        <dd className="text-ice">{cv.format}</dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={cv.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sys"
                        aria-label="View CV in a new tab"
                      >
                        View CV
                      </a>
                      <a
                        href={cv.path}
                        download={cv.fileName}
                        className="btn-sys btn-sys-solid"
                        aria-label="Download CV as a PDF"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
