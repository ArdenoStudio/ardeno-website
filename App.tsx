import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navbar } from './components/Layout/Navbar';
import { Hero } from './components/Home/Hero';
import { ProjectMarquee } from './components/Home/ProjectMarquee';
import { PageLoader } from './components/Home/Pageloader';
import CookieBanner from './components/UI/CookieBanner';
import { trackUtmParams } from './components/UI/trackUtm';
import { applySeoToDocument, SeoRouteKey } from './seo';
import type { ServicePageKey } from './components/Services/ServicePage';

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
const DocsPage = lazy(() =>
  import('./components/Docs/DocsPage').then(m => ({ default: m.DocsPage }))
);
const ArdenoAIWidget = lazy(() => import('./components/AI/ArdenoAIWidget'));
const FAQPage = lazy(() =>
  import('./components/FAQ/FAQPage').then(m => ({ default: m.FAQPage }))
);
const CaseStudiesIndex = lazy(() =>
  import('./components/CaseStudies/CaseStudiesIndex').then(m => ({ default: m.CaseStudiesIndex }))
);
const HumbleBeginnings = lazy(() =>
  import('./components/CaseStudies/HumbleBeginnings').then(m => ({ default: m.HumbleBeginnings }))
);
const ServicePage = lazy(() =>
  import('./components/Services/ServicePage').then(m => ({ default: m.ServicePage }))
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
type Route =
  | 'home'
  | 'docs'
  | 'faq'
  | 'brand'
  | 'case-studies'
  | 'cs-humble-beginnings'
  | 'service-booking-systems'
  | 'service-business-websites'
  | 'service-website-redesign'
  | 'service-ai-lead-assistants';

const SERVICE_ROUTE_PAGES: Partial<Record<Route, ServicePageKey>> = {
  'service-booking-systems': 'service-booking-systems',
  'service-business-websites': 'service-business-websites',
  'service-website-redesign': 'service-website-redesign',
  'service-ai-lead-assistants': 'service-ai-lead-assistants',
};

const getRoute = (): Route => {
  const p = window.location.pathname.replace(/\/+$/, '') || '/';
  if (p.startsWith('/docs')) return 'docs';
  if (p.startsWith('/faq')) return 'faq';
  if (p.startsWith('/brand')) return 'brand';
  if (p === '/services/booking-systems') return 'service-booking-systems';
  if (p === '/services/business-websites') return 'service-business-websites';
  if (p === '/services/website-redesign') return 'service-website-redesign';
  if (p === '/services/ai-lead-assistants') return 'service-ai-lead-assistants';
  if (p === '/guides/custom-development-vs-website-builders') {
    window.history.replaceState({}, '', '/services/business-websites');
    return 'service-business-websites';
  }
  if (p.startsWith('/case-studies/humble-beginnings')) return 'cs-humble-beginnings';
  if (p === '/case-studies' || p === '/case-studies/') return 'case-studies';
  return 'home';
};

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [assistantReady, setAssistantReady] = useState(false);
  const [homeSectionsReady, setHomeSectionsReady] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [route, setRoute] = useState<Route>(getRoute);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingHomeHashRef = useRef<string | null>(null);
  const showSpeedInsights = import.meta.env.PROD && !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const servicePageKey = SERVICE_ROUTE_PAGES[route];

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
      pendingHomeHashRef.current = hash ? hash.replace(/^#/, '') : null;
      setRoute('home');
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('docs:exit', onDocsExit as EventListener);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('docs:exit', onDocsExit as EventListener);
    };
  }, []);

  useEffect(() => {
    if (route !== 'home') {
      setHomeSectionsReady(false);
      return;
    }

    // Hash jumps (docs/service breadcrumbs) target lazy below-fold sections — mount them now.
    if (pendingHomeHashRef.current) {
      setHomeSectionsReady(true);
      preloadChunks();
    }

    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHomeSectionsReady(true);
          preloadChunks();
          io.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [route]);

  useEffect(() => {
    if (route !== 'home' || !homeSectionsReady) return;
    const id = pendingHomeHashRef.current;
    if (!id) return;

    let cancelled = false;
    let attempts = 0;

    const scrollToTarget = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        pendingHomeHashRef.current = null;
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const offsetPosition = elementRect - bodyRect - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        return;
      }
      if (attempts++ < 60) {
        window.setTimeout(scrollToTarget, 50);
        return;
      }
      pendingHomeHashRef.current = null;
    };

    scrollToTarget();
    return () => {
      cancelled = true;
    };
  }, [route, homeSectionsReady]);

  useEffect(() => {
    if (!loaded) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleId: number | undefined;
    const timerId = window.setTimeout(() => {
      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(() => setAssistantReady(true), { timeout: 3000 });
      } else {
        setAssistantReady(true);
      }
    }, 2400);

    return () => {
      window.clearTimeout(timerId);
      if (idleId !== undefined) {
        win.cancelIdleCallback?.(idleId);
      }
    };
  }, [loaded]);

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
    </motion.div>
  );

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-clip selection:bg-accent selection:text-white relative">
      <PageLoader onComplete={() => setLoaded(true)} minDuration={900} />

      <>
        {route === 'docs' && (
          <Suspense key="docs" fallback={null}>
            <DocsPage onOpenContact={() => setContactOpen(true)} />
          </Suspense>
        )}

        {route === 'faq' && pageShell(
          <Suspense key="faq" fallback={null}>
            <FAQPage onOpenContact={() => setContactOpen(true)} />
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

        {servicePageKey && pageShell(
          <Suspense key={route} fallback={null}>
            <ServicePage pageKey={servicePageKey} onOpenContact={() => setContactOpen(true)} />
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
            {homeSectionsReady && (
              <>
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
              </>
            )}
          </motion.main>
        )}
      </>

      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>

      <CookieBanner />
      {assistantReady && (
        <Suspense fallback={null}>
          <ArdenoAIWidget />
        </Suspense>
      )}
      {showSpeedInsights && <SpeedInsights />}
    </div>
  );
};

export default App;
