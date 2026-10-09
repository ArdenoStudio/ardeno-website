// A small confetti cannon that fires from the right edge of the screen, up and to the left, at height `y` (viewport px). It is
// used when How we work fills its last step (processFill.ts). Plain canvas, no library: a fixed canvas is added for the burst
// (above the header, below the mobile menu and the contact sheet) and removed when the last piece has fallen or faded. Two quick
// shots, about three seconds in all. Reduced motion skips it.
const COLORS = ['#ff3301', '#ff3301', '#ff6a45', '#ffa088', '#20211f']; // Signal (twice as often), two tints, Ink
const LIFE = 3200; // ms before every piece has faded
const FADE = 700; // ms of fading at the end of a piece's life
const GRAVITY = 0.2; // px per frame per frame, at 60 frames a second
const DRAG = 0.955; // with gravity, pieces settle into a slow fall of about 4px a frame

type Piece = { x: number; y: number; vx: number; vy: number; size: number; spin: number; angle: number; flip: number; flipSpeed: number; sway: number; color: string; shape: 0 | 1 | 2; born: number };

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export function fireConfetti(y: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:45';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.scale(ratio, ratio);

  const origin = Math.min(height * 0.85, Math.max(height * 0.15, y));
  const reach = Math.min(1, Math.max(0.62, width / 1440)); // phones get a gentler shot so it stays on screen
  const pieces: Piece[] = [];
  const shoot = (count: number, power: number, at: number) => {
    for (let i = 0; i < count; i++) {
      const angle = random(12, 68) * Math.PI / 180; // above the horizontal, aimed left
      const speed = random(13, 28) * power * reach;
      pieces.push({
        x: width + random(0, 12), y: origin + random(-8, 8),
        vx: -Math.cos(angle) * speed, vy: -Math.sin(angle) * speed,
        size: random(6, 10), spin: random(-0.2, 0.2), angle: random(0, Math.PI * 2),
        flip: random(0, Math.PI * 2), flipSpeed: random(0.08, 0.2), sway: random(0, Math.PI * 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 2, born: at,
      });
    }
  };

  const start = performance.now();
  const phone = width < 700;
  shoot(phone ? 42 : 70, 1, start);
  let second = false;
  let last = start;

  const draw = (piece: Piece, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.angle);
    ctx.scale(1, Math.cos(piece.flip)); // the paper turning over as it falls
    ctx.fillStyle = piece.color;
    const s = piece.size;
    if (piece.shape === 0) ctx.fillRect(-s / 2, -s / 4, s, s / 2);
    else if (piece.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, s / 3, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(0, -s / 2); ctx.lineTo(s / 2, s / 2.6); ctx.lineTo(-s / 2, s / 2.6); ctx.closePath(); ctx.fill(); } // a little A
    ctx.restore();
  };

  const tick = (now: number) => {
    const step = Math.min(3, (now - last) / (1000 / 60)); // frames since the last tick, so 120 Hz screens fall at the same speed
    last = now;
    if (!second && now - start > 170) { second = true; shoot(phone ? 22 : 36, 0.82, now); }
    ctx.clearRect(0, 0, width, height);
    let alive = 0;
    for (const piece of pieces) {
      const age = now - piece.born;
      if (age > LIFE || piece.y > height + 40 || piece.x < -40) continue;
      alive++;
      const drag = Math.pow(DRAG, step);
      piece.vx *= drag;
      piece.vy = piece.vy * drag + GRAVITY * step;
      piece.sway += 0.08 * step;
      piece.x += (piece.vx + Math.sin(piece.sway) * 0.6) * step;
      piece.y += piece.vy * step;
      piece.angle += piece.spin * step;
      piece.flip += piece.flipSpeed * step;
      draw(piece, Math.min(1, (LIFE - age) / FADE));
    }
    if (alive || !second) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
