import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Check, Mail, X } from 'lucide-react';
import { ContactForm, prepareContactDraft } from './ContactForm';
import './contactSheet.css';

// "Let's talk": the enquiry form as a sheet that liquid carries out of the page. There is no separate contact page.
//
// Opening from the header's hanging tab: the tab squeezes the moment it is pressed, a droplet swells from its bottom edge on a
// thinning neck and pinches off while the tab recoils and drains away. From any other contact button the droplet squeezes out of
// that button's edge instead (upward when the button sits low on the screen) and the button just gives. Either way the droplet
// swirls round the screen with a liquid tail, lands in the middle on a spring with a fading jelly wobble, breathes in and the sheet
// bursts out of it with a rippling edge. Closing: the sheet gathers back into a droplet (carrying a tick after an enquiry is sent),
// which swirls home; the tab reaches down for it, gulps it, wobbles and its label rolls back in. The full show plays on the first
// opening of a visit; later ones run at about 60% of the length with a shorter swirl. Closing part way through an opening (or
// reopening part way through a closing) plays the motion backwards from where it is.
//
// The liquid is the "gooey" filter (blur, then a sharp alpha threshold) over a layer of blobs, the technique React Bits' Blob Cursor
// and Gooey Nav use, so drops that touch melt together. The droplet stretches along its direction of travel and carries a fixed
// highlight and a soft shadow. Its flight is simulated and sampled every frame, so its speed never jumps. A tiny invisible copy of
// the liquid is drawn once after the page settles, so the graphics setup is done before the first click.
//
// The sheet is open while the address ends in #lets-talk, so every contact button and link (the tab, the menu, the footer, the
// contact band, old /contact links, which redirect to /?contact) just goes there, and the browser's Back button closes it. It lives in
// SiteHeader beside the tab it returns to. Reduced motion fades it in and out. Styles are in contactSheet.css.

export const CONTACT_HASH = '#lets-talk';

// Opens the sheet on this page, first prefilling the form (the contact band's email field and quick starts pass these).
export function openContactSheet(email?: string, message?: string) {
  prepareContactDraft(email, message);
  if (window.location.hash !== CONTACT_HASH) window.location.hash = CONTACT_HASH;
}

// The tab gives under a press straight away; the opening carries on from wherever the squeeze has got to.
let press: Animation | null = null;
export function pressContactTab(tab: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  press?.cancel();
  press = tab.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.04, .87)' }], { duration: 140, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
}
// Springs back only if the press did not open the sheet (a click that opens it lands within a moment of letting go).
export function releaseContactTab(tab: HTMLElement) {
  const held = press;
  window.setTimeout(() => {
    if (!held || press !== held || window.location.hash === CONTACT_HASH) return; // opening: the sheet takes it from here
    const from = getComputedStyle(tab).transform;
    held.cancel();
    press = tab.animate([{ transform: from === 'none' ? 'scale(1, 1)' : from }, { transform: 'scale(.98, 1.03)', offset: 0.45 }, { transform: 'scale(1, 1)' }], { duration: 380, easing: 'ease-out' });
  }, 120);
}

type Phase = 'closed' | 'opening' | 'open' | 'closing';
type Box = { x: number; y: number; w: number; h: number; radius: string };
// Where the liquid starts (the tab or the pressed button) and goes home to (the tab), the drip's direction (1 down, -1 up), the
// droplet's diameter for this screen, the screen, whether this is a later, quicker showing, and whether an enquiry was just sent.
type Geometry = { origin: Box; tab: Box; fromTab: boolean; dir: 1 | -1; drop: number; vw: number; vh: number; quick: boolean; sent: boolean };
type Pose = { x: number; y: number; angle: number; sx: number; sy: number };
type Spot = { ms: number; x: number; y: number };
type Step = [number, Pose, string?]; // ms, pose, easing on to the next frame (linear when left out)

// The choreography, in ms from the start of the opening or the closing, at full length.
const OPEN = { windUp: 130, swell: 260, neck: 380, pinch: 430, drained: 620, arrive: 1150, settled: 1480, burst: 1540, expand: 540 };
const CLOSE = { gathered: 450, liquid: 600, regrow: 1040, reach: 1220, back: 1320, pulled: 1370, swallow: 1440, gulped: 1480, jelly: 520 };
type Timings = { open: typeof OPEN; close: typeof CLOSE; turn: number; spring: number };
// Later showings in a visit: about 60% of the length, a shorter swirl and a stiffer spring so it still settles in time.
const scaled = <T extends Record<string, number>>(times: T, k: number) => Object.fromEntries(Object.entries(times).map(([key, ms]) => [key, ms * k])) as T;
const timings = (quick: boolean): Timings => quick
  ? { open: scaled(OPEN, 0.6), close: scaled(CLOSE, 0.6), turn: 0.45, spring: 2.6 / 0.6 }
  : { open: OPEN, close: CLOSE, turn: 0.8, spring: 2.6 };
