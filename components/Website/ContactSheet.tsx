import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Mail, X } from 'lucide-react';
import { ContactForm, prepareContactDraft } from './ContactForm';
import './contactSheet.css';

// "Let's talk": the enquiry form as a sheet that the header's hanging tab turns into. There is no separate contact page.
//
// Opening: the tab winds up (squeezes upward as its label fades), a droplet swells from its bottom edge on a thinning neck and
// pinches off while the tab recoils and drains away, the droplet swirls once round the screen with a liquid tail, overshoots the
// middle and settles with a jelly wobble, takes a breath in and bursts open into the sheet. Closing: the sheet gathers back into a
// droplet, which wobbles as it turns to liquid and swirls back; the tab re-forms and reaches down to meet it, gulps it up, and the
// real tab takes over with a jelly wobble while "Let's talk" rolls back in.
//
// The liquid is the "gooey" filter (blur, then a sharp alpha threshold) over a layer of blobs, the technique React Bits' Blob Cursor
// and Gooey Nav use, so drops that touch melt together. The droplet stretches along its direction of travel and carries a fixed
// highlight and a soft shadow, so it reads as liquid above the page. Only transforms, opacity and clip-path animate.
//
// The sheet is open while the address ends in #lets-talk, so every contact button and link (the tab, the menu, the footer, the
// contact band, old /contact links, which redirect to /?contact) just goes there, and the browser's Back button closes it. It lives in
// SiteHeader beside the tab it comes from. Reduced motion fades it in and out. Styles are in contactSheet.css.

export const CONTACT_HASH = '#lets-talk';

// Opens the sheet on this page, first prefilling the form (the contact band's email field and quick starts pass these).
export function openContactSheet(email?: string, message?: string) {
  prepareContactDraft(email, message);
  if (window.location.hash !== CONTACT_HASH) window.location.hash = CONTACT_HASH;
}

type Phase = 'closed' | 'opening' | 'open' | 'closing';
// The tab's box and corners when the sheet opened or closed, and the droplet's diameter for this screen.
type Geometry = { x: number; y: number; w: number; h: number; radius: string; drop: number; vw: number; vh: number };
type Pose = { x: number; y: number; angle: number; sx: number; sy: number };

// The choreography, in ms from the start of the opening or the closing.
const OPEN = { windUp: 130, swell: 260, neck: 380, pinch: 430, drained: 620, arrive: 1150, settled: 1480, burst: 1540, expand: 540 };
const CLOSE = { gathered: 450, liquid: 600, regrow: 1040, reach: 1220, back: 1320, pulled: 1370, swallow: 1440, gulped: 1480, jelly: 520 };
const TRAIL = [1, 0.76, 0.6, 0.46, 0.34]; // the droplet and the drops trailing it, as fractions of its size
const TRAIL_LAG = 12; // ms between drops: close enough at full speed for the goo to melt them into one tail
const SOFT = 'cubic-bezier(.35,0,.25,1)';
const FRAME = 1000 / 60;

function measure(tab: HTMLElement | null): Geometry {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const drop = Math.round(Math.min(84, Math.max(54, Math.min(vw, vh) * 0.095)));
  const box = tab?.getBoundingClientRect();
  if (!tab || !box || !box.width) return { x: vw - 144, y: 0, w: 118, h: 64, radius: '0px 0px 12px 12px', drop, vw, vh };
  const style = getComputedStyle(tab);
  const radius = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].join(' ');
  return { x: box.left, y: Math.max(0, box.top), w: box.width, h: box.bottom - Math.max(0, box.top), radius, drop, vw, vh };
}

// Eases in and out with a gentle middle (top speed about 1.6 times the average), starting and ending at rest. The way out mixes
// in some constant speed too, so the droplet leaves the drip already moving and reaches the middle fast enough to overshoot.
const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
// The droplet stretches along an axis, not a direction: turned 180° it is the same shape, so angles unwrap with a 180° period and
// it can reverse (as it does at the far end of its overshoot) without spinning.
const axis = (angle: number, ref: number) => { let a = angle; while (a - ref > 90) a -= 180; while (a - ref < -90) a += 180; return a; };
const pose = (d: number, p: Pose, scale: number) => `translate(${(p.x - d / 2).toFixed(1)}px, ${(p.y - d / 2).toFixed(1)}px) rotate(${p.angle.toFixed(1)}deg) scale(${(p.sx * scale).toFixed(3)}, ${(p.sy * scale).toFixed(3)})`;
// Keyframes from [ms, frame] pairs over a duration.
const timeline = (total: number, frames: [number, Keyframe][]): Keyframe[] => frames.map(([ms, frame]) => ({ ...frame, offset: Math.min(1, Math.max(0, ms / total)) }));

