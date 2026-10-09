import { useLayoutEffect, type RefObject } from 'react';
import { ARMS, CONTACT_HASH, EXTEND, FRAME, SOFT, SPRAY, TIMINGS, TRAIL, TRAIL_LAG, homeward, landing, measure, outward, pose, rider, splashes, timeline, trailScale, widthFor, type Step } from './ContactSheet';
import './tabEntrance.css';

// The "Let's talk" tab's entrance on a fresh page load, on desktop, where it hangs from the top of the screen. It is the landing of
// the "Let's talk" sheet's closing (ContactSheet.tsx), so the site has one liquid motion: a droplet swells into the middle of the
// screen with a jelly wobble, swirls out and swoops up to the top edge, splashes against it (a puddle that runs out along the edge and
// throws a few drops), then drips down into the tab, which swings like a hanging tag as it settles and rolls its label in. Everything
// after the droplet appears is the closing's own choreography, built by the same functions; only the start differs (the closing
// gathers the droplet out of the sheet instead).
//
// The liquid is drawn the way the sheet draws it (the goo filter over a stand-in for the tab, the droplet, its trailing drops and the
// splash's drops, with the droplet's highlight and shadow), in a layer of its own outside the sheet's dialog, so the page stays usable.
// Phones (where the tab is a pill inside the header bar), reduced motion and a page opened on the sheet get no entrance. Pressing the
// tab, opening the sheet or the header resizing part way through ends it at once, with the tab at rest.

const START = 300; // ms after the header mounts
const LEAD = 200; // but at least this long after the liquid has been set up
const APPEAR = { response: 0.22, damping: 0.6 }; // the spring the droplet swells into the middle on
let layers = 0;

// How big the droplet is `ms` after it starts to swell: a spring from nothing, with a little overshoot.
function swell(ms: number) {
  const w = 2 * Math.PI / (APPEAR.response * 1000);
  const z = APPEAR.damping;
  const wd = w * Math.sqrt(1 - z * z);
  return ms <= 0 ? 0.01 : Math.max(0.01, 1 - Math.exp(-z * w * ms) * (Math.cos(wd * ms) + (z * w / wd) * Math.sin(wd * ms)));
}

