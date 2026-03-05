import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Home/Hero';
import { PageLoader } from './components/Home/Pageloader';
import { DocsPage } from './components/Docs/DocsPage';

// ─── Lazy-loaded below-fold sections ─────────────────────────────────────────
const FeaturedWork = lazy(() => import('./components/Home/FeaturedWork').then(m => ({ default: m.FeaturedWork })));
const Services = lazy(() => import('./components/Home/Services').then(m => ({ default: m.Services })));
const Process = lazy(() => import('./components/Home/Process').then(m => ({ default: m.Process })));
const Testimonials = lazy(() => import('./components/Home/Testimonials').then(m => ({ default: m.Testimonials })));
const Footer = lazy(() => import('./components/Layout/Footer').then(m => ({ default: m.Footer })));
const ContactModal = lazy(() => import('./components/Home/ContactModal').then(m => ({ default: m.ContactModal })));

// Pre-fetch lazy chunks before they're needed
const preloadChunks = () => {
  import('./components/Home/FeaturedWork');
  import('./components/Home/Services');
  import('./components/Home/Process');
  import('./components/Home/Testimonials');
  import('./components/Layout/Footer');
  import('./components/Home/ContactModal');
};

// ─── Simple path-based router (no external library needed) ─────────────────
const getRoute = () => {
  const p = window.location.pathname;
  if (p.startsWith('/docs')) return 'docs';
  return 'home';
};

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [route, setRoute] = useState<'home' | 'docs'>(getRoute);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Listen for popstate (browser back/fwd) and custom docs:exit event
  useEffect(() => {
    const onPopState = () => setRoute(getRoute());
    const onDocsExit = (e: any) => {
      const hash = e.detail?.hash || '';
      window.history.pushState({}, '', hash ? '/' + hash : '/');
      setRoute('home');

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash.replace('#', ''));
          if (el) {
            const offset = 80; // Match NAV_HEIGHT
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 500); // Wait longer for lazy-loaded sections to mount
      }
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('docs:exit', onDocsExit);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('docs:exit', onDocsExit);
    };
  }, []);

  // Navigate to /docs
  const goToDocs = () => {
    window.history.pushState({}, '', '/docs');
    setRoute('docs');
  };

  // Begin downloading lazy chunks when user is 300px above the fold
  useEffect(() => {
    if (route !== 'home') return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadChunks();
          io.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [route]);

  // ── Docs route ──
  if (route === 'docs') {
    return (
      <div className="bg-zinc-950 text-white min-h-screen selection:bg-accent selection:text-white relative">
        <DocsPage onOpenContact={() => setContactOpen(true)} />
        <Suspense fallback={null}>
          <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </Suspense>
        <div className="grain" />
      </div>
    );
  }

  // ── Home route ──
  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden selection:bg-accent selection:text-white relative">

      {/* CINEMATIC LOADER */}
      <PageLoader
        onComplete={() => setLoaded(true)}
        minDuration={2800}
      />

      {/* MAIN CONTENT — fades in after loader exits */}
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

        {/* Sentinel at the fold — entering viewport triggers lazy-chunk preload */}
        <div ref={sentinelRef} aria-hidden="true" />

        <Suspense fallback={null}><FeaturedWork /></Suspense>
        <Suspense fallback={null}><Services /></Suspense>
        <Suspense fallback={null}><Process /></Suspense>
        <Suspense fallback={null}><Testimonials /></Suspense>
        <Suspense fallback={null}>
          <Footer onOpenContact={() => setContactOpen(true)} />
        </Suspense>
      </main>

      {/* CONTACT MODAL */}
      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>
    </div>
  );
};

export default App;
