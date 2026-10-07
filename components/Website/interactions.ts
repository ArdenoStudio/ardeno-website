import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { burstSparksAt } from './clickSpark';

// Controls whose ink fill grows from the point where the pointer enters, and which burst sparks when clicked.
// The contact headline is one big button whose ring arrow takes the fill.
const FILL = '.site-button, .contact-headline, .contact-chip';
const SPARKS = '.site-button:not([type="submit"]):not(:disabled), .contact-headline, .contact-chip';

function placeFill(host: HTMLElement, x: number, y: number) {
  const el = host.querySelector<HTMLElement>('.contact-arrow') ?? host;
  const box = el.getBoundingClientRect();
  // A pointer that enters elsewhere on the headline fills the ring from its nearest edge.
  const fx = Math.min(Math.max(x - box.left, 0), box.width);
  const fy = Math.min(Math.max(y - box.top, 0), box.height);
  el.style.setProperty('--fx', `${Math.round(fx)}px`);
  el.style.setProperty('--fy', `${Math.round(fy)}px`);
  el.style.setProperty('--fd', `${Math.ceil(Math.hypot(box.width, box.height) * 2)}px`);
}

// One set of document-level listeners covers every matching button, including ones inside dialogs.
export function useSiteInteractions() {
  useEffect(() => {
    const crossing = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.(FILL) as HTMLElement | null;
      if (!el || (event.relatedTarget instanceof Node && el.contains(event.relatedTarget))) return;
      placeFill(el, event.clientX, event.clientY);
    };
    const click = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.(SPARKS) as HTMLElement | null;
      if (!el) return;
      // Keyboard activation of the headline sparks from its ring rather than from the middle of the words.
      const origin = event.detail === 0 ? el.querySelector<HTMLElement>('.contact-arrow') ?? el : el;
      // data-sparks lists the palette (custom property names) for controls that sit on a colour where the default would vanish.
      burstSparksAt(origin, event.clientX, event.clientY, el.dataset.sparks?.split(' ') ?? ['--accent', '--ink', '--paper']);
    };
    document.addEventListener('pointerover', crossing);
    document.addEventListener('pointerout', crossing);
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('pointerover', crossing);
      document.removeEventListener('pointerout', crossing);
      document.removeEventListener('click', click);
    };
  }, []);
}

// Marks an element data-in the first time it scrolls into view, so CSS can play its entrance once.
// Reduced motion (or no IntersectionObserver) marks it straight away.
export function useReveal(target: RefObject<HTMLElement | null>, threshold = 0.2) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      el.setAttribute('data-in', '');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.setAttribute('data-in', '');
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, threshold]);
}

// Lets `target` lean toward the pointer as it comes near, and spring back when the pointer leaves `host`. It sets --lx and --ly
// (px) on the target, which CSS applies as `translate`. Fine pointers only; reduced motion keeps it still.
export function useMagnet(host: RefObject<HTMLElement | null>, target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const area = host.current;
    const el = target.current;
    if (!area || !el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let last = '';
    const lean = (x: number, y: number) => {
      const next = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      if (next === last) return;
      last = next;
      el.style.setProperty('--lx', `${x.toFixed(1)}px`);
      el.style.setProperty('--ly', `${y.toFixed(1)}px`);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (reduced.matches) return lean(0, 0);
      // The box moves with the lean, so take the current offset back out to find where the element really sits.
      const [tx, ty] = getComputedStyle(el).translate.split(' ').map(part => parseFloat(part) || 0);
      const box = el.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2 - (tx || 0));
      const dy = event.clientY - (box.top + box.height / 2 - (ty || 0));
      const dist = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - dist / (box.width * 3.2));
      if (!dist || !pull) return lean(0, 0);
      const reach = Math.min(dist * 0.25, box.width * 0.14) * pull;
      lean((dx / dist) * reach, (dy / dist) * reach);
    };
    const leave = () => lean(0, 0);
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerleave', leave);
    return () => {
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerleave', leave);
    };
  }, [host, target]);
}

// Keeps --ix/--iy/--iw/--ih on `host` pointing at the element matching `selector`, so a CSS indicator can spring to it.
// The first placement is not animated; `data-ready` switches the transition on afterwards.
export function useSlidingIndicator(host: RefObject<HTMLElement | null>, selector: string | null, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = host.current;
    if (!root) return;
    const place = () => {
      const target = selector ? root.querySelector<HTMLElement>(selector) : null;
      if (!target) {
        root.style.setProperty('--io', '0');
        return;
      }
      root.style.setProperty('--ix', `${target.offsetLeft}px`);
      root.style.setProperty('--iy', `${target.offsetTop}px`);
      root.style.setProperty('--iw', `${target.offsetWidth}px`);
      root.style.setProperty('--ih', `${target.offsetHeight}px`);
      root.style.setProperty('--io', '1');
    };
    place();
    const frame = requestAnimationFrame(() => root.setAttribute('data-ready', ''));
    const observer = new ResizeObserver(place);
    observer.observe(root);
    document.fonts?.ready.then(place);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, selector, ...deps]);
}