let fullShowPlayed = false;

const TRAIL = [1, 0.76, 0.6, 0.46, 0.34]; // the droplet and the drops trailing it, as fractions of its size
const TRAIL_LAG = 12; // ms between drops: close enough at full speed for the goo to melt them into one tail
const SOFT = 'cubic-bezier(.35,0,.25,1)';
const FRAME = 1000 / 60;

function boxOf(el: Element | null | undefined): Box | null {
  if (!(el instanceof HTMLElement) || !el.isConnected) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  const s = getComputedStyle(el);
  return { x: r.left, y: Math.max(0, r.top), w: r.width, h: r.bottom - Math.max(0, r.top), radius: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].join(' ') };
}

function measure(tab: HTMLElement | null, origin: Element | null, quick: boolean, sent = false): Geometry {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const drop = Math.round(Math.min(84, Math.max(54, Math.min(vw, vh) * 0.095)));
  const tabBox = boxOf(tab) ?? { x: vw - 144, y: 0, w: 118, h: 64, radius: '0px 0px 12px 12px' };
  const fromBox = origin && origin !== tab && !(tab && tab.contains(origin)) ? boxOf(origin) : null;
  const box = fromBox ?? tabBox;
  return { origin: box, tab: tabBox, fromTab: !fromBox, dir: fromBox && box.y + box.h / 2 > vh * 0.55 ? -1 : 1, drop, vw, vh, quick, sent };
}

const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
// The droplet stretches along an axis, not a direction: turned 180° it is the same shape, so angles unwrap with a 180° period and
// it can reverse (as it does at the far end of its overshoot) without spinning.
const axis = (angle: number, ref: number) => { let a = angle; while (a - ref > 90) a -= 180; while (a - ref < -90) a += 180; return a; };
const pose = (d: number, p: Pose, scale: number) => `translate(${(p.x - d / 2).toFixed(1)}px, ${(p.y - d / 2).toFixed(1)}px) rotate(${p.angle.toFixed(1)}deg) scale(${(p.sx * scale).toFixed(3)}, ${(p.sy * scale).toFixed(3)})`;
// Keyframes from [ms, frame] pairs over a duration.
const timeline = (total: number, frames: [number, Keyframe][]): Keyframe[] => frames.map(([ms, frame]) => ({ ...frame, offset: Math.min(1, Math.max(0, ms / total)) }));

// The edge the droplet leaves from (or returns to) and the point just past it where it hangs free.
const dripOf = (box: Box, dir: 1 | -1, g: Geometry) => {
  const x = box.x + box.w / 2;
  const edge = dir > 0 ? box.y + box.h : box.y;
  const y = Math.min(g.vh - g.drop / 2 - 10, Math.max(g.drop / 2 + 10, edge + dir * (g.drop / 2 + 26)));
  return { x, edge, drip: { x, y } };
};
const centreOf = (g: Geometry) => ({ x: g.vw / 2, y: g.vh / 2 });

// A swirl from `from` (t = 0) to the middle (t = 1): a spiral in a box inset from the screen edges, so it never leaves the screen,
// turning the way the drip is already heading. Its radius shrinks evenly, so the droplet reaches the middle still moving.
function spiral(g: Geometry, from: { x: number; y: number }, dir: 1 | -1, turns: number) {
  const centre = centreOf(g);
  const rx = g.vw / 2 - g.drop / 2 - 18;
  const ry = g.vh / 2 - g.drop / 2 - 18;
  const nx = (from.x - centre.x) / rx;
  const ny = (from.y - centre.y) / ry;
  const rho0 = Math.hypot(nx, ny);
  const a0 = Math.atan2(ny, nx);
  const turn = turns * Math.PI * 2 * dir * (nx >= 0 ? 1 : -1);
  return (t: number) => ({ x: centre.x + rx * rho0 * (1 - t) * Math.cos(a0 + turn * t), y: centre.y + ry * rho0 * (1 - t) * Math.sin(a0 + turn * t) });
}

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

