import React, { useState, useEffect, Suspense, lazy } from 'react';

const ArdenoWebsite = lazy(() => import('./components/Website/ArdenoWebsite'));
const FoundersPage = lazy(() => import('./components/Website/Founders'));

const Website: React.FC = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const syncRoute = () => setPathname(window.location.pathname);
    const onDocsExit = (e: Event) => {
      const customEvent = e as CustomEvent<{ hash?: string }>;
      const hash = customEvent.detail?.hash || '';
      window.history.pushState({}, '', hash ? '/' + hash : '/');
      setPathname('/');
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('docs:exit', onDocsExit);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('docs:exit', onDocsExit);
    };
  }, []);

  if (pathname.startsWith('/founders')) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#f4f4f2]" aria-label="Loading founders" />}>
        <FoundersPage />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{ minHeight: '100dvh', background: '#f4f4f2' }}
          aria-label="Loading Ardeno Studio"
        />
      }
    >
      <ArdenoWebsite />
    </Suspense>
  );
};

export default Website;
