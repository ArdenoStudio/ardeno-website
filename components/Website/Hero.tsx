import React, { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { PROJECTS, type Project } from '../../data/projects';
import { burstSparks } from './clickSpark';

// Back-to-front order of the fanned project cards; the last one sits on top.
const FAN_IDS = ['ceylon-hygiene', 'koel-cse', 'dinaya-lk'];
// A card is partly covered by the next one, so its label is the short name the studio uses where the full title is long.
const FAN_LABELS: Record<string, string> = { 'ceylon-hygiene': 'CHS', 'dinaya-lk': 'Dinaya.lk' };
const FAN_PROJECTS = FAN_IDS
  .map((id) => PROJECTS.find((project) => project.id === id))
  .filter((project): project is Project => Boolean(project));

function DotLines({ className, svgRef }: { className: string; svgRef?: React.Ref<SVGSVGElement> }) {
  return (
    <svg ref={svgRef} className={className} viewBox="0 0 1500 550" focusable="false">
      <text x="1500" y="242" textAnchor="end" fill="currentColor">your next</text>
      <text x="1500" y="472" textAnchor="end" fill="currentColor">chapter.</text>
    </svg>
  );
}

// Records where the pointer crosses the pill's edge, so the ink fill grows from (and shrinks back to) that point.
function placeFill(event: React.PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.setProperty('--fx', `${Math.round(event.clientX - box.left)}px`);
  el.style.setProperty('--fy', `${Math.round(event.clientY - box.top)}px`);
  el.style.setProperty('--fd', `${Math.ceil(Math.hypot(box.width, box.height) * 2)}px`);
}

// Scrolls to the work section smoothly while the arrow "falls" ahead of the page.
function exploreWork(event: React.MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById('work');
  if (!target) return;
  event.preventDefault();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrow = event.currentTarget.querySelector<HTMLElement>('.link-arrow');
  if (arrow && !reduced) {
    arrow.classList.remove('is-falling');
    void arrow.offsetWidth; // restart the animation if it is clicked again mid-fall
    arrow.classList.add('is-falling');
  }
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  window.history.pushState(null, '', '#work');
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
}

// Moves a soft orange spotlight (a masked copy of the dotted lettering) to the pointer.
function useDotGlow(hostRef: React.RefObject<HTMLElement>, glowRef: React.RefObject<SVGSVGElement>) {
  useEffect(() => {
    const host = hostRef.current;
    const glow = glowRef.current;
    if (!host || !glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const ease = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.18;
    let pointer: { x: number; y: number } | null = null;
    let x = 0;
    let y = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (!pointer) return;
      const box = glow.getBoundingClientRect();
      const tx = pointer.x - box.left;
      const ty = pointer.y - box.top;
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      glow.style.setProperty('--mx', `${x.toFixed(1)}px`);
      glow.style.setProperty('--my', `${y.toFixed(1)}px`);
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) frame = requestAnimationFrame(paint);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      if (!pointer) {
        const box = glow.getBoundingClientRect();
        x = event.clientX - box.left;
        y = event.clientY - box.top;
        glow.setAttribute('data-on', '');
      }
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const leave = () => {
      pointer = null;
      glow.removeAttribute('data-on');
    };

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hostRef, glowRef]);
}

export function Hero({ onContact }: { onContact: () => void }) {
  const hostRef = useRef<HTMLElement>(null);
  const glowRef = useRef<SVGSVGElement>(null);
  useDotGlow(hostRef, glowRef);

  return (
    <section ref={hostRef} className="editorial-hero" aria-labelledby="chapter-heading">
      <div className="editorial-meta">
        <span><span className="status-dot" aria-hidden="true" />Independent minds. Shared ambition.</span>
      </div>
      <div className="editorial-composition">
        <div className="editorial-backdrop" aria-hidden="true">
          <DotLines className="editorial-dot-type" />
          <DotLines className="editorial-dot-type editorial-dot-glow" svgRef={glowRef} />
        </div>
        <div className="editorial-foreground">
          <div className="editorial-message">
            <h1 id="chapter-heading"><span>We build brands,</span>{' '}<span>products and</span>{' '}<span>digital experiences.</span></h1>
            <p className="editorial-description">Websites with character. Products with purpose.<br />Designed and built for your next big move.</p>
            <div className="editorial-actions">
              <button
                className="editorial-cta"
                onPointerEnter={placeFill}
                onPointerLeave={placeFill}
                onClick={event => { burstSparks(event, ['--accent', '--ink', '--paper']); onContact(); }}
              >
                <span className="cta-fill" aria-hidden="true" />
                <span className="cta-label"><span>Start a project</span><span aria-hidden="true">Start a project</span></span>
                <span className="cta-arrow" aria-hidden="true"><ArrowUpRight size={18} /><ArrowUpRight size={18} /></span>
              </button>
              <a className="editorial-work-link" href="#work" onClick={exploreWork}>
                <span className="link-label">Explore our work</span>
                <span className="link-arrow" aria-hidden="true" onAnimationEnd={event => event.currentTarget.classList.remove('is-falling')}><ArrowDown size={18} /></span>
              </a>
            </div>
          </div>
          <ul className="editorial-fan" aria-label="Platforms and sites we have built">
            {FAN_PROJECTS.map((project) => (
              <li key={project.id}>
                <a
                  className="editorial-card"
                  href={project.url ?? '#work'}
                  {...(project.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  aria-label={`${project.title}, ${project.category}${project.url ? ' (opens in a new tab)' : ''}`}
                >
                  <img src={project.image} alt="" width={1280} height={800} loading="lazy" decoding="async" />
                  <span className="editorial-card-label">{FAN_LABELS[project.id] ?? project.title}<ArrowUpRight size={12} aria-hidden="true" /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