// The way out: grows out of the starting edge, stretches on its neck, rounds off as it pinches free, swirls, then lands in the
// middle on a spring (its arrival speed carries it a little past, it eases back and settles with a fading jelly wobble), and
// breathes in before the sheet bursts out of it. Returns the droplet's steps and its top speed.
function outward(g: Geometry, t: Timings): { steps: Step[]; fastest: number } {
  const O = t.open;
  const d = g.drop;
  const { x, edge, drip } = dripOf(g.origin, g.dir, g);
  const centre = centreOf(g);
  const point = spiral(g, drip, g.dir, t.turn);
  const swirlFrames = Math.max(8, Math.round((O.arrive - O.pinch) / FRAME));
  const track: Spot[] = [];
  for (let i = 0; i <= swirlFrames; i++) {
    const s = i / swirlFrames;
    track.push({ ms: O.pinch + (O.arrive - O.pinch) * s, ...point(0.6 * easeInOutSine(s) + 0.4 * s) });
  }
  const end = track[track.length - 1];
  const before = track[track.length - 2];
  let vx = (end.x - before.x) / (end.ms - before.ms);
  let vy = (end.y - before.y) / (end.ms - before.ms);
  let px = centre.x;
  let py = centre.y;
  const omega = 2 * Math.PI * t.spring / 1000;
  const zeta = 0.5;
  const settleFrames = Math.max(6, Math.round((O.settled - O.arrive) / FRAME));
  const h = (O.settled - O.arrive) / settleFrames / 4;
  const easeHome = Math.min(100, (O.settled - O.arrive) * 0.35);
  for (let i = 1; i <= settleFrames; i++) {
    const ms = O.arrive + (O.settled - O.arrive) * i / settleFrames;
    for (let k = 0; k < 4; k++) {
      vx += (-omega * omega * (px - centre.x) - 2 * zeta * omega * vx) * h;
      vy += (-omega * omega * (py - centre.y) - 2 * zeta * omega * vy) * h;
      px += vx * h;
      py += vy * h;
    }
    const home = Math.min(1, Math.max(0, (ms - (O.settled - easeHome)) / easeHome)); // the last few px ease exactly home, where the sheet opens
    track.push({ ms, x: px + (centre.x - px) * home, y: py + (centre.y - py) * home });
  }
  let fastest = 0.01;
  for (let i = 1; i <= swirlFrames; i++) fastest = Math.max(fastest, Math.hypot(track[i].x - track[i - 1].x, track[i].y - track[i - 1].y) / (track[i].ms - track[i - 1].ms));
  const wobblePeriod = 190 * (O.settled - O.arrive) / (OPEN.settled - OPEN.arrive);
  const jelly = (ms: number) => ms <= O.arrive ? 0 : 0.06 * Math.exp(-(ms - O.arrive) / (wobblePeriod * 0.63)) * Math.sin(2 * Math.PI * (ms - O.arrive) / wobblePeriod);
  const at = (ax: number, ay: number, sx: number, sy: number, angle = 90): Pose => ({ x: ax, y: ay, angle, sx, sy });
  const flight = posed(track, 90, fastest, jelly).slice(1);
  const settledAxis = flight[flight.length - 1][1].angle;
  const s = g.dir;
  return {
    fastest,
    steps: [
      [0, at(x, edge - s * d * 0.2, 0.01, 0.01), SOFT],
      [O.windUp, at(x, edge - s * d * 0.18, 0.35, 0.35), SOFT],
      [O.swell, at(x, edge + s * d * 0.2, 1.1, 0.72), SOFT],
      [O.neck, at(x, edge + s * d * 0.46, 1.24, 0.84), SOFT],
      [O.pinch, at(drip.x, drip.y, 0.95, 1.06)],
      ...flight.map(([ms, p], i): Step => i === flight.length - 1 ? [ms, { ...p, sx: 1, sy: 1 }, SOFT] : [ms, p]),
      [O.burst, at(centre.x, centre.y, 0.9, 0.9, settledAxis)],
    ],
  };
}

