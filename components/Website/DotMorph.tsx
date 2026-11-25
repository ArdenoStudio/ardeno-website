import React, { useEffect, useRef } from 'react';
import { LOCKUP } from './brandLockup';

// The contact band's picture: a screen of paper dots on the orange that draws the A, and redraws itself as whatever the visitor points at
// (a browser window, two arrows, a calendar, a chat bubble, a question mark). The shapes never slide; only the dots' sizes change. Dots
// swell under the pointer. Left alone, it takes turns through the shapes every TURN ms while it is on screen; pointing at (or focusing) a
// quick start holds that shape, and letting go brings back the A and starts the turns again. Reduced motion shows the A, still.
// `shape` is an index into SHAPES; -1 is the A. Styles: contactArt.css.

const line = (d: string) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
const SHAPES = [
  // New website: a browser window
  `<rect x="22" y="36" width="196" height="168" rx="22" fill="none" stroke="#fff" stroke-width="13"/>${line('M22 84H218')}<circle cx="52" cy="61" r="8" fill="#fff"/><circle cx="78" cy="61" r="8" fill="#fff"/><rect x="50" y="110" width="76" height="66" rx="10" fill="#fff"/>${line('M152 118H188M152 144H188M152 170H174')}`,
  // Website redesign: the turn-around arrows
  `${line('M196 100A80 80 0 0 0 56 78')}${line('M56 34V80H102')}${line('M44 140A80 80 0 0 0 184 162')}${line('M184 206V160H138')}<rect x="92" y="92" width="56" height="56" rx="14" fill="#fff"/>`,
  // Booking or order system: a calendar
  `<rect x="30" y="44" width="180" height="168" rx="22" fill="none" stroke="#fff" stroke-width="13"/>${line('M30 94H210M80 24V58M160 24V58')}<rect x="60" y="116" width="30" height="28" rx="7" fill="#fff"/><rect x="106" y="116" width="30" height="28" rx="7" fill="#fff"/><rect x="152" y="116" width="30" height="28" rx="7" fill="#fff"/><rect x="60" y="160" width="30" height="28" rx="7" fill="#fff"/>${line('M112 172L126 186L156 158')}`,
  // AI assistant: a chat bubble with a spark
  `<path d="M52 34H188A28 28 0 0 1 216 62V142A28 28 0 0 1 188 170H112L66 212V170H52A28 28 0 0 1 24 142V62A28 28 0 0 1 52 34Z" fill="none" stroke="#fff" stroke-width="13" stroke-linejoin="round"/><path d="M120 58C124 88 134 98 164 102C134 106 124 116 120 146C116 116 106 106 76 102C106 98 116 88 120 58Z" fill="#fff"/>`,
  // Not sure yet: a question mark
  `<path d="M78 84A44 44 0 1 1 138 124C124 132 120 142 120 158" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><circle cx="120" cy="204" r="19" fill="#fff"/>`,
];
const svg = (viewBox: string, body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="${viewBox}">${body}</svg>`)}`;
const SOURCES = [svg(`4 4 ${LOCKUP.markBox - 8} ${LOCKUP.markBox - 8}`, `<path fill="#fff" transform="${LOCKUP.mark.transform}" d="${LOCKUP.mark.d}"/>`), ...SHAPES.map(body => svg('0 0 240 240', body))];

const PITCH = 13; // CSS px between dots
const LENS = 130;
const TURN = 3200; // ms each shape stays before the next

export function DotMorph({ shape }: { shape: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const show = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current, host = canvas?.parentElement, ctx = canvas?.getContext('2d');
    const band = host?.closest<HTMLElement>('.contact-section');
    if (!canvas || !host || !ctx || !band) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const images: HTMLImageElement[] = [];
    let width = 0, height = 0, frame = 0, disposed = false, visible = false, chosen = 0, timer = 0;
    let xs = new Float32Array(0), ys = xs, radius = xs, target = xs, speed = xs, delay = xs;
    let changed = 0;
    const pointer = { x: -999, y: -999, strength: 0, to: 0 };

    const layout = () => {
      // Rows are offset by half a step, so the screen looks printed rather than like a table.
      const px: number[] = [], py: number[] = [];
      const rowHeight = PITCH * 0.866;
      for (let row = 0, y = rowHeight / 2; y < height; row++, y += rowHeight) for (let x = row % 2 ? PITCH : PITCH / 2; x < width; x += PITCH) { px.push(x); py.push(y); }
      xs = Float32Array.from(px); ys = Float32Array.from(py);
      radius = new Float32Array(xs.length); target = new Float32Array(xs.length); speed = new Float32Array(xs.length); delay = new Float32Array(xs.length);
    };

    // How big each dot should be for a shape: the shape's coverage, shaded from top left to bottom right, over a faint screen.
    const aim = (index: number, jump: boolean) => {
      const image = images[index];
      if (!image?.complete || !image.naturalWidth || !width) return;
      const source = document.createElement('canvas');
      source.width = width; source.height = height;
      const s = source.getContext('2d', { willReadFrequently: true });
      if (!s) return;
      const size = Math.min(width * 0.9, height * 0.82);
      s.filter = 'blur(2px)';
      s.drawImage(image, (width - size) / 2, (height - size) / 2, size, size);
      const { data } = s.getImageData(0, 0, width, height);
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i], y = ys[i];
        const ink = data[(Math.min(height - 1, Math.round(y)) * width + Math.min(width - 1, Math.round(x))) * 4 + 3] / 255;
        const shade = 1 - 0.34 * Math.min(1, Math.max(0, (x / width + y / height) / 2));
        // The faint screen fades out toward the text and the band's edges.
        const edge = Math.min(1, x / (width * 0.3)) * Math.min(1, (width - x) / 60) * Math.min(1, y / 70) * Math.min(1, (height - y) / 70);
        target[i] = Math.max(ink * shade * PITCH * 0.56, 1.1 * Math.max(0, edge));
        delay[i] = jump ? 0 : (x / width * 0.16 + (i * 7919 % 97) / 97 * 0.12);
      }
      changed = performance.now();
      if (jump) radius.set(target);
      request();
    };

    let last = 0;
    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      const dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016); last = now;
      pointer.strength += (pointer.to - pointer.strength) * 0.14;
      let busy = Math.abs(pointer.to - pointer.strength) > 0.01;
      const since = (now - changed) / 1000;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f4f4f2';
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        if (since >= delay[i]) {
          const gap = target[i] - radius[i];
          if (Math.abs(gap) > 0.02 || Math.abs(speed[i]) > 0.05) {
            speed[i] += (gap * 190 - speed[i] * 19) * dt;
            radius[i] += speed[i] * dt;
            busy = true;
          }
        } else busy = true;
        let r = radius[i];
        if (pointer.strength > 0.01) {
          const near = 1 - Math.hypot(xs[i] - pointer.x, ys[i] - pointer.y) / LENS;
          if (near > 0) r += near * near * 3.4 * pointer.strength;
        }
        if (r < 0.3) continue;
        r = Math.min(r, PITCH * 0.6);
        ctx.moveTo(xs[i] + r, ys[i]);
        ctx.arc(xs[i], ys[i], r, 0, Math.PI * 2);
      }
      ctx.fill();
      if (busy) request(); else last = 0;
    };
    const request = () => { if (!frame && visible && !disposed) frame = requestAnimationFrame(tick); };

    const resize = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width), h = Math.round(entry.contentRect.height);
      if (!w || !h || (w === width && h === height)) return;
      width = w; height = h;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * ratio; canvas.height = h * ratio;
      layout(); aim(chosen, true);
    });
    // The turns: one timer, only while the dots are on screen and no quick start is held.
    let held = false;
    const turns = () => {
      window.clearTimeout(timer);
      if (still || held || !visible || disposed) return;
      timer = window.setTimeout(() => { if (!document.hidden) { chosen = (chosen + 1) % SOURCES.length; aim(chosen, false); } turns(); }, TURN);
    };
    const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); turns(); }, { threshold: 0.15 });

    SOURCES.forEach((src, i) => {
      const image = new Image();
      image.onload = () => { if (!disposed && i === chosen) aim(i, true); };
      image.src = src;
      images[i] = image;
    });
    resize.observe(host); view.observe(host);
    show.current = index => { held = index >= 0; chosen = index + 1; aim(chosen, still); turns(); };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = host.getBoundingClientRect();
      pointer.x = event.clientX - box.left; pointer.y = event.clientY - box.top; pointer.to = 1; request();
    };
    const leave = () => { pointer.to = 0; request(); };
    if (!still) { band.addEventListener('pointermove', move); band.addEventListener('pointerleave', leave); }
    return () => {
      disposed = true; cancelAnimationFrame(frame); window.clearTimeout(timer); resize.disconnect(); view.disconnect();
      band.removeEventListener('pointermove', move); band.removeEventListener('pointerleave', leave);
      show.current = () => {};
    };
  }, []);

  useEffect(() => { show.current(shape); }, [shape]);
  return <div className="contact-dots" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
