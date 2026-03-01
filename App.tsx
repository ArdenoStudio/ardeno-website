import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Home/Hero';
import { PageLoader } from './components/Home/Pageloader';

// ─── Lazy-loaded below-fold sections ─────────────────────────────────────────
// Components use named exports so we unwrap them for React.lazy
const FeaturedWork = lazy(() => import('./components/Home/FeaturedWork').then(m => ({ default: m.FeaturedWork })));
const Services     = lazy(() => import('./components/Home/Services').then(m => ({ default: m.Services })));
const Process      = lazy(() => import('./components/Home/Process').then(m => ({ default: m.Process })));
const Testimonials = lazy(() => import('./components/Home/Testimonials').then(m => ({ default: m.Testimonials })));
const Footer       = lazy(() => import('./components/Layout/Footer').then(m => ({ default: m.Footer })));
const ContactModal = lazy(() => import('./components/Home/ContactModal').then(m => ({ default: m.ContactModal })));

// Pre-fetch lazy chunks before they're needed (called via IntersectionObserver)
const preloadChunks = () => {
  import('./components/Home/FeaturedWork');
  import('./components/Home/Services');
  import('./components/Home/Process');
  import('./components/Home/Testimonials');
  import('./components/Layout/Footer');
  import('./components/Home/ContactModal');
};

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Begin downloading lazy chunks when user is 300px above the fold
  useEffect(() => {
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
  }, []);

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