// The way back to the tab: sits in the middle while the sheet gathers into it, wobbles as it turns to liquid, sets off from rest
// along a spiral and slows to a stop under the tab, is pulled up and gulped into it.
function homeward(g: Geometry, t: Timings, fastest: number): Step[] {
  const C = t.close;
  const d = g.drop;
  const { x, edge, drip } = dripOf(g.tab, 1, g);
  const centre = centreOf(g);
  const point = spiral(g, drip, 1, t.turn);
  const lead = point(0.97);
  const depart = Math.atan2(lead.y - centre.y, lead.x - centre.x) * 180 / Math.PI;
  const at = (ax: number, ay: number, sx: number, sy: number, angle: number): Pose => ({ x: ax, y: ay, angle, sx, sy });
  const steps: Step[] = [[0, at(centre.x, centre.y, 1, 1, depart)], [C.gathered, at(centre.x, centre.y, 1, 1, depart)]];
  const wobbleFrames = Math.max(4, Math.round((C.liquid - C.gathered) / FRAME));
  const wobbleSpan = C.liquid - C.gathered;
  for (let i = 1; i < wobbleFrames; i++) {
    const ms = wobbleSpan * i / wobbleFrames;
    const w = 0.09 * Math.exp(-ms / (wobbleSpan * 0.53)) * Math.sin(2 * Math.PI * ms / wobbleSpan);
    steps.push([C.gathered + ms, at(centre.x, centre.y, 1 + w, 1 - w, depart)]);
  }
  const returnFrames = Math.max(8, Math.round((C.back - C.liquid) / FRAME));
  const track: Spot[] = [];
  for (let i = 0; i <= returnFrames; i++) {
    const s = i / returnFrames;
    track.push({ ms: C.liquid + (C.back - C.liquid) * s, ...point(1 - easeInOutSine(s)) });
  }
  const flight = posed(track, depart, fastest);
  const up = axis(90, flight[flight.length - 1][1].angle);
  return [
    ...steps,
    ...flight.map(([ms, p], i): Step => i === flight.length - 1 ? [ms, at(drip.x, drip.y, 0.98, 1.02, up), SOFT] : [ms, p]),
    [C.pulled, at(x, edge + d * 0.36, 1.22, 0.84, up), SOFT],
    [C.swallow, at(x, edge - d * 0.02, 0.8, 0.7, up), SOFT],
    [C.gulped, at(x, edge - d * 0.22, 0.25, 0.25, up)],
  ];
}

// How big each trailing drop is at a moment: on the way out they shrink into the droplet as it lands, so only one body settles; on
// the way back they grow out of it as it sets off.
const trailScale = (i: number, ms: number, opening: boolean, t: Timings) => {
  const f = TRAIL[i] ?? 0.3;
  if (i === 0) return 1;
  const k = opening ? Math.min(1, Math.max(0, (ms - t.open.arrive) / 160)) : 1 - Math.min(1, Math.max(0, (ms - t.close.liquid) / 160));
  return f * (1 - 0.45 * k);
};

// Things that ride with the droplet by position only, so the light stays fixed above the page: the highlight, the shadow, the tick.
function rider(track: Step[], total: number, shown: [number, number, number, number], dx: number, dy: number, d: number, scale: string | ((ms: number) => string)): Keyframe[] {
  const [inFrom, inTo, outFrom, outTo] = shown;
  const opacity = (ms: number) => ms <= inFrom || ms >= outTo ? 0 : ms < inTo ? (ms - inFrom) / (inTo - inFrom) : ms > outFrom ? (outTo - ms) / (outTo - outFrom) : 1;
  return timeline(total, track.map(([ms, p]) => [ms, { opacity: opacity(ms), transform: `translate(${(p.x - d / 2 + dx).toFixed(1)}px, ${(p.y - d / 2 + dy).toFixed(1)}px) ${typeof scale === 'function' ? scale(ms) : scale}` }]));
}

