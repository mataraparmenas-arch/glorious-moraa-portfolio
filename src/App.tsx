import { MotionConfig } from "motion/react";
import { useWorldTracker } from "./lib/world";
import Ambient from "./components/Ambient";
import SceneLoader from "./components/SceneLoader";
import Cursor from "./components/Cursor";
import Navigation from "./components/Navigation";
import IntroSequence from "./components/IntroSequence";
import Hero from "./components/Hero";
import About from "./components/About";
import CareJourney from "./components/CareJourney";
import Physiotherapy from "./components/Physiotherapy";
import Expertise from "./components/Expertise";
import MovementLab from "./components/MovementLab";
import Rehabilitation from "./components/Rehabilitation";
import ProfessionalJourney from "./components/ProfessionalJourney";
import CVVault from "./components/CVVault";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  useWorldTracker();

  return (
    <MotionConfig reducedMotion="user">
      <Ambient />
      <SceneLoader />
      <Cursor />
      <Navigation />
      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <About />
        <CareJourney />
        <Physiotherapy />
        <Expertise />
        <MovementLab />
        <Rehabilitation />
        <ProfessionalJourney />
        <CVVault />
        <Contact />
      </main>
      <Footer />
      <IntroSequence />
    </MotionConfig>
  );
}
