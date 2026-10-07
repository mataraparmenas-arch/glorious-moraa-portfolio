import { profile } from "../data/profile";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-warm/10 pb-10 pt-12">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-2xl font-medium uppercase tracking-[0.14em] text-clinic">
              {profile.name}
            </div>
            <div className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.26em] text-steel/70">
              {profile.title}
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.64rem] uppercase tracking-[0.22em] text-steel/70">
            {profile.nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="transition-colors hover:text-clinic">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-ice/10 pt-6 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-steel/50 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span className="text-ice/70">Technology serves the human.</span>
          <span className="max-w-sm md:text-right">
            Interface elements, waveforms and graphs are illustrative visuals — not clinical data.
          </span>
        </div>
      </Container>
    </footer>
  );
}