function splashIn(tab: HTMLElement) {
  const mounted = performance.now();
  const running: Animation[] = [];
  const track = (animation: Animation) => { running.push(animation); return animation; };
  let layer: HTMLDivElement | null = null;
  let watch: ResizeObserver | null = null;
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    running.forEach(animation => animation.cancel());
    layer?.remove();
    watch?.disconnect();
    tab.removeEventListener('pointerdown', end);
    window.removeEventListener('hashchange', end);
  };
  // Hidden until the liquid lands (this runs before the first paint).
  const hidden = track(tab.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1000, iterations: Infinity }));
  tab.addEventListener('pointerdown', end);
  window.addEventListener('hashchange', end);

  const play = () => {
    const g = measure(tab, null);
    if (!g.hangs) { end(); return; } // not hanging from the top of the screen after all
    const t = TIMINGS;
    const C = t.close;
    const d = g.drop;
    const id = `tab-entrance-goo-${++layers}`;
    layer = document.createElement('div');
    layer.className = 'tab-entrance';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--accent', getComputedStyle(tab).backgroundColor);
    const blob = `<span class="contact-goo-blob" style="width:${d}px;height:${d}px"><span></span></span>`;
    layer.innerHTML = `<svg class="contact-goo-defs" width="0" height="0"><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="${Math.round(d * 0.13)}" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter></svg>`
      + `<span class="contact-goo-shadow" style="width:${d}px;height:${d}px"></span>`
      + `<div class="contact-goo" style="filter:url(#${id})"><span class="contact-goo-tab" style="left:${g.tab.x}px;top:${g.tab.y - EXTEND}px;width:${g.tab.w}px;height:${g.tab.h + EXTEND}px;border-radius:${g.tab.radius};transform-origin:50% ${EXTEND}px"></span>${blob.repeat(ARMS.length + SPRAY.length)}${blob.repeat(TRAIL.length)}</div>`
      + `<span class="contact-goo-shine" style="width:${d}px;height:${d}px"></span>`;
    const goo = layer.querySelector<HTMLElement>('.contact-goo')!;
    const ghost = layer.querySelector<HTMLElement>('.contact-goo-tab')!;
    const blobs = Array.from(goo.querySelectorAll<HTMLElement>(':scope > .contact-goo-blob'));
    const splashEls = blobs.slice(0, ARMS.length + SPRAY.length);
    const trail = blobs.slice(ARMS.length + SPRAY.length);
    const shine = layer.querySelector<HTMLElement>('.contact-goo-shine')!;
    const shadow = layer.querySelector<HTMLElement>('.contact-goo-shadow')!;
    document.body.append(layer);
    // Every animation is made now and waits out the lead in its first frame (the droplet a speck in the middle), so the browser sets
    // up the goo filter and the moving parts then, not on the droplet's first frames.
    const land = landing(g, t);
    const S = t.splash;
    const hit = C.impact;
    const total = land.swap;
    // The droplet's path: the closing's, from where it sets off (C.liquid), after swelling into the middle from nothing with a
    // jelly wobble along the way it will leave.
    const back = homeward(g, t, outward(g, t).fastest, land);
    const depart = back[0][1].angle;
    const frames = Math.max(6, Math.round(C.liquid / FRAME));
    const appear = Array.from({ length: frames }, (_, i): Step => {
      const ms = C.liquid * i / frames;
      const s = swell(ms);
      const jelly = 0.09 * Math.exp(-ms / 140) * Math.sin(2 * Math.PI * ms / 170);
      return [ms, { x: g.vw / 2, y: g.vh / 2, angle: depart, sx: s * (1 + jelly), sy: s * (1 - jelly) }];
    });
    const steps = [...appear, ...back.filter(([ms]) => ms >= C.liquid)];
    const lead = Math.max(LEAD, START - (performance.now() - mounted));
    trail.forEach((el, i) => track(el.animate(timeline(total, steps.map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, trailScale(i, ms, false, t)), easing: ease ?? 'linear' }])), { duration: total, delay: lead + i * TRAIL_LAG, fill: 'both' })));
    const drops = splashes(g, t, land);
    splashEls.forEach((el, i) => track(el.animate(timeline(total, drops[i].map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, 1), easing: ease ?? 'linear' }])), { duration: total, delay: lead, fill: 'both' })));
    const grown = (ms: number) => ms < C.liquid ? swell(ms) : 1;
    const ride: [number, number, number, number] = [40, 200, hit - 40, hit + 10];
    track(shine.animate(rider(steps, total, ride, 0, 0, d, ms => `scale(${grown(ms).toFixed(3)})`), { duration: total, delay: lead, fill: 'both' }));
    track(shadow.animate(rider(steps, total, ride, 5, 16, d, ms => `scale(${(1.15 * grown(ms)).toFixed(3)}, ${(0.72 * grown(ms)).toFixed(3)})`), { duration: total, delay: lead, fill: 'both' }));
    // The stand-in for the tab, as in the closing: nothing until the hit, then the puddle, which pulls together and drips down into
    // the tab on a spring, swinging as it forms.
    const formed = (ms: number) => { const sy = land.spring(ms); return `rotate(${land.swing(ms).toFixed(3)}deg) scale(${widthFor(sy).toFixed(4)}, ${sy.toFixed(4)})`; };
    const n = Math.max(4, Math.round((land.swap - land.start) / FRAME));
    track(ghost.animate(timeline(total, [
      [0, { opacity: 1, transform: 'scale(.55, 0)' }],
      [hit, { opacity: 1, transform: 'scale(.6, 0)', easing: 'cubic-bezier(.2,.7,.3,1)' }],
      [hit + S.splat, { opacity: 1, transform: 'scale(1.3, .22)', easing: SOFT }],
      ...Array.from({ length: n + 1 }, (_, i): [number, Keyframe] => [land.start + (land.swap - land.start) * i / n, { opacity: 1, transform: formed(land.still * i / n) }]),
    ]), { duration: total, delay: lead, fill: 'both' }));
    // The liquid goes in the same frame the real tab appears, which carries on along the same spring and swing, then rolls its
    // label in.
    track(goo.animate([{ opacity: 1, easing: 'step-end' }, { opacity: 0 }], { duration: total, delay: lead, fill: 'both' }));
    track(tab.animate([{ opacity: 0 }, { opacity: 0 }], { duration: lead + land.swap }));
    hidden.cancel();
    const length = land.end - land.swap;
    const k = Math.max(4, Math.round(length / FRAME));
    track(tab.animate(Array.from({ length: k + 1 }, (_, i): Keyframe => ({ transform: i === k ? 'rotate(0deg) scale(1, 1)' : formed(land.still + length * i / k) })), { duration: length, delay: lead + land.swap, fill: 'backwards' }));
    Array.from(tab.children as HTMLCollectionOf<HTMLElement>).forEach((part, i) => track(part.animate([{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340, delay: lead + land.swap + 20 + i * 40, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' })));
    Promise.all(running.filter(animation => animation !== hidden).map(animation => animation.finished)).then(end, () => {});

    // A header that resizes before the tab appears (the bar compacting on scroll) would leave the stand-in the wrong size.
    const swapAt = performance.now() + lead + land.swap;
    watch = new ResizeObserver(() => {
      if (performance.now() < swapAt && (Math.abs(tab.offsetWidth - g.tab.w) > 1 || Math.abs(tab.offsetHeight - g.tab.h) > 1)) end();
    });
    watch.observe(tab);
  };

  // Measured once the fonts are in (the label sets the tab's width), any resize of the header has finished (a page reloaded part
  // way down starts compact) and the page has drawn its first frame and gone quiet: the first render and the work queued behind it
  // are long stalls, and the liquid, redrawn on the main thread every frame, starts after them.
  const frame = () => new Promise(done => requestAnimationFrame(done));
  const idle = () => new Promise(done => window.requestIdleCallback ? window.requestIdleCallback(done, { timeout: 500 }) : done(null));
  Promise.race([document.fonts?.ready, new Promise(done => window.setTimeout(done, 1200))])
    .then(() => Promise.all(tab.getAnimations().filter(animation => 'transitionProperty' in animation).map(animation => animation.finished.catch(() => {}))))
    .then(frame).then(frame).then(idle).then(frame)
    .then(() => { if (!over) play(); });
  return end;
}

// Plays the entrance once per document load (`play`), on desktop only.
export function useTabEntrance(tabRef: RefObject<HTMLElement | null>, play: boolean) {
  useLayoutEffect(() => {
    const tab = tabRef.current;
    if (!play || !tab || window.location.hash === CONTACT_HASH || !window.matchMedia('(min-width: 761px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return splashIn(tab);
  }, [tabRef, play]);
}
