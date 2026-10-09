import React, { useEffect, useRef, useState } from 'react';
import type { Built } from './Site';

// On phones (700px and below) the Built by Ardeno strip is two slow rows of logos moving in opposite directions instead of five rows
// of two. Each row holds its cards twice so the loop has no seam; the second copy is inert. Touching the strip holds it still,
// keyboard focus stops it at the start so the focused card can scroll into view, it only moves while on screen, and under reduced
// motion each row is a plain sideways scroller. Styles: builtMarquee.css. Wider screens keep the grid in BuiltStrip (Site.tsx).
export const PHONE_STRIP = '(max-width: 700px)';
const RESUME_AFTER = 1400; // ms after a touch ends

export function usePhoneStrip() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE_STRIP).matches);
  useEffect(() => {
    const query = window.matchMedia(PHONE_STRIP);
    const change = () => setPhone(query.matches);
    change();
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return phone;
}

export function BuiltMarquee({ projects, Card }: { projects: Built[]; Card: (props: { project: Built; copy?: boolean; key?: string }) => React.ReactElement }) {
  const box = useRef<HTMLDivElement>(null);
  const half = Math.ceil(projects.length / 2);
  const rows = [projects.slice(0, half), projects.slice(half)];

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let resume = 0;
    const hold = () => { window.clearTimeout(resume); el.setAttribute('data-held', ''); };
    const release = () => { window.clearTimeout(resume); resume = window.setTimeout(() => el.removeAttribute('data-held'), RESUME_AFTER); };
    el.addEventListener('pointerdown', hold);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    const view = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => el.toggleAttribute('data-running', entry.isIntersecting)) : null;
    if (view) view.observe(el); else el.setAttribute('data-running', '');
    return () => {
      window.clearTimeout(resume);
      el.removeEventListener('pointerdown', hold);
      el.removeEventListener('pointerup', release);
      el.removeEventListener('pointercancel', release);
      view?.disconnect();
    };
  }, []);

  return <div className="built-marquee" ref={box}>
    {rows.map((row, r) => <div className="built-row" key={r}>
      <div className={r ? 'built-track is-reverse' : 'built-track'} style={{ '--count': row.length } as React.CSSProperties}>
        {row.map(project => <Card key={project.id} project={project} />)}
        {row.map(project => <Card key={`${project.id}-copy`} project={project} copy />)}
      </div>
    </div>)}
  </div>;
}