// The sheet's outline as it bursts open or gathers in: a circle whose edge ripples (two slow waves running round it) by `wobble`
// of its radius. Always the same number of curve segments, so the browser can morph one into the next.
function blob(cx: number, cy: number, r: number, wobble: number, phase: number) {
  const n = 12;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + wobble * (0.6 * Math.sin(3 * a + phase) + 0.4 * Math.sin(5 * a - 1.3 * phase)));
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });
  const p = (i: number) => pts[(i + n) % n];
  let path = `M${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    path += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
  }
  return `path('${path}Z')`;
}
// From a droplet to the whole screen (or back): the ripple swells early and has died away by the time the sheet fills the screen.
function burst(g: Geometry, outward: boolean): Keyframe[] {
  const { x, y } = centreOf(g);
  const r0 = g.drop * (outward ? 0.45 : 0.5);
  const R = Math.hypot(g.vw, g.vh) / 2 + 30;
  const frames: Keyframe[] = [];
  const n = 14;
  for (let j = 0; j <= n; j++) {
    const p = j / n;
    const grow = outward ? 1 - Math.pow(1 - p, 3.2) : Math.pow(1 - p, 2.2); // fast out, gentle in; on the way back it speeds up into the droplet
    const reach = outward ? p : 1 - p;
    const wobble = 0.22 * Math.sqrt(reach) * Math.pow(1 - reach, 1.8);
    frames.push({ offset: p, clipPath: blob(x, y, r0 + (R - r0) * grow, wobble, reach * 4) });
  }
  return frames;
}
const gone = (g: Geometry) => blob(g.vw / 2, g.vh / 2, 0, 0, 0);

// Draws a tiny, all but invisible copy of the liquid (the goo filter, the droplet and highlight gradients) once, a moment after the
// page settles, so the browser has prepared them before the first click instead of stalling the first opening.
let warmed = false;
function warmUp(drop: number) {
  if (warmed) return;
  warmed = true;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = `<filter id="contact-goo-warm" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="${Math.round(drop * 0.13)}" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>`;
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.className = 'contact-goo-warm';
  layer.innerHTML = '<div style="filter:url(#contact-goo-warm)"><span class="contact-goo-blob" style="width:24px;height:24px;position:absolute"><span></span></span></div><span class="contact-goo-shine"></span><span class="contact-goo-shadow"></span>';
  document.body.append(svg, layer);
  requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => { layer.remove(); svg.remove(); })));
}

export function ContactSheet({ tabRef }: { tabRef: React.RefObject<HTMLElement | null> }) {
  const [phase, setPhaseState] = useState<Phase>('closed');
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [sheet, setSheet] = useState<HTMLDivElement | null>(null);
  const phaseRef = useRef<Phase>('closed');
  const pushed = useRef(false); // this page added the #lets-talk history entry, so closing steps back over it
  const reversing = useRef(false); // the current phase is the previous one's motion played backwards, not a fresh run
  const lastPress = useRef<{ el: Element; at: number } | null>(null);
  const originRef = useRef<Element | null>(null); // the button this opening started from
  const sent = useRef(false);
  const sentTimer = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const gooRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const reachRef = useRef<HTMLSpanElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);
  const blobRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const running = useRef<Animation[]>([]);
  const filterId = `contact-goo-${useId().replace(/:/g, '')}`;
  const setPhase = (next: Phase) => { phaseRef.current = next; setPhaseState(next); };
  const stop = () => { running.current.forEach(animation => { animation.onfinish = null; animation.cancel(); }); running.current = []; };

  // Plays whatever is moving backwards from where it has got to, then lands in `next`'s end state.
  const reverse = useCallback((next: 'opening' | 'closing') => {
    const animations = running.current;
    if (!animations.length) return false;
    reversing.current = true;
    animations.forEach(animation => { animation.onfinish = null; animation.reverse(); });
    setPhase(next);
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (running.current !== animations || phaseRef.current !== next) return;
      reversing.current = false;
      if (next === 'opening') setPhase('open');
      else { stop(); setPhase('closed'); }
    }).catch(() => {});
    return true;
  }, []);

  const open = useCallback(() => {
    window.clearTimeout(sentTimer.current);
    if (phaseRef.current === 'closing' && reverse('opening')) return;
    stop();
    const recent = lastPress.current && performance.now() - lastPress.current.at < 1500 ? lastPress.current.el : null;
    const active = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const quick = fullShowPlayed;
    fullShowPlayed = true;
    sent.current = false;
    reversing.current = false;
    originRef.current = recent ?? active;
    setGeometry(measure(tabRef.current, originRef.current, quick));
    setPhase('opening');
  }, [tabRef, reverse]);
  const close = useCallback(() => {
    window.clearTimeout(sentTimer.current);
    if (phaseRef.current === 'closed' || phaseRef.current === 'closing') return;
    if (phaseRef.current === 'opening' && reverse('closing')) return;
    reversing.current = false;
    setGeometry(current => current && { ...measure(tabRef.current, null, current.quick, sent.current), origin: current.origin, fromTab: current.fromTab, dir: current.dir });
    setPhase('closing');
  }, [tabRef, reverse]);

  // Esc, the close button, "Back to exploring" and the automatic close after sending. When this page added the history entry, going
  // back over it closes the sheet (via hashchange) and leaves history as it was; otherwise the hash is dropped in place.
  const requestClose = useCallback(() => {
    if (window.location.hash === CONTACT_HASH) {
      if (pushed.current) { window.history.back(); return; }
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
    }
    close();
  }, [close]);
  // After an enquiry goes through, the thank-you shows for a moment, then the sheet closes carrying a tick.
  const onSent = useCallback(() => {
    sent.current = true;
    window.clearTimeout(sentTimer.current);
    sentTimer.current = window.setTimeout(requestClose, 1800);
  }, [requestClose]);

  useEffect(() => {
    const sync = (event?: HashChangeEvent) => {
      const wanted = window.location.hash === CONTACT_HASH;
      if (wanted && (phaseRef.current === 'closed' || phaseRef.current === 'closing')) { pushed.current = Boolean(event); open(); }
      else if (!wanted && (phaseRef.current === 'opening' || phaseRef.current === 'open')) { pushed.current = false; close(); }
    };
    // Remembers the last thing pressed, so the liquid can start from the button that opened it.
    const remember = (event: Event) => {
      const el = event.target instanceof Element ? event.target.closest('a, button') : null;
      if (el && !el.closest('.contact-sheet')) lastPress.current = { el, at: performance.now() };
    };
    sync(); // a page opened at /#lets-talk: an old /contact link, or the docs' contact button
    window.addEventListener('hashchange', sync);
    document.addEventListener('pointerdown', remember, true);
    const size = Math.round(Math.min(84, Math.max(54, Math.min(window.innerWidth, window.innerHeight) * 0.095)));
    const idle = window.requestIdleCallback ? window.requestIdleCallback(() => warmUp(size), { timeout: 4000 }) : window.setTimeout(() => warmUp(size), 2500);
    return () => {
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('pointerdown', remember, true);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else window.clearTimeout(idle);
      window.clearTimeout(sentTimer.current);
      stop();
    };
  }, [open, close]);

  // Starts the opening once the sheet exists (the dialog portal mounts it a render after the dialog opens) and the closing when the
  // phase changes. Animations fill backwards, so each part sits at its first frame until its turn comes.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!sheet || !surface || !geometry || reversing.current || (phase !== 'opening' && phase !== 'closing')) return;
    const opening = phase === 'opening';
    stop();
    const tab = tabRef.current;
    const track = (animation: Animation) => { running.current.push(animation); return animation; };
    const done = () => setPhase(opening ? 'open' : 'closed');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track(surface.animate([{ opacity: opening ? 0 : 1, clipPath: 'none' }, { opacity: opening ? 1 : 0, clipPath: 'none' }], { duration: 200, easing: 'ease', fill: 'both' })).onfinish = done;
      return;
    }
    const g = geometry;
    const t = timings(g.quick);
    const O = t.open;
    const C = t.close;
    const d = g.drop;
    const blobs = blobRefs.current.filter((blob): blob is HTMLSpanElement => Boolean(blob));
    const goo = gooRef.current;
    const ghost = ghostRef.current;
    const reach = reachRef.current;
    const shine = shineRef.current;
    const shadow = shadowRef.current;
    const tick = tickRef.current;
    const shadowScale = 'scale(1.15, .72)';
    const { steps: out, fastest } = outward(g, t);

    if (opening) {
      const total = O.burst;
      const startTransform = tab ? getComputedStyle(tab).transform : 'none';
      press?.cancel();
      press = null;
      if (g.fromTab && tab) {
        // Wind-up: the real tab (already giving if it was pressed) squeezes upward while its label fades, then the liquid stand-in
        // takes its place, sags as the droplet swells under it, recoils as the neck snaps and drains up into the header.
        track(tab.animate([{ transform: startTransform === 'none' ? 'scale(1, 1)' : startTransform }, { transform: 'scale(1.04, .87)', offset: 0.85 }, { transform: 'scale(1.03, .9)' }], { duration: O.windUp, easing: SOFT }));
        track(tab.animate([{ opacity: 1 }, { opacity: 1, offset: 0.99 }, { opacity: 0 }], { duration: O.windUp, fill: 'both' }));
        Array.from(tab.children as HTMLCollectionOf<HTMLElement>).forEach(part => track(part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: O.windUp * 0.85, easing: 'ease-out', fill: 'both' })));
        if (ghost) track(ghost.animate(timeline(O.drained, [
          [0, { opacity: 0, transform: 'scale(1.03, .9)' }],
          [O.windUp - 1, { opacity: 0, transform: 'scale(1.03, .9)' }],
          [O.windUp, { opacity: 1, transform: 'scale(1.03, .9)', easing: SOFT }],
          [O.swell, { opacity: 1, transform: 'scale(1, 1.05)', easing: SOFT }],
          [O.neck, { opacity: 1, transform: 'scale(1, 1.02)', easing: 'cubic-bezier(.3,1.6,.5,1)' }],
          [O.pinch, { opacity: 1, transform: 'scale(1.02, .9)', easing: SOFT }],
          [O.pinch + (O.drained - O.pinch) * 0.37, { opacity: 1, transform: 'scale(1, .97)', easing: 'cubic-bezier(.6,0,.85,.4)' }],
          [O.drained, { opacity: 1, transform: 'scale(.55, 0)' }],
        ]), { duration: O.drained, fill: 'both' }));
      } else {
        // From another button: it gives under the press and springs back as the droplet squeezes out of its edge.
        const button = originRef.current;
        if (button instanceof HTMLElement && button.isConnected) track(button.animate([{ transform: 'scale(1)' }, { transform: 'scale(.95, .92)', offset: 0.3 }, { transform: 'scale(1.02, 1.03)', offset: 0.65 }, { transform: 'scale(1)' }], { duration: O.drained, easing: 'ease-out' }));
        if (ghost) track(ghost.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'both' }));
      }
      if (reach) track(reach.animate([{ transform: 'scale(0)' }, { transform: 'scale(0)' }], { duration: 1, fill: 'both' }));
      if (tick) track(tick.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'both' }));
      blobs.forEach((blob, i) => track(blob.animate(timeline(total, out.map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, trailScale(i, ms, true, t)), easing: ease ?? 'linear' }])), { duration: total, delay: i * TRAIL_LAG, fill: 'both' })));
      const ride: [number, number, number, number] = [O.pinch, O.pinch + 90, O.settled, O.burst];
      if (shine) track(shine.animate(rider(out, total, ride, 0, 0, d, ''), { duration: total, fill: 'both' }));
      if (shadow) track(shadow.animate(rider(out, total, ride, 5, 16, d, shadowScale), { duration: total, fill: 'both' }));
      // The burst: the sheet opens out of the droplet as it breathes in, its edge rippling until it fills the screen.
      track(surface.animate([{ offset: 0, clipPath: gone(g) }, ...burst(g, true).map(frame => ({ ...frame, offset: 0.001 + (frame.offset as number) * 0.999 }))], { duration: O.expand, delay: O.burst, easing: 'linear', fill: 'both' })).onfinish = done;
      if (goo) track(goo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, delay: O.burst + O.expand * 0.37, fill: 'both' }));
      return;
    }

    const back = homeward(g, t, fastest);
    const total = C.gulped;
    // The real tab stays hidden until the droplet is home, then takes over from its stand-in with a jelly wobble and its label rolls in.
    if (tab) {
      track(tab.animate([{ opacity: 0 }, { opacity: 0 }], { duration: C.gulped }));
      track(tab.animate([
        { transform: 'scale(1, 1)', easing: 'ease-out' },
        { transform: 'scale(1.1, .86)', offset: 0.12, easing: 'ease-in-out' },
        { transform: 'scale(.95, 1.07)', offset: 0.35, easing: 'ease-in-out' },
        { transform: 'scale(1.03, .97)', offset: 0.58, easing: 'ease-in-out' },
        { transform: 'scale(.99, 1.01)', offset: 0.8, easing: 'ease-in-out' },
        { transform: 'scale(1, 1)' },
      ], { duration: C.jelly, delay: C.gulped })).onfinish = done;
      Array.from(tab.children as HTMLCollectionOf<HTMLElement>).forEach((part, i) => track(part.animate([{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 340, delay: C.gulped + 110 + i * 40, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' })));
    } else window.setTimeout(done, C.gulped + C.jelly);
    // The sheet gathers into the droplet in the middle, rippling as it shrinks, then is gone.
    track(surface.animate([...burst(g, false).map(frame => ({ ...frame, offset: (frame.offset as number) * 0.999 })), { offset: 1, clipPath: gone(g) }], { duration: C.gathered - 110, delay: 110, easing: 'linear', fill: 'both' }));
    if (goo) track(goo.animate([{ opacity: 1 }, { opacity: 1, offset: C.gulped / (C.gulped + 80) }, { opacity: 0 }], { duration: C.gulped + 80, fill: 'both' }));
    blobs.forEach((blob, i) => track(blob.animate(timeline(total, back.map(([ms, p, ease]): [number, Keyframe] => [ms, { transform: pose(d, p, trailScale(i, ms, false, t)), easing: ease ?? 'linear' }])), { duration: total, delay: i * TRAIL_LAG, fill: 'both' })));
    const ride: [number, number, number, number] = [C.liquid, C.liquid + 70, C.back - 60, C.back];
    if (shine) track(shine.animate(rider(back, total, ride, 0, 0, d, ''), { duration: total, fill: 'both' }));
    if (shadow) track(shadow.animate(rider(back, total, ride, 5, 16, d, shadowScale), { duration: total, fill: 'both' }));
    // After a send, the droplet carries a tick home: it pops in as the sheet becomes a droplet and sinks into the tab with it.
    if (tick) {
      const size = (ms: number) => ms < C.gathered ? 0.4 : ms < C.liquid ? 0.4 + 0.6 * Math.min(1, (ms - C.gathered) / ((C.liquid - C.gathered) * 0.6)) : ms > C.back ? Math.max(0.3, 1 - (ms - C.back) / (C.gulped - C.back)) : 1;
      track(tick.animate(rider(back, total, g.sent ? [C.gathered - 20, C.gathered + 60, C.swallow, C.gulped] : [0, 1, 1, 2], 0, 0, d, ms => `scale(${g.sent ? size(ms) : 0})`), { duration: total, fill: 'both' }));
    }
    // The tab re-forms out of the header (or, if the liquid came from another button, stands in for it from the start) and its bottom
    // edge reaches down for the droplet, so they join on a liquid neck.
    const { x: tabX, edge: tabBottom } = dripOf(g.tab, 1, g);
    if (ghost) track(ghost.animate(timeline(C.gulped, g.fromTab ? [
      [0, { opacity: 1, transform: 'scale(.55, 0)' }],
      [C.regrow, { opacity: 1, transform: 'scale(.55, 0)', easing: 'cubic-bezier(.2,.9,.3,1)' }],
      [C.reach, { opacity: 1, transform: 'scale(1, 1)', easing: SOFT }],
      [C.back, { opacity: 1, transform: 'scale(1, 1.04)', easing: SOFT }],
      [C.gulped, { opacity: 1, transform: 'scale(1, 1)' }],
    ] : [
      [0, { opacity: 1, transform: 'scale(1, 1)' }],
      [C.reach, { opacity: 1, transform: 'scale(1, 1)', easing: SOFT }],
      [C.back, { opacity: 1, transform: 'scale(1, 1.04)', easing: SOFT }],
      [C.gulped, { opacity: 1, transform: 'scale(1, 1)' }],
    ]), { duration: C.gulped, fill: 'both' }));
    if (reach) track(reach.animate(timeline(C.gulped, ([
      [0, { x: tabX, y: tabBottom - d * 0.3, angle: 90, sx: 0.01, sy: 0.01 }],
      [C.reach - (C.reach - C.regrow) * 0.45, { x: tabX, y: tabBottom - d * 0.3, angle: 90, sx: 0.01, sy: 0.01 }],
      [C.reach, { x: tabX, y: tabBottom - d * 0.12, angle: 90, sx: 0.6, sy: 0.6 }],
      [C.back, { x: tabX, y: tabBottom + d * 0.1, angle: 90, sx: 0.78, sy: 0.46 }],
      [C.pulled, { x: tabX, y: tabBottom + d * 0.16, angle: 90, sx: 0.82, sy: 0.42 }],
      [C.swallow, { x: tabX, y: tabBottom - d * 0.05, angle: 90, sx: 0.36, sy: 0.36 }],
      [C.gulped, { x: tabX, y: tabBottom - d * 0.2, angle: 90, sx: 0.01, sy: 0.01 }],
    ] as [number, Pose][]).map(([ms, p]) => [ms, { transform: pose(d, p, 1), easing: SOFT }])), { duration: C.gulped, fill: 'both' }));
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
        // While it closes, the sheet's layer still covers the page; a press where the tab is reopens it (the motion reverses).
        onPointerDown={event => {
          const box = geometry?.tab;
          if (phaseRef.current !== 'closing' || !box || event.clientX < box.x || event.clientX > box.x + box.w || event.clientY < box.y || event.clientY > box.y + box.h + 24) return;
          event.preventDefault();
          if (tabRef.current) lastPress.current = { el: tabRef.current, at: performance.now() };
          window.location.hash = CONTACT_HASH;
        }}
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
            <span ref={ghostRef} className="contact-goo-tab" style={{ left: g.tab.x, top: g.tab.y, width: g.tab.w, height: g.tab.h, borderRadius: g.tab.radius }} />
            <span ref={reachRef} className="contact-goo-blob" style={{ width: g.drop, height: g.drop }}><span /></span>
            {TRAIL.map((size, i) => <span key={size} ref={blob => { blobRefs.current[i] = blob; }} className="contact-goo-blob" style={{ width: g.drop, height: g.drop }}><span /></span>)}
          </div>
          <span ref={shineRef} className="contact-goo-shine" aria-hidden="true" style={{ width: g.drop, height: g.drop }} />
          <span ref={tickRef} className="contact-goo-tick" aria-hidden="true" style={{ width: g.drop, height: g.drop }}><Check size={Math.round(g.drop * 0.46)} strokeWidth={3} /></span>
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
                  <a href="mailto:hello@ardenostudio.com"><Mail size={18} aria-hidden="true" /><span className="ul">hello@ardenostudio.com</span><ArrowUpRight size={17} aria-hidden="true" /></a>
                  <a href="https://wa.me/94758504424" target="_blank" rel="noopener noreferrer"><span className="ul">Prefer WhatsApp?</span><ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
                </div>
                <p className="contact-sheet-next"><span className="status-dot" aria-hidden="true" /><span>We reply within 24 hours.<br />You’ll speak directly with the founders.</span></p>
              </section>
              <section className="contact-sheet-enquiry" aria-labelledby="contact-sheet-form-title" style={{ '--i': 2 } as React.CSSProperties}>
                <h3 id="contact-sheet-form-title">What do you have in mind?</h3>
                <p>A rough sketch is enough. We’ll work out the details together.</p>
                <ContactForm onDone={requestClose} onSent={onSent} />
              </section>
            </div>
          </div></div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
