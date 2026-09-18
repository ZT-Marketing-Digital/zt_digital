import { MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { WhatsappFloat } from './components/layout/WhatsappFloat';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { About } from './components/sections/About';
import { Clients } from './components/sections/Clients';
import { Contact } from './components/sections/Contact';
import { FollowUp } from './components/sections/FollowUp';
import { Footer } from './components/sections/Footer';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { Highlight } from './components/sections/Highlight';
import { Marquee } from './components/sections/Marquee';
import { Overview } from './components/sections/Overview';
import { PainSolution } from './components/sections/PainSolution';
import { Process } from './components/sections/Process';
import { Services } from './components/sections/Services';
import { initSmoothScroll } from './lib/motion/smoothScroll';
import { captureAttribution } from './lib/tracking/attribution';
import { getConsent } from './lib/tracking/consent';
import { events } from './lib/tracking/events';
import { initTracking } from './lib/tracking/tracker';
import { useScrollDepth } from './lib/tracking/useScrollDepth';

export type Route = 'home' | 'privacy';

// Evita PageView duplicado quando o StrictMode executa os efeitos duas vezes (dev).
let tracked = false;

function Landing() {
  useScrollDepth();
  useEffect(() => initSmoothScroll(), []);

  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <PainSolution />
        <Overview />
        <Process />
        <Services />
        <Marquee />
        <Highlight />
        <FollowUp />
        <Clients />
        <About />
        <Contact />
      </main>
    </>
  );
}

export function App({ route = 'home' }: { route?: Route }) {
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    if (!tracked) {
      tracked = true;
      captureAttribution();
      initTracking();
      events.pageView();
    }
    setConsentOpen(getConsent() === 'unknown');
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {route === 'privacy' ? <PrivacyPage /> : <Landing />}
      <Footer onManageCookies={() => setConsentOpen(true)} anchorBase={route === 'privacy' ? '/' : ''} />
      {route === 'home' ? <WhatsappFloat /> : null}
      <ConsentBanner open={consentOpen} onClose={() => setConsentOpen(false)} />
    </MotionConfig>
  );
}
