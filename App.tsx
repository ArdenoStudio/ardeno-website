import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Home/Hero';
import { ProjectMarquee } from './components/Home/ProjectMarquee';
import { PageLoader } from './components/Home/Pageloader';
import { DocsPage } from './components/Docs/DocsPage';
import CookieBanner from './components/UI/CookieBanner';
import { trackUtmParams } from './components/UI/trackUtm';
import { applySeoToDocument, SeoRouteKey } from './seo';
import ArdenoAIWidget from './components/AI/ArdenoAIWidget';

// ─── Lazy-loaded below-fold sections ─────────────────────────────────────────
const FeaturedWork = lazy(() =>
  import('./components/Home/FeaturedWork').then(m => ({ default: m.FeaturedWork }))
);
const AuditCTA = lazy(() =>
  import('./components/Home/AuditCTA').then(m => ({ default: m.AuditCTA }))
);
const BrandIdentity = lazy(() =>
  import('./components/Home/BrandIdentity').then(m => ({ default: m.BrandIdentity }))
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
const FinalCTA = lazy(() =>
  import('./components/Home/FinalCTA').then(m => ({ default: m.FinalCTA }))
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
const CaseStudiesIndex = lazy(() =>
  import('./components/CaseStudies/CaseStudiesIndex').then(m => ({ default: m.CaseStudiesIndex }))
);
const HumbleBeginnings = lazy(() =>
  import('./components/CaseStudies/HumbleBeginnings').then(m => ({ default: m.HumbleBeginnings }))
);
const preloadChunks = () => {
  import('./components/Home/FeaturedWork');
  import('./components/Home/AuditCTA');
  import('./components/Home/Services');
  import('./components/Home/Process');
  import('./components/Home/OurStory');
  import('./components/Home/Testimonials');
  import('./components/Home/FinalCTA');
  import('./components/Layout/Footer');
  import('./components/Home/ContactModal');
};

// ─── Simple path-based router ────────────────────────────────────────────────
type Route = 'home' | 'docs' | 'faq' | 'brand' | 'case-studies' | 'cs-humble-beginnings';

const getRoute = (): Route => {
  const p = window.location.pathname;
  if (p.startsWith('/docs')) return 'docs';
  if (p.startsWith('/faq')) return 'faq';
  if (p.startsWith('/brand')) return 'brand';
  if (p.startsWith('/case-studies/humble-beginnings')) return 'cs-humble-beginnings';
  if (p === '/case-studies' || p === '/case-studies/') return 'case-studies';
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
    applySeoToDocument(route as SeoRouteKey);
  }, [route]);

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
  const pageShell = (children: React.ReactNode, options?: { hideNav?: boolean }) => (
    <motion.div
      key={route}
      className="case-study-page-root selection:bg-accent selection:text-white"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {!options?.hideNav && <Navbar onOpenModal={() => setContactOpen(true)} />}
      {children}
      <CookieBanner />
    </motion.div>
  );

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-clip selection:bg-accent selection:text-white relative">
      <PageLoader onComplete={() => setLoaded(true)} minDuration={1500} />

      <>
        {route === 'docs' && (
          <Suspense key="docs" fallback={null}>
            <DocsPage onExit={(e: any) => window.dispatchEvent(new CustomEvent('docs:exit', { detail: e }))} />
          </Suspense>
        )}

        {route === 'faq' && pageShell(
          <Suspense key="faq" fallback={null}>
            <FAQPage />
          </Suspense>,
          { hideNav: true }
        )}

        {route === 'case-studies' && pageShell(
          <Suspense key="case-studies" fallback={null}>
            <CaseStudiesIndex />
          </Suspense>,
          { hideNav: true }
        )}

        {route === 'brand' && pageShell(
          <main className="min-h-screen bg-[#080809] pt-14">
            <Suspense key="brand" fallback={null}>
              <BrandIdentity />
            </Suspense>
            <Suspense fallback={null}>
              <Footer onOpenContact={() => setContactOpen(true)} />
            </Suspense>
          </main>
        )}

        {route === 'cs-humble-beginnings' && pageShell(
          <Suspense key="cs-humble-beginnings" fallback={null}>
            <HumbleBeginnings />
          </Suspense>,
          { hideNav: true }
        )}

        {route === 'home' && (
          <motion.main
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
            style={{
              opacity: loaded ? 1 : 0,
              pointerEvents: loaded ? 'auto' : 'none',
            }}
          >
            <Navbar onOpenModal={() => setContactOpen(true)} />
            <Hero onOpenContact={() => setContactOpen(true)} />
            <ProjectMarquee />
            <div ref={sentinelRef} aria-hidden="true" />
            <Suspense fallback={null}><AuditCTA onOpenContact={() => setContactOpen(true)} /></Suspense>
            <Suspense fallback={null}><FeaturedWork /></Suspense>
            <Suspense fallback={null}><Services /></Suspense>
            <Suspense fallback={null}><Process /></Suspense>
            <Suspense fallback={null}><OurStory /></Suspense>
            <Suspense fallback={null}><Testimonials /></Suspense>
            <Suspense fallback={null}><FinalCTA onOpenContact={() => setContactOpen(true)} /></Suspense>
            <Suspense fallback={null}>
              <Footer onOpenContact={() => setContactOpen(true)} />
            </Suspense>
          </motion.main>
        )}
      </>

      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>

      <CookieBanner />
      {loaded && <ArdenoAIWidget />}
    </div>
  );
};

export default App;
