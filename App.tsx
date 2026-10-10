import React, { Suspense, lazy, useEffect } from 'react';
import { motion } from 'framer-motion';
import { applySeoToDocument } from './seo';
import { usePageNavigation, requestPageNavigation } from './components/Website/pageNavigation';

// The contact page became the Let's talk sheet, which opens on #lets-talk. Its old address (and /?contact, where the hosts redirect
// /contact) opens the homepage with the sheet down. This runs before anything reads the address, so the router starts on '/'.
if (typeof window !== 'undefined') {
  const start = new URL(window.location.href);
  const oldPage = start.pathname.replace(/\/+$/, '') === '/contact';
  if (oldPage || start.searchParams.has('contact')) {
    start.searchParams.delete('contact');
    window.history.replaceState(window.history.state, '', `${oldPage ? '/' : start.pathname}${start.search}#lets-talk`);
  }
}

// The legacy (?legacy=true) dark site ships in its own chunk — it is only
// fetched when the backdoor query param is present, never on the live path.
const LegacyApp = lazy(() => import('./LegacyApp'));
const ArdenoWebsite = lazy(() => import('./components/Website/ArdenoWebsite'));
const FoundersPage = lazy(() => import('./components/Website/Founders'));
const LoaderLab = import.meta.env.DEV ? lazy(() => import('./.Codex-design/lab/page')) : null;
const DocsPage = lazy(() =>
  import('./components/Docs/DocsPage').then(m => ({ default: m.DocsPage }))
);

const Website: React.FC = () => {
  const isLoaderLab = import.meta.env.DEV && new URLSearchParams(window.location.search).get('design_lab') === 'loaders';
  const isLegacy = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('legacy') === 'true';
  const { location: { pathname }, announcement, phase, nativeMotion, transitionProps } = usePageNavigation(!isLegacy && !isLoaderLab);
  useEffect(() => {
    if (!isLegacy && pathname.startsWith('/docs')) applySeoToDocument('docs');
  }, [pathname, isLegacy]);

  if (isLoaderLab && LoaderLab) return <Suspense fallback={<div className="min-h-dvh bg-[#f4f4f2]" />}><LoaderLab /></Suspense>;
  if (isLegacy) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#080809]" aria-label="Loading legacy site" />}>
        <LegacyApp />
      </Suspense>
    );
  }

  const pageContent = pathname.startsWith('/docs') ? (
      <div className="min-h-screen bg-[var(--ardeno-paper)] text-[var(--ardeno-ink)] selection:bg-[var(--ardeno-accent)] selection:text-white">
        <Suspense fallback={<div className="min-h-dvh bg-[#f4f4f2]" aria-label="Loading documentation" />}>
          <DocsPage onOpenContact={() => requestPageNavigation('/#lets-talk')} />
        </Suspense>
      </div>
    ) : pathname.replace(/\/+$/, '') === '/founders' ? (
      <Suspense fallback={<div className="min-h-dvh bg-[#f4f4f2]" aria-label="Loading founders" />}>
        <FoundersPage />
      </Suspense>
    ) : (
    <Suspense fallback={<div className="min-h-dvh bg-[#f4f4f2]" aria-label="Loading Ardeno Studio" />}>
      <ArdenoWebsite pathname={pathname} />
    </Suspense>
  );
  return <>{announcement}<motion.div className="page-flow" data-phase={phase} data-native-transition={nativeMotion} {...transitionProps}>{pageContent}</motion.div></>;
};

export default Website;