const points = (g: Geometry) => {
  const tab = { x: g.x + g.w / 2, bottom: g.y + g.h };
  return { tab, drip: { x: tab.x, y: Math.min(tab.bottom + g.drop / 2 + 26, g.vh / 2) }, centre: { x: g.vw / 2, y: g.vh / 2 } };
};

// The swirl from the drip (t = 0) to the middle (t = 1): a spiral in a box inset from the screen edges, so it never leaves the
// screen, turning the way that sweeps down the tab's side first. Its radius shrinks evenly, so the droplet reaches the middle still
// moving, heading straight in, and the spring in outward() carries that speed on into a natural overshoot.
function spiral(g: Geometry) {
  const d = g.drop;
  const { drip, centre } = points(g);
  const rx = g.vw / 2 - d / 2 - 18;
  const ry = g.vh / 2 - d / 2 - 18;
  const nx = (drip.x - centre.x) / rx;
  const ny = (drip.y - centre.y) / ry;
  const rho0 = Math.hypot(nx, ny);
  const a0 = Math.atan2(ny, nx);
  const turn = 0.8 * Math.PI * 2 * (nx >= 0 ? 1 : -1);
  return (t: number) => ({ x: centre.x + rx * rho0 * (1 - t) * Math.cos(a0 + turn * t), y: centre.y + ry * rho0 * (1 - t) * Math.sin(a0 + turn * t) });
}

type Spot = { ms: number; x: number; y: number };
type Step = [number, Pose, string?]; // ms, pose, easing on to the next frame (linear when left out)

// Poses for a run of positions sampled every frame: each points its stretch along its direction of travel, longer (and thinner
// across, so it keeps its volume) the faster it goes; at a crawl it keeps its last axis rather than turning. `wobble` adds a
// jelly oscillation along the same axis.
function posed(track: Spot[], startAxis: number, fastest: number, wobble: (ms: number) => number = () => 0): Step[] {
  let last = startAxis;
  return track.map((p, i): Step => {
    const a = track[Math.max(0, i - 1)];
    const b = track[Math.min(track.length - 1, i + 1)];
    const dt = b.ms - a.ms || 1;
    const vx = (b.x - a.x) / dt;
    const vy = (b.y - a.y) / dt;
    const speed = Math.hypot(vx, vy);
    if (speed > 0.03) last = axis(Math.atan2(vy, vx) * 180 / Math.PI, last);
    const pace = Math.min(1, speed / fastest);
    const w = wobble(p.ms);
    return [p.ms, { x: p.x, y: p.y, angle: last, sx: (1 + 0.26 * pace) * (1 + w), sy: (1 - 0.16 * pace) * (1 - w) }];
  });
}

