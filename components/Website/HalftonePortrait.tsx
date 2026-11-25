import React, { useEffect, useRef } from 'react';

// A founder portrait drawn in Signal dots. The dots start big and loose and sharpen to a fine screen when the portrait scrolls in;
// pointing at it loosens them again around the pointer. `photo` is any portrait photo (a square or 4:5 crop, face in the upper middle,
// plain background); until there is one the initials are drawn instead. Reduced motion draws the fine screen once. Styles: founders.css.

const COARSE = 26; // dot pitch in CSS px before it sharpens
const FINE = 7;
const DURATION = 1300;
const LENS = 120; // radius around the pointer where dots swell

export function HalftonePortrait({ photo, initials, colour = '#ff3301' }: { photo?: string; initials: string; colour?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, frame = 0, started = 0, seen = still, disposed = false;
    let dark: Float32Array | null = null; // how much ink each CSS pixel wants, 0 to 1
    let image: HTMLImageElement | null = null;
    const pointer = { x: 0, y: 0, strength: 0, target: 0 };

    // The source (photo or initials) as darkness, at one sample per CSS pixel.
    const sample = () => {
      const source = document.createElement('canvas');
      source.width = width; source.height = height;
      const s = source.getContext('2d', { willReadFrequently: true });
      if (!s) return;
      s.fillStyle = '#fff'; s.fillRect(0, 0, width, height);
      if (image) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
        s.drawImage(image, (width - w) / 2, (height - h) * 0.3, w, h);
      } else {
        // Initials with a soft fall-off, so the screen has tones to show.
        s.font = `${Math.round(width * 0.52)}px "Cal Sans", sans-serif`;
        s.textAlign = 'center'; s.textBaseline = 'middle';
        const shade = s.createLinearGradient(0, height * 0.25, 0, height * 0.75);
        shade.addColorStop(0, '#222'); shade.addColorStop(1, '#6a6a6a');
        s.fillStyle = shade; s.fillText(initials, width / 2, height / 2 + width * 0.03);
        const glow = s.createRadialGradient(width / 2, height * 1.05, 0, width / 2, height * 1.05, height * 0.75);
        glow.addColorStop(0, 'rgba(0,0,0,.34)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
        s.fillStyle = glow; s.fillRect(0, 0, width, height);
      }
      const { data } = s.getImageData(0, 0, width, height);
      const ink = new Float32Array(width * height);
      for (let i = 0; i < ink.length; i++) {
        const light = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
        ink[i] = Math.min(1, Math.max(0, (1 - light - 0.04) * 1.12));
      }
      dark = ink;
    };

    const draw = (pitch: number) => {
      if (!dark) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colour;
      ctx.beginPath();
      const diagonal = Math.hypot(width, height) / 2;
      const cos = Math.SQRT1_2, steps = Math.ceil(diagonal / pitch);
      // A 45 degree screen, like print.
      for (let row = -steps; row <= steps; row++) for (let column = -steps; column <= steps; column++) {
        const u = column * pitch, v = row * pitch;
        const x = width / 2 + (u - v) * cos, y = height / 2 + (u + v) * cos;
        if (x < -pitch || y < -pitch || x > width + pitch || y > height + pitch) continue;
        const ink = dark[Math.min(height - 1, Math.max(0, Math.round(y))) * width + Math.min(width - 1, Math.max(0, Math.round(x)))];
        let radius = Math.sqrt(ink) * pitch * 0.6;
        if (pointer.strength > 0.01) {
          const near = 1 - Math.hypot(x - pointer.x, y - pointer.y) / LENS;
          if (near > 0) radius *= 1 + near * near * 0.75 * pointer.strength;
        }
        if (radius < 0.35) continue;
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || !dark) return;
      if (!started) started = now;
      const t = still ? 1 : Math.min(1, (now - started) / DURATION);
      const eased = 1 - Math.pow(1 - t, 4);
      pointer.strength += (pointer.target - pointer.strength) * 0.16;
      draw(COARSE * Math.pow(FINE / COARSE, eased));
      if (t < 1 || Math.abs(pointer.target - pointer.strength) > 0.01) request();
    };
    const request = () => { if (!frame && seen && dark) frame = requestAnimationFrame(tick); };

    const resize = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width), h = Math.round(entry.contentRect.height);
      if (!w || !h || (w === width && h === height)) return;
      width = w; height = h;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * ratio; canvas.height = h * ratio;
      sample(); request();
    });
    resize.observe(host);

    const view = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen = true; view.disconnect(); request();
    }, { threshold: 0.35 });
    if (!still) view.observe(host);

    if (photo) {
      const loading = new Image();
      loading.decoding = 'async';
      loading.onload = () => { if (disposed) return; image = loading; if (width) { sample(); request(); } };
      loading.src = photo;
    } else document.fonts?.load('100px "Cal Sans"').then(() => { if (!disposed && width) { sample(); request(); } }).catch(() => {});

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const box = host.getBoundingClientRect();
      pointer.x = event.clientX - box.left; pointer.y = event.clientY - box.top; pointer.target = 1; request();
    };
    const leave = () => { pointer.target = 0; request(); };
    if (!still) { host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave); }
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); view.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave);
    };
  }, [photo, initials, colour]);

  return <canvas ref={canvasRef} className="founder-halftone" aria-hidden="true" />;
}
