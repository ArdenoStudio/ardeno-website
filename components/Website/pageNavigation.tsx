import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { spring } from 'framer-motion';
import { findProject } from '../../data/portfolio';
import './pageNavigation.css';

type PageLocation = { pathname: string; search: string; hash: string; key: string };
type Destination = { url: URL; key: string; pop: boolean; label: string };
const routeKey = () => `ardeno-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const readLocation = (): PageLocation => ({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash, key: window.history.state?.ardenoKey ?? routeKey() });
const isPage = (path: string) => path === '/' || path === '/contact' || path === '/founders' || path === '/projects' || path.startsWith('/projects/') || path === '/docs' || path.startsWith('/docs/');
const destinationLabel = (path: string) => path === '/contact' ? 'Contact' : path === '/founders' ? 'Founders' : path.startsWith('/projects/') ? findProject(path.split('/')[2])?.title ?? 'Projects' : path === '/projects' ? 'All projects' : path.startsWith('/docs') ? 'Studio docs' : 'Home';
export const requestPageNavigation = (href: string) => window.dispatchEvent(new CustomEvent('ardeno:navigate', { detail: { href } }));
// Use Motion's physical spring as the timing curve for the browser's incoming snapshot.
const [settleDuration, ...settleCurve] = spring({ stiffness: 340, damping: 32, mass: 0.8, keyframes: [0, 1], restDelta: 0.003, restSpeed: 0.03 }).toString().split(' ');

// Keep native anchors (including new-tab and modifier clicks) while giving internal pages one shared transition.
export function usePageNavigation(enabled = true) {
  const [location, setLocation] = useState<PageLocation>(readLocation);
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const [nativeMotion, setNativeMotion] = useState(false);
  const [label, setLabel] = useState('');
  const current = useRef(location);
  const pending = useRef<Destination | null>(null);
  const scrollPositions = useRef(new Map<string, number>());
  const restore = useRef<{ top?: number; hash: string; focusHeading: boolean } | null>(null);
  const phaseRef = useRef(phase);
  const covered = useRef(false);
  const nativeTransition = useRef<ViewTransition | null>(null);
  const nativeMode = useRef(false);
  const transitionVersion = useRef(0);
  const pageReady = useRef<(() => void) | null>(null);
  current.current = location;
  phaseRef.current = phase;

  const changePhase = (next: typeof phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const publishLocation = (next: PageLocation) => {
    current.current = next;
    setLocation(next);
  };

  const commit = (destination: Destination) => {
    if (!destination.pop) window.history.pushState({ ardenoKey: destination.key }, '', `${destination.url.pathname}${destination.url.search}${destination.url.hash}`);
    else window.history.replaceState({ ...window.history.state, ardenoKey: destination.key }, '', window.location.href);
    restore.current = { top: destination.pop ? scrollPositions.current.get(destination.key) : undefined, hash: destination.url.hash, focusHeading: true };
    // A fresh page starts at the top before its header mounts. This avoids capturing
    // a compact header from the previous page's footer scroll position.
    if (!destination.pop && (!destination.url.hash || destination.url.hash === '#top')) window.scrollTo({ top: 0, behavior: 'instant' });
    publishLocation({ pathname: destination.url.pathname, search: destination.url.search, hash: destination.url.hash, key: destination.key });
    pending.current = null;
  };

  useEffect(() => {
    if (!enabled) return;
    window.history.replaceState({ ...window.history.state, ardenoKey: current.current.key }, '', window.location.href);
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const syncTimers = new Set<number>();

    // Native fragments and custom pushState handlers need their own entry keys, too.
    // Section links stay immediate; only a change of page gets a transition.
    const syncSamePage = (pop = false) => {
      const url = new URL(window.location.href);
      if (url.pathname !== current.current.pathname || url.search !== current.current.search) return;
      const stateKey = window.history.state?.ardenoKey;
      if (!pop && url.hash === current.current.hash && stateKey === current.current.key) return;
      const key = pop ? stateKey ?? routeKey() : stateKey && stateKey !== current.current.key ? stateKey : routeKey();
      window.history.replaceState({ ...window.history.state, ardenoKey: key }, '', window.location.href);
      if (pop) {
        transitionVersion.current++;
        nativeTransition.current?.skipTransition();
        nativeTransition.current = null;
        pageReady.current?.();
        pageReady.current = null;
        nativeMode.current = false;
        setNativeMotion(false);
        pending.current = null;
        restore.current = { top: scrollPositions.current.get(key), hash: url.hash, focusHeading: false };
        if (phaseRef.current !== 'idle') changePhase('reveal');
      }
      publishLocation({ pathname: url.pathname, search: url.search, hash: url.hash, key });
    };

    const navigate = (url: URL, pop = false) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollPositions.current.set(current.current.key, window.scrollY);
      const destination = { url, pop, key: pop ? window.history.state?.ardenoKey ?? routeKey() : routeKey(), label: destinationLabel(url.pathname) };
      const preparePage = url.pathname.startsWith('/docs') ? import('../Docs/DocsPage') : url.pathname === '/founders' ? import('./Founders') : Promise.resolve();
      pending.current = destination;
      setLabel(destination.label);
      // A second click replaces the current transition, including one still preparing its snapshot.
      const version = ++transitionVersion.current;
      nativeTransition.current?.skipTransition();
      pageReady.current?.();
      pageReady.current = null;
      if (reducedMotion) {
        nativeMode.current = false;
        nativeTransition.current = null;
        setNativeMotion(false);
        commit(destination); covered.current = false; changePhase('idle');
      }
      else if (typeof document.startViewTransition === 'function') {
        const backwards = url.pathname.split('/').filter(Boolean).length < current.current.pathname.split('/').filter(Boolean).length;
        nativeMode.current = true;
        setNativeMotion(true);
        covered.current = true;
        changePhase('cover');
        const transition = document.startViewTransition(async () => {
          await preparePage;
          if (version !== transitionVersion.current) return;
          const ready = new Promise<void>(resolve => { pageReady.current = resolve; });
          // Finish the route render before taking the new snapshot. The orientation effect
          // restores scroll/focus and resolves ready, including lazy documentation routes.
          flushSync(() => commit(destination));
          await ready;
        });
        nativeTransition.current = transition;
        void transition.ready.then(() => {
          if (version !== transitionVersion.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { transition.skipTransition(); return; }
          document.documentElement.animate(
            [{ transform: `translateY(${backwards ? -8 : 10}px)` }, { transform: 'translateY(0px)' }],
            { duration: parseFloat(settleDuration), easing: settleCurve.join(' '), fill: 'both', pseudoElement: '::view-transition-new(root)' },
          );
        }).catch(() => { /* A skipped snapshot still completes the route update. */ });
        void transition.finished.then(() => {
          if (version !== transitionVersion.current) return;
          nativeTransition.current = null;
          nativeMode.current = false;
          setNativeMotion(false);
          covered.current = false;
          changePhase('idle');
        }).catch(() => {
          if (version !== transitionVersion.current) return;
          nativeTransition.current = null;
          nativeMode.current = false;
          setNativeMotion(false);
          covered.current = false;
          if (pending.current) commit(pending.current);
          changePhase('idle');
        });
      }
      else if (phaseRef.current === 'cover' && covered.current) {
        // A history event can arrive after the cover ended but before orientation.
        // Commit it now rather than waiting for an animation that already finished.
        commit(destination);
      } else {
        if (phaseRef.current !== 'cover') covered.current = false;
        changePhase('cover');
      }
    };

    const captureClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const before = new URL(window.location.href);
      const beforeStateKey = window.history.state?.ardenoKey;
      scrollPositions.current.set(current.current.key, window.scrollY);
      // Run after React's handlers and native anchor activation. This also catches
      // Hero's pushState(null, '', '#work') and the docs section buttons.
      const timer = window.setTimeout(() => {
        syncTimers.delete(timer);
        const after = new URL(window.location.href);
        if (after.pathname !== before.pathname || after.search !== before.search) return;
        if (after.href === before.href && window.history.state?.ardenoKey === beforeStateKey) return;
        syncSamePage();
      }, 0);
      syncTimers.add(timer);
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !isPage(url.pathname.replace(/\/+$/, '') || '/')) return;
      if (url.pathname === current.current.pathname && url.search === current.current.search) return;
      event.preventDefault();
      navigate(url);
    };
    const pop = () => {
      const url = new URL(window.location.href);
      if (url.pathname === current.current.pathname && url.search === current.current.search) {
        scrollPositions.current.set(current.current.key, window.scrollY);
        syncSamePage(true);
        return;
      }
      navigate(url, true);
    };
    const hashChange = () => syncSamePage();
    const docsExit = (event: Event) => {
      const hash = (event as CustomEvent<{ hash?: string }>).detail?.hash ?? '';
      navigate(new URL(`/${hash}`, window.location.origin));
    };
    const requestedNavigation = (event: Event) => {
      const href = (event as CustomEvent<{ href: string }>).detail?.href;
      if (!href) return;
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin || !isPage(url.pathname)) return;
      if (url.pathname === current.current.pathname && url.search === current.current.search) return;
      navigate(url);
    };
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduceMotion = () => { if (motionPreference.matches) nativeTransition.current?.skipTransition(); };
    document.addEventListener('click', captureClick, true);
    document.addEventListener('click', click);
    window.addEventListener('popstate', pop);
    window.addEventListener('hashchange', hashChange);
    window.addEventListener('docs:exit', docsExit);
    window.addEventListener('ardeno:navigate', requestedNavigation);
    motionPreference.addEventListener('change', reduceMotion);
    return () => {
      document.removeEventListener('click', captureClick, true);
      document.removeEventListener('click', click);
      window.removeEventListener('popstate', pop);
      window.removeEventListener('hashchange', hashChange);
      window.removeEventListener('docs:exit', docsExit);
      window.removeEventListener('ardeno:navigate', requestedNavigation);
      motionPreference.removeEventListener('change', reduceMotion);
      transitionVersion.current++;
      nativeTransition.current?.skipTransition();
      pageReady.current?.();
      pageReady.current = null;
      syncTimers.forEach(timer => window.clearTimeout(timer));
      window.history.scrollRestoration = previousRestoration;
    };
  }, [enabled]);

  useLayoutEffect(() => {
    if (!restore.current) return;
    let frame = 0;
    let retry = 0;
    let attempts = 0;
    const orient = () => {
      const position = restore.current;
      if (!position) return;
      const heading = position.focusHeading ? document.querySelector<HTMLElement>('main h1') : null;
      if (position.focusHeading && !heading && attempts++ < 60) {
        // Rendering is paused during a native transition; do not depend on animation frames.
        if (nativeMode.current) retry = window.setTimeout(orient, 16);
        else frame = requestAnimationFrame(orient);
        return;
      }
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
      if (position.top !== undefined) window.scrollTo({ top: position.top, behavior: 'instant' });
      else if (position.hash) {
        let target: HTMLElement | null = null;
        try { target = document.getElementById(decodeURIComponent(position.hash.slice(1))); } catch { /* An invalid fragment still opens the page. */ }
        if (target) target.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: position.top ?? 0, behavior: 'instant' });
      } else window.scrollTo({ top: position.top ?? 0, behavior: 'instant' });
      restore.current = null;
      pageReady.current?.();
      pageReady.current = null;
      if (phaseRef.current === 'cover') changePhase('reveal');
    };
    if (nativeMode.current) orient();
    else frame = requestAnimationFrame(orient);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(retry); };
  }, [location]);

  const animationComplete = () => {
    if (nativeMode.current) return;
    if (phaseRef.current === 'cover') {
      if (covered.current) return;
      covered.current = true;
      if (pending.current) commit(pending.current);
      else changePhase('reveal');
    } else if (phaseRef.current === 'reveal') { covered.current = false; changePhase('idle'); }
  };

  const announcement = <span className="sr-only" role="status" aria-live="polite">{phase === 'idle' ? '' : `Opening ${label}`}</span>;
  const transitionProps = {
    initial: false as const,
    animate: { '--page-opacity': !nativeMotion && phase === 'cover' ? 0 : 1, '--page-y': !nativeMotion && phase === 'cover' ? '6px' : '0px' },
    transition: {
      '--page-opacity': { duration: phase === 'cover' ? 0.09 : 0.22, ease: 'easeOut' as const },
      '--page-y': { type: 'spring' as const, stiffness: phase === 'cover' ? 500 : 180, damping: phase === 'cover' ? 35 : 26, mass: 0.65, restDelta: 0.05, restSpeed: 3 },
    },
    // Swap as soon as the outgoing page has faded, without waiting for the spring's tail.
    onUpdate: (latest: { '--page-opacity'?: number | string }) => {
      const opacity = latest['--page-opacity'];
      if (!nativeMode.current && phaseRef.current === 'cover' && !covered.current && pending.current && typeof opacity === 'number' && opacity <= 0.01) {
        covered.current = true;
        commit(pending.current);
      }
    },
    onAnimationComplete: animationComplete,
  };
  return { location, announcement, phase, nativeMotion, transitionProps };
}