// The way out: grows out of the tab's bottom edge, stretches on its neck, rounds off as it pinches free, swirls, then lands in the
// middle on a spring (its arrival speed carries it a little past, it eases back and settles with a fading jelly wobble, with no
// sudden change of speed anywhere), and breathes in before the sheet bursts out of it. Returns the droplet's steps and top speed.
function outward(g: Geometry): { steps: Step[]; fastest: number } {
  const d = g.drop;
  const { tab, drip, centre } = points(g);
  const point = spiral(g);
  const swirlFrames = Math.round((OPEN.arrive - OPEN.pinch) / FRAME);
  const track: Spot[] = [];
  for (let i = 0; i <= swirlFrames; i++) {
    const t = i / swirlFrames;
    track.push({ ms: OPEN.pinch + (OPEN.arrive - OPEN.pinch) * t, ...point(0.6 * easeInOutSine(t) + 0.4 * t) });
  }
  const end = track[track.length - 1];
  const before = track[track.length - 2];
  let vx = (end.x - before.x) / (end.ms - before.ms);
  let vy = (end.y - before.y) / (end.ms - before.ms);
  let x = centre.x;
  let y = centre.y;
  const omega = 2 * Math.PI * 2.6 / 1000; // a soft spring, 2.6 swings a second
  const zeta = 0.5;
  const settleFrames = Math.round((OPEN.settled - OPEN.arrive) / FRAME);
  const h = (OPEN.settled - OPEN.arrive) / settleFrames / 4;
  for (let i = 1; i <= settleFrames; i++) {
    const ms = OPEN.arrive + (OPEN.settled - OPEN.arrive) * i / settleFrames;
    for (let k = 0; k < 4; k++) {
      vx += (-omega * omega * (x - centre.x) - 2 * zeta * omega * vx) * h;
      vy += (-omega * omega * (y - centre.y) - 2 * zeta * omega * vy) * h;
      x += vx * h;
      y += vy * h;
    }
    const home = Math.min(1, Math.max(0, (ms - (OPEN.settled - 100)) / 100)); // the last few px ease exactly home, where the sheet opens
    track.push({ ms, x: x + (centre.x - x) * home, y: y + (centre.y - y) * home });
  }
  let fastest = 0.01;
  for (let i = 1; i <= swirlFrames; i++) fastest = Math.max(fastest, Math.hypot(track[i].x - track[i - 1].x, track[i].y - track[i - 1].y) / (track[i].ms - track[i - 1].ms));
  const jelly = (ms: number) => ms <= OPEN.arrive ? 0 : 0.06 * Math.exp(-(ms - OPEN.arrive) / 120) * Math.sin(2 * Math.PI * (ms - OPEN.arrive) / 190);
  const at = (px: number, py: number, sx: number, sy: number, angle = 90): Pose => ({ x: px, y: py, angle, sx, sy });
  const flight = posed(track, 90, fastest, jelly).slice(1);
  const settledAxis = flight[flight.length - 1][1].angle;
  return {
    fastest,
    steps: [
      [0, at(tab.x, tab.bottom - d * 0.2, 0.01, 0.01), SOFT],
      [OPEN.windUp, at(tab.x, tab.bottom - d * 0.18, 0.35, 0.35), SOFT],
      [OPEN.swell, at(tab.x, tab.bottom + d * 0.2, 1.1, 0.72), SOFT],
      [OPEN.neck, at(tab.x, tab.bottom + d * 0.46, 1.24, 0.84), SOFT],
      [OPEN.pinch, at(drip.x, drip.y, 0.95, 1.06)],
      ...flight.map(([ms, p], i): Step => i === flight.length - 1 ? [ms, { ...p, sx: 1, sy: 1 }, SOFT] : [ms, p]),
      [OPEN.burst, at(centre.x, centre.y, 0.9, 0.9, settledAxis)],
    ],
  };
}

// The way back: sits in the middle while the sheet gathers into it, wobbles as it turns to liquid, sets off from rest along the
// same spiral and slows to a stop under the tab, is pulled up and gulped into it.
function homeward(g: Geometry, fastest: number): Step[] {
  const d = g.drop;
  const { tab, drip, centre } = points(g);
  const point = spiral(g);
  const lead = point(0.97);
  const depart = Math.atan2(lead.y - centre.y, lead.x - centre.x) * 180 / Math.PI;
  const at = (px: number, py: number, sx: number, sy: number, angle: number): Pose => ({ x: px, y: py, angle, sx, sy });
  const steps: Step[] = [[0, at(centre.x, centre.y, 1, 1, depart)], [CLOSE.gathered, at(centre.x, centre.y, 1, 1, depart)]];
  const wobbleFrames = Math.round((CLOSE.liquid - CLOSE.gathered) / FRAME);
  for (let i = 1; i < wobbleFrames; i++) {
    const t = (CLOSE.liquid - CLOSE.gathered) * i / wobbleFrames;
    const w = 0.09 * Math.exp(-t / 80) * Math.sin(2 * Math.PI * t / 150);
    steps.push([CLOSE.gathered + t, at(centre.x, centre.y, 1 + w, 1 - w, depart)]);
  }
  const returnFrames = Math.round((CLOSE.back - CLOSE.liquid) / FRAME);
  const track: Spot[] = [];
  for (let i = 0; i <= returnFrames; i++) {
    const t = i / returnFrames;
    track.push({ ms: CLOSE.liquid + (CLOSE.back - CLOSE.liquid) * t, ...point(1 - easeInOutSine(t)) });
  }
  const flight = posed(track, depart, fastest);
  const up = axis(90, flight[flight.length - 1][1].angle);
  return [
    ...steps,
    ...flight.map(([ms, p], i): Step => i === flight.length - 1 ? [ms, at(drip.x, drip.y, 0.98, 1.02, up), SOFT] : [ms, p]),
    [CLOSE.pulled, at(tab.x, tab.bottom + d * 0.36, 1.22, 0.84, up), SOFT],
    [CLOSE.swallow, at(tab.x, tab.bottom - d * 0.02, 0.8, 0.7, up), SOFT],
    [CLOSE.gulped, at(tab.x, tab.bottom - d * 0.22, 0.25, 0.25, up)],
  ];
}

