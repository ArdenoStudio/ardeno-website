import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Home/Hero';
import { PageLoader } from './components/Home/Pageloader';
import { DocsPage } from './components/Docs/DocsPage';
import CookieBanner from './components/UI/CookieBanner';
import { trackUtmParams } from './components/UI/trackUtm';
import ArdenoAIWidget from './components/AI/ArdenoAIWidget';

// ─── Lazy-loaded below-fold sections ─────────────────────────────────────────
const FeaturedWork = lazy(() =>
  import('./components/Home/FeaturedWork').then(m => ({ default: m.FeaturedWork }))
);
const Services = lazy(() =>
  import('./components/Home/Services').then(m => ({ default: m.Services }))
);
const Process = lazy(() =>
  import('./components/Home/Process').then(m => ({ default: m.Process }))
);
const OurStory = lazy(() =>
  import('./components/Home/OurStory').then(m => ({ default: m.OurStory }))
);
const Testimonials = lazy(() =>
  import('./components/Home/Testimonials').then(m => ({ default: m.Testimonials }))
);
const Footer = lazy(() =>
  import('./components/Layout/Footer').then(m => ({ default: m.Footer }))
);
const ContactModal = lazy(() =>
  import('./components/Home/ContactModal').then(m => ({ default: m.ContactModal }))
);
const FAQPage = lazy(() =>
  import('./components/FAQ/FAQPage').then(m => ({ default: m.FAQPage }))
);

// Pre-fetch lazy chunks before they're needed
const preloadChunks = () => {
  import('./components/Home/FeaturedWork');
  import('./components/Home/Services');
  import('./components/Home/Process');
  import('./components/Home/OurStory');
  import('./components/Home/Testimonials');
  import('./components/Layout/Footer');
  import('./components/Home/ContactModal');
};

// ─── Simple path-based router ────────────────────────────────────────────────
type Route = 'home' | 'docs' | 'faq';

const getRoute = (): Route => {
  const p = window.location.pathname;
  if (p.startsWith('/docs')) return 'docs';
  if (p.startsWith('/faq')) return 'faq';
  return 'home';
};

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [route, setRoute] = useState<Route>(getRoute);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackUtmParams();
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(getRoute());

    const onDocsExit = (e: CustomEvent<{ hash?: string }>) => {
      const hash = e.detail?.hash || '';
      window.history.pushState({}, '', hash ? '/' + hash : '/');
      setRoute('home');

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash.replace('#', ''));
          if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const offsetPosition = elementRect - bodyRect - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 500);
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('docs:exit', onDocsExit as EventListener);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('docs:exit', onDocsExit as EventListener);
    };
  }, []);

  useEffect(() => {
    if (route !== 'home') return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { preloadChunks(); io.disconnect(); } },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [route]);

  // ── Shared wrapper for standalone pages ──
  const pageShell = (children: React.ReactNode) => (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-accent selection:text-white relative">
      {children}
      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>
      <CookieBanner />
      <ArdenoAIWidget />
      <div className="grain" />
    </div>
  );

  // ── Docs route ──
  if (route === 'docs') {
    return pageShell(
      <DocsPage onOpenContact={() => setContactOpen(true)} />
    );
  }

  // ── FAQ route ──
  if (route === 'faq') {
    return pageShell(
      <Suspense fallback={null}>
        <FAQPage onOpenContact={() => setContactOpen(true)} />
      </Suspense>
    );
  }

  // ── Home route ──
  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden selection:bg-accent selection:text-white relative">
      <PageLoader onComplete={() => setLoaded(true)} minDuration={2800} />

      <main
        className="relative z-10"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        <Navbar onOpenModal={() => setContactOpen(true)} />
        <Hero onOpenContact={() => setContactOpen(true)} />

        <div ref={sentinelRef} aria-hidden="true" />

        <Suspense fallback={null}><FeaturedWork /></Suspense>
        <Suspense fallback={null}><Services /></Suspense>
        <Suspense fallback={null}><Process /></Suspense>
        <Suspense fallback={null}><OurStory /></Suspense>
        <Suspense fallback={null}><Testimonials /></Suspense>
        <Suspense fallback={null}>
          <Footer onOpenContact={() => setContactOpen(true)} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>

      <CookieBanner />
      {loaded && <ArdenoAIWidget />}
    </div>
  );
};

export default App;
