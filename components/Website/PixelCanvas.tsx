import { useEffect, useRef } from 'react';

// A canvas of small squares that ripple outwards from the middle of its parent while a mouse is over it (or it has keyboard
// focus) and fade away when it leaves. It is the pixel shimmer of the pasted pixel-logo-grid component, without its Tailwind and
// shadcn parts. The parent should be position: relative with overflow hidden; the canvas never takes pointer events.
// With reduced motion nothing is drawn and the parent's own hover styles carry the effect. Pass `host` (a selector for an ancestor,
// such as "a") when a larger element than the parent should start the shimmer.

type Pixel = {
  x: number;
  y: number;
  color: string;
  speed: number; // how fast the shimmer grows and shrinks, px per frame
  size: number;
  sizeStep: number; // how fast it grows in
  maxSize: number;
  delay: number; // distance from the middle: the farther out, the later it starts
  counter: number;
  counterStep: number;
  idle: boolean;
  reverse: boolean;
  shimmer: boolean;
};

const FRAME = 1000 / 60;
const CELL = 2; // squares never grow past this, in CSS px
const SMALLEST = 0.5; // the shimmer breathes between this and maxSize

const random = (min: number, max: number) => Math.random() * (max - min) + min;

function makePixels(width: number, height: number, gap: number, colors: string[], speed: number): Pixel[] {
  const base = Math.min(speed, 100) * 0.001;
  const pixels: Pixel[] = [];
  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      pixels.push({
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: random(0.1, 0.9) * base,
        size: 0,
        sizeStep: Math.random() * 0.4,
        maxSize: random(0.5, CELL),
        delay: Math.hypot(x - width / 2, y - height / 2),
        counter: 0,
        counterStep: Math.random() * 4 + (width + height) * 0.01,
        idle: false,
        reverse: false,
        shimmer: false,
      });
    }
  }
  return pixels;
}

// Both return whether the pixel should be drawn this frame.
function appear(p: Pixel) {
  p.idle = false;
  if (p.counter <= p.delay) {
    p.counter += p.counterStep;
    return false;
  }
  if (p.size >= p.maxSize) p.shimmer = true;
  if (p.shimmer) {
    if (p.size >= p.maxSize) p.reverse = true;
    else if (p.size <= SMALLEST) p.reverse = false;
    p.size += p.reverse ? -p.speed : p.speed;
  } else {
    p.size += p.sizeStep;
  }
  return true;
}

function disappear(p: Pixel) {
  p.shimmer = false;
  p.counter = 0;
  if (p.size <= 0) {
    p.idle = true;
    return false;
  }
  p.size -= 0.1;
  return true;
}

export function PixelCanvas({ colors, gap = 5, speed = 30, host: hostSelector }: { colors: string[]; gap?: number; speed?: number; host?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const host = hostSelector ? wrap?.closest<HTMLElement>(hostSelector) : wrap?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !host || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pixels: Pixel[] = [];
    let mode: 'appear' | 'disappear' = 'disappear';
    let raf = 0;
    let last = 0;

    const build = () => {
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      pixels = makePixels(canvas.width, canvas.height, gap, colors, speed);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - last;
      if (elapsed < FRAME) return; // the timing is tuned for 60 frames a second
      last = now - (elapsed % FRAME);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let busy = false;
      for (const p of pixels) {
        const draw = mode === 'appear' ? appear(p) : disappear(p);
        if (draw && p.size > 0) {
          const inset = (CELL - p.size) / 2;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x + inset, p.y + inset, p.size, p.size);
        }
        if (!p.idle) busy = true;
      }
      if (mode === 'disappear' && !busy) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const run = (next: 'appear' | 'disappear') => {
      mode = next;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') run('appear');
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') run('disappear');
    };
    const focus = () => {
      if (host.matches(':focus-visible')) run('appear');
    };
    const blur = () => run('disappear');

    build();
    const resized = new ResizeObserver(build);
    resized.observe(wrap);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('focus', focus);
    host.addEventListener('blur', blur);
    return () => {
      resized.disconnect();
      cancelAnimationFrame(raf);
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('focus', focus);
      host.removeEventListener('blur', blur);
    };
  }, [colors, gap, speed, hostSelector]);

  return (
    <div ref={wrapRef} className="pixel-canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