// How big each trailing drop is at a moment: on the way out they shrink into the droplet as it lands, so only one body settles; on
// the way back they grow out of it as it sets off.
const trailScale = (i: number, ms: number, opening: boolean) => {
  const f = TRAIL[i] ?? 0.3;
  if (i === 0) return 1;
  const k = opening ? Math.min(1, Math.max(0, (ms - OPEN.arrive) / 160)) : 1 - Math.min(1, Math.max(0, (ms - CLOSE.liquid) / 160));
  return f * (1 - 0.45 * k);
};

// The highlight and the shadow ride with the droplet (position only, so the light stays fixed above the page) while it travels.
function rider(track: Step[], total: number, shown: [number, number, number, number], dx: number, dy: number, d: number, scale: string): Keyframe[] {
  const [inFrom, inTo, outFrom, outTo] = shown;
  const opacity = (ms: number) => ms <= inFrom || ms >= outTo ? 0 : ms < inTo ? (ms - inFrom) / (inTo - inFrom) : ms > outFrom ? (outTo - ms) / (outTo - outFrom) : 1;
  return timeline(total, track.map(([ms, p]) => [ms, { opacity: opacity(ms), transform: `translate(${(p.x - d / 2 + dx).toFixed(1)}px, ${(p.y - d / 2 + dy).toFixed(1)}px) ${scale}` }]));
}

export function ContactSheet({ tabRef }: { tabRef: React.RefObject<HTMLElement | null> }) {
  const [phase, setPhaseState] = useState<Phase>('closed');
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [sheet, setSheet] = useState<HTMLDivElement | null>(null);
  const phaseRef = useRef<Phase>('closed');
  const pushed = useRef(false); // this page added the #lets-talk history entry, so closing steps back over it
  const titleRef = useRef<HTMLHeadingElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const gooRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const reachRef = useRef<HTMLSpanElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const blobRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const running = useRef<Animation[]>([]);
  const filterId = `contact-goo-${useId().replace(/:/g, '')}`;
  const setPhase = (next: Phase) => { phaseRef.current = next; setPhaseState(next); };
  const stop = () => { running.current.forEach(animation => animation.cancel()); running.current = []; };

  const open = useCallback(() => { stop(); setGeometry(measure(tabRef.current)); setPhase('opening'); }, [tabRef]);
  const close = useCallback(() => {
    if (phaseRef.current === 'closed' || phaseRef.current === 'closing') return;
    setGeometry(measure(tabRef.current));
    setPhase('closing');
  }, [tabRef]);

  // Esc, the close button and "Back to exploring". When this page added the history entry, going back over it closes the sheet (via
  // hashchange) and leaves history as it was; otherwise the hash is dropped in place.
  const requestClose = useCallback(() => {
    if (window.location.hash === CONTACT_HASH) {
      if (pushed.current) { window.history.back(); return; }
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
    }
    close();
  }, [close]);

  useEffect(() => {
    const sync = (event?: HashChangeEvent) => {
      const wanted = window.location.hash === CONTACT_HASH;
      if (wanted && (phaseRef.current === 'closed' || phaseRef.current === 'closing')) { pushed.current = Boolean(event); open(); }
      else if (!wanted && (phaseRef.current === 'opening' || phaseRef.current === 'open')) { pushed.current = false; close(); }
    };
    sync(); // a page opened at /#lets-talk: an old /contact link, or the docs' contact button
    window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('hashchange', sync); stop(); };
  }, [open, close]);

  // Starts the opening once the sheet exists (the dialog portal mounts it a render after the dialog opens) and the closing when the
  // phase changes. Animations fill backwards, so each part sits at its first frame until its turn comes.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!sheet || !surface || !geometry || (phase !== 'opening' && phase !== 'closing')) return;
    const opening = phase === 'opening';
    const from = getComputedStyle(surface).clipPath; // closing mid-opening starts from where the sheet has got to
    stop();
    const tab = tabRef.current;
    const label = tab ? Array.from(tab.children) as HTMLElement[] : [];
    const track = (animation: Animation) => { running.current.push(animation); return animation; };
    const done = () => setPhase(opening ? 'open' : 'closed');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track(surface.animate([{ opacity: opening ? 0 : 1, clipPath: 'none' }, { opacity: opening ? 1 : 0, clipPath: 'none' }], { duration: 200, easing: 'ease', fill: 'both' })).onfinish = done;
      return;
    }
    const g = geometry;
    const d = g.drop;
    const centre = `${g.vw / 2}px ${g.vh / 2}px`;
    const circle = (r: number) => `circle(${r.toFixed(1)}px at ${centre})`;
    const whole = circle(Math.hypot(g.vw, g.vh) / 2 + 24);
    const blobs = blobRefs.current.filter((blob): blob is HTMLSpanElement => Boolean(blob));
    const goo = gooRef.current;
    const ghost = ghostRef.current;
    const reach = reachRef.current;
    const shine = shineRef.current;
    const shadow = shadowRef.current;
    const shadowScale = 'scale(1.15, .72)';

    if (opening) {
      const { steps } = outward(g);
      const total = OPEN.burst;
      // Wind-up: the real tab squeezes upward while its label fades, then the liquid stand-in takes its place.
      if (tab) {
        track(tab.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.04, .87)', offset: 0.85 }, { transform: 'scale(1.03, .9)' }], { duration: OPEN.windUp, easing: SOFT }));
        track(tab.animate([{ opacity: 1 }, { opacity: 1, offset: 0.99 }, { opacity: 0 }], { duration: OPEN.windUp, fill: 'forwards' }));
        label.forEach(part => track(part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OPEN.windUp - 20, easing: 'ease-out', fill: 'forwards' })));
      }
      // The stand-in sags as the droplet swells under it, recoils as the neck snaps, then drains up into the header.
      if (ghost) track(ghost.animate(timeline(OPEN.drained, [
        [0, { opacity: 0, transform: 'scale(1.03, .9)' }],
        [OPEN.windUp - 1, { opacity: 0, transform: 'scale(1.03, .9)' }],
        [OPEN.windUp, { opacity: 1, transform: 'scale(1.03, .9)', easing: SOFT }],
        [OPEN.swell, { opacity: 1, transform: 'scale(1, 1.05)', easing: SOFT }],
        [OPEN.neck, { opacity: 1, transform: 'scale(1, 1.02)', easing: 'cubic-bezier(.3,1.6,.5,1)' }],
        [OPEN.pinch, { opacity: 1, transform: 'scale(1.02, .9)', easing: SOFT }],
        [500, { opacity: 1, transform: 'scale(1, .97)', easing: 'cubic-bezier(.6,0,.85,.4)' }],
        [OPEN.drained, { opacity: 1, transform: 'scale(.55, 0)' }],
      ]), { duration: OPEN.drained, fill: 'both' }));
      if (reach) track(reach.animate([{ transform: 'scale(0)' }, { transform: 'scale(0)' }], { duration: 1, fill: 'both' }));
      blobs.forEach((blob, i) => track(blob.animate(timeline(total, steps.map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, trailScale(i, ms, true)), easing: ease ?? 'linear' }])), { duration: total, delay: i * TRAIL_LAG, fill: 'both' })));
      const ride: [number, number, number, number] = [OPEN.pinch, OPEN.pinch + 90, OPEN.settled, OPEN.burst];
      if (shine) track(shine.animate(rider(steps, total, ride, 0, 0, d, ''), { duration: total, fill: 'both' }));
      if (shadow) track(shadow.animate(rider(steps, total, ride, 5, 16, d, shadowScale), { duration: total, fill: 'both' }));
      // The burst: the sheet opens out of the droplet as it breathes in.
      track(surface.animate([{ clipPath: circle(0) }, { clipPath: circle(d * 0.45), offset: 0.001 }, { clipPath: whole }], { duration: OPEN.expand, delay: OPEN.burst, easing: 'cubic-bezier(.2,.85,.25,1)', fill: 'both' })).onfinish = done;
      if (goo) track(goo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, delay: OPEN.burst + 200, fill: 'both' }));
      return;
    }

    const steps = homeward(g, outward(g).fastest);
    const total = CLOSE.gulped;
    // The real tab stays hidden until the droplet is home, then takes over from its stand-in with a jelly wobble and its label rolls in.
    if (tab) {
      track(tab.animate([{ opacity: 0 }, { opacity: 0 }], { duration: CLOSE.gulped }));
      track(tab.animate([
        { transform: 'scale(1, 1)', easing: 'ease-out' },
        { transform: 'scale(1.1, .86)', offset: 0.12, easing: 'ease-in-out' },
        { transform: 'scale(.95, 1.07)', offset: 0.35, easing: 'ease-in-out' },
        { transform: 'scale(1.03, .97)', offset: 0.58, easing: 'ease-in-out' },
        { transform: 'scale(.99, 1.01)', offset: 0.8, easing: 'ease-in-out' },
        { transform: 'scale(1, 1)' },
      ], { duration: CLOSE.jelly, delay: CLOSE.gulped })).onfinish = done;
      label.forEach((part, i) => track(part.animate([{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340, delay: CLOSE.gulped + 110 + i * 40, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' })));
    }
    // The sheet gathers into the droplet in the middle, then is gone.
    track(surface.animate([{ clipPath: from && from !== 'none' ? from : whole }, { clipPath: circle(d / 2), offset: 0.999 }, { clipPath: circle(0) }], { duration: CLOSE.gathered - 110, delay: 110, easing: 'cubic-bezier(.6,0,.75,.25)', fill: 'both' }));
    if (goo) track(goo.animate([{ opacity: 1 }, { opacity: 1, offset: CLOSE.gulped / (CLOSE.gulped + 80) }, { opacity: 0 }], { duration: CLOSE.gulped + 80, fill: 'both' }));
    blobs.forEach((blob, i) => track(blob.animate(timeline(total, steps.map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, trailScale(i, ms, false)), easing: ease ?? 'linear' }])), { duration: total, delay: i * TRAIL_LAG, fill: 'both' })));
    const ride: [number, number, number, number] = [CLOSE.liquid, CLOSE.liquid + 70, CLOSE.back - 60, CLOSE.back];
    if (shine) track(shine.animate(rider(steps, total, ride, 0, 0, d, ''), { duration: total, fill: 'both' }));
    if (shadow) track(shadow.animate(rider(steps, total, ride, 5, 16, d, shadowScale), { duration: total, fill: 'both' }));
    // The tab re-forms out of the header and its bottom edge reaches down for the droplet, so they join on a liquid neck.
    const { tab: top } = points(g);
    if (ghost) track(ghost.animate(timeline(CLOSE.gulped, [
      [0, { opacity: 1, transform: 'scale(.55, 0)' }],
      [CLOSE.regrow, { opacity: 1, transform: 'scale(.55, 0)', easing: 'cubic-bezier(.2,.9,.3,1)' }],
      [CLOSE.reach, { opacity: 1, transform: 'scale(1, 1)', easing: SOFT }],
      [CLOSE.back, { opacity: 1, transform: 'scale(1, 1.04)', easing: SOFT }],
      [CLOSE.gulped, { opacity: 1, transform: 'scale(1, 1)' }],
    ]), { duration: CLOSE.gulped, fill: 'both' }));
    if (reach) track(reach.animate(timeline(CLOSE.gulped, ([
      [0, { x: top.x, y: top.bottom - d * 0.3, angle: 90, sx: 0.01, sy: 0.01 }],
      [1100, { x: top.x, y: top.bottom - d * 0.3, angle: 90, sx: 0.01, sy: 0.01 }],
      [CLOSE.reach, { x: top.x, y: top.bottom - d * 0.12, angle: 90, sx: 0.6, sy: 0.6 }],
      [CLOSE.back, { x: top.x, y: top.bottom + d * 0.1, angle: 90, sx: 0.78, sy: 0.46 }],
      [CLOSE.pulled, { x: top.x, y: top.bottom + d * 0.16, angle: 90, sx: 0.82, sy: 0.42 }],
      [CLOSE.swallow, { x: top.x, y: top.bottom - d * 0.05, angle: 90, sx: 0.36, sy: 0.36 }],
      [CLOSE.gulped, { x: top.x, y: top.bottom - d * 0.2, angle: 90, sx: 0.01, sy: 0.01 }],
    ] as [number, Pose][]).map(([ms, p]) => [ms, { transform: pose(d, p, 1), easing: SOFT }])), { duration: CLOSE.gulped, fill: 'both' }));
  }, [sheet, phase, geometry, tabRef]);

  const g = geometry;
  return <Dialog.Root open={phase !== 'closed'} onOpenChange={next => { if (!next) requestClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="contact-sheet-overlay" />
      <Dialog.Content
        ref={setSheet}
        className="contact-sheet"
        data-phase={phase}
        aria-describedby="contact-sheet-lead"
        onOpenAutoFocus={event => { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }); }}
      >
        {g && <>
          <svg className="contact-goo-defs" aria-hidden="true" width="0" height="0">
            <defs>
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation={Math.round(g.drop * 0.13)} result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>
          <span ref={shadowRef} className="contact-goo-shadow" aria-hidden="true" style={{ width: g.drop, height: g.drop }} />
          <div ref={gooRef} className="contact-goo" aria-hidden="true" style={{ filter: `url(#${filterId})` }}>
            <span ref={ghostRef} className="contact-goo-tab" style={{ left: g.x, top: g.y, width: g.w, height: g.h, borderRadius: g.radius }} />
            <span ref={reachRef} className="contact-goo-blob" style={{ width: g.drop, height: g.drop }}><span /></span>
            {TRAIL.map((size, i) => <span key={size} ref={blob => { blobRefs.current[i] = blob; }} className="contact-goo-blob" style={{ width: g.drop, height: g.drop }}><span /></span>)}
          </div>
          <span ref={shineRef} className="contact-goo-shine" aria-hidden="true" style={{ width: g.drop, height: g.drop }} />
        </>}
        <div ref={surfaceRef} className="contact-sheet-surface" style={{ clipPath: phase === 'open' ? 'none' : 'circle(0px at 50% 50%)' }}>
          <div className="contact-sheet-scroll"><div className="contact-sheet-inner">
            <div className="contact-sheet-top" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="contact-sheet-eyebrow"><span className="status-dot" aria-hidden="true" />A new chapter starts here</span>
              <Dialog.Close asChild><button type="button" className="contact-sheet-close">Close <X size={18} aria-hidden="true" /></button></Dialog.Close>
            </div>
            <div className="contact-sheet-grid">
              <section className="contact-sheet-intro" style={{ '--i': 1 } as React.CSSProperties}>
                <Dialog.Title asChild><h2 ref={titleRef} tabIndex={-1} className="contact-sheet-title">It starts<br />with hello<span>.</span></h2></Dialog.Title>
                <p className="contact-sheet-lead" id="contact-sheet-lead">A new idea, a fresh start, or something you’re still figuring out. We’d love to hear it.</p>
                <div className="contact-sheet-direct">
                  <a href="mailto:ardenostudio@gmail.com"><Mail size={18} aria-hidden="true" /><span className="ul">ardenostudio@gmail.com</span><ArrowUpRight size={17} aria-hidden="true" /></a>
                  <a href="https://wa.me/94758504424" target="_blank" rel="noopener noreferrer"><span className="ul">Prefer WhatsApp?</span><ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                </div>
                <p className="contact-sheet-next"><span className="status-dot" aria-hidden="true" /><span>We reply within 24 hours.<br />You’ll speak directly with the founders.</span></p>
              </section>
              <section className="contact-sheet-enquiry" aria-labelledby="contact-sheet-form-title" style={{ '--i': 2 } as React.CSSProperties}>
                <h3 id="contact-sheet-form-title">What do you have in mind?</h3>
                <p>A rough sketch is enough. We’ll work out the details together.</p>
                <ContactForm onDone={requestClose} />
              </section>
            </div>
          </div></div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
