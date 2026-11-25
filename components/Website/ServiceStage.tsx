import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MoveHorizontal, Send } from 'lucide-react';
import { ServiceVisual } from './ServiceVisual';

// "The thinking. The making." as something to do: one stage with a divider that can be dragged, the plan on its left and the finished thing
// on its right, lined up exactly. Choosing a service swaps both sides and lets the making sweep in from the right.
//  - Websites and booking: a live site (Serendib Trading, Dinaya) and a blueprint generated from the boxes of that very screen
//    (public/images/services/*-plan.svg, made from the page's real element positions at 1280 by 800).
//  - Redesign: the studio's own site, before and after, because nothing in the project data says which client site was a redesign.
//  - AI assistants: the beam diagram, and a conversation that is labelled as an example.
// Styles: serviceStage.css.

export type Service = { title: string; short: string; description: string; tags: string[]; detail: string; path: string };

type Scene = { ground: string; plan: React.ReactNode; made: React.ReactNode; planNote: string; madeNote: string; href?: string };
const shot = (name: string, alt: string) => <img src={`/images/services/${name}`} alt={alt} width={1280} height={800} loading="lazy" decoding="async" draggable={false} />;

const SCENES: Record<string, Scene> = {
  'Web design & development': { ground: '#1f3358', plan: shot('serendib-plan.svg', 'Blueprint of the Serendib Trading homepage'), made: shot('serendib.webp', 'The live Serendib Trading homepage'), planNote: 'The blueprint', madeNote: 'Serendib Trading', href: '/projects/serendib-trading' },
  'Website redesign': { ground: '#d92b00', plan: shot('before.webp', 'The old, dark Ardeno Studio website'), made: shot('after.webp', 'The new, light Ardeno Studio website'), planNote: 'Our own site, before', madeNote: 'Our own site, now' },
  'Booking & order systems': { ground: '#1d52c4', plan: shot('dinaya-plan.svg', 'Blueprint of the Dinaya homepage'), made: shot('dinaya.webp', 'The live Dinaya homepage'), planNote: 'The blueprint', madeNote: 'Dinaya', href: '/projects/dinaya-lk' },
  'AI lead assistants': { ground: '#20211f', plan: <div className="stage-flow"><ServiceVisual service="AI lead assistants" /></div>, made: <Conversation />, planNote: 'The plan', madeNote: 'Example conversation' },
};

function Conversation() {
  return <div className="stage-chat">
    <div className="stage-chat-top"><img src="/ardeno-logo.svg" alt="" width={26} height={23} /><span>Your assistant</span><small>Answers day and night</small></div>
    <p className="is-visitor">Hi, it’s late. Can I book a table for Saturday?</p>
    <p>Of course. Saturday has space from 6 PM. How many of you are coming?</p>
    <p className="is-visitor">Four of us, around 7.</p>
    <p>Lovely. Leave a phone number and I’ll pass this to the team to confirm in the morning.</p>
    <div className="stage-chat-input"><span>Type a message</span><Send size={18} aria-hidden="true" /></div>
  </div>;
}

const REST = 50; // where the divider settles, in percent

export function ServiceStage({ services, onContact }: { services: Service[]; onContact: () => void }) {
  const [active, setActive] = useState(0);
  const [value, setValue] = useState(REST); // for the slider's reading; the picture follows --x
  const stage = useRef<HTMLDivElement>(null);
  const position = useRef(REST);
  const frame = useRef(0);

  const place = useCallback((percent: number) => {
    position.current = Math.min(97, Math.max(3, percent));
    stage.current?.style.setProperty('--x', `${position.current}%`);
  }, []);

  // A damped spring from where the divider is (or `from`) to `to`.
  const sweep = useCallback((to: number, from?: number) => {
    cancelAnimationFrame(frame.current);
    if (from !== undefined) place(from);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { place(to); setValue(Math.round(to)); return; }
    let x = position.current, velocity = 0, last = 0;
    const step = (now: number) => {
      const dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016); last = now;
      velocity += ((to - x) * 46 - velocity * 9.5) * dt;
      x += velocity * dt;
      place(x);
      if (Math.abs(to - x) < 0.05 && Math.abs(velocity) < 0.2) { place(to); setValue(Math.round(to)); return; }
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [place]);

  // The first sweep, when the stage scrolls in.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    place(REST);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    place(97);
    const view = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { view.disconnect(); sweep(REST, 97); } }, { threshold: 0.45 });
    view.observe(el);
    return () => { view.disconnect(); cancelAnimationFrame(frame.current); };
  }, [place, sweep]);

  const choose = (index: number) => {
    if (index === active) return;
    setActive(index);
    sweep(REST, 97);
  };

  // Dragging works anywhere on the stage except its links and tabs; a plain press there sends the divider to the pointer.
  const drag = useRef<{ id: number; startX: number; startY: number; moved: boolean } | null>(null);
  const percentAt = (clientX: number) => { const box = stage.current!.getBoundingClientRect(); return (clientX - box.left) / box.width * 100; };
  const down = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as Element).closest('a')) return;
    drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.moved) {
      if (Math.abs(event.clientX - current.startX) < 4) return;
      current.moved = true;
      cancelAnimationFrame(frame.current);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.setAttribute('data-dragging', '');
    }
    place(percentAt(event.clientX));
  };
  const up = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    drag.current = null;
    event.currentTarget.removeAttribute('data-dragging');
    if (!current || current.id !== event.pointerId) return;
    if (current.moved) setValue(Math.round(position.current));
    else if (event.type === 'pointerup' && Math.abs(event.clientY - current.startY) < 6) sweep(Math.min(97, Math.max(3, percentAt(event.clientX))));
  };
  const keys = (event: React.KeyboardEvent) => {
    const to = { ArrowLeft: position.current - 5, ArrowDown: position.current - 5, ArrowRight: position.current + 5, ArrowUp: position.current + 5, Home: 3, End: 97 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    cancelAnimationFrame(frame.current);
    place(to);
    setValue(Math.round(position.current));
  };
  const tabKeys = (event: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + services.length) % services.length;
    choose(next);
    document.getElementById(`service-tab-${next}`)?.focus();
  };

  const scenes = services.map(service => SCENES[service.short]);
  return <div className="service-stage">
    <div ref={stage} className="stage" style={{ '--x': `${REST}%` } as React.CSSProperties} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="stage-side stage-thinking">
        <p className="stage-word" aria-hidden="true">The <br />thinking.</p>
        {scenes.map((scene, i) => <div key={i} className="stage-frame" data-active={active === i ? '' : undefined} inert={active !== i}>{scene.plan}</div>)}
        <span className="stage-note">{scenes[active].planNote}</span>
      </div>
      <div className="stage-side stage-making" style={{ background: scenes[active].ground }}>
        <p className="stage-word" aria-hidden="true">The <br />making.</p>
        {scenes.map((scene, i) => <div key={i} className="stage-frame" data-active={active === i ? '' : undefined} inert={active !== i}>{scene.made}</div>)}
        {scenes[active].href
          ? <a className="stage-note" href={scenes[active].href}>{scenes[active].madeNote}<ArrowUpRight size={15} aria-hidden="true" /></a>
          : <span className="stage-note">{scenes[active].madeNote}</span>}
      </div>
      <div className="stage-divider" role="slider" tabIndex={0} aria-label="Drag to compare the thinking with the making" aria-valuemin={3} aria-valuemax={97} aria-valuenow={value} aria-valuetext={`${100 - value}% of the making showing`} onKeyDown={keys}><span><MoveHorizontal size={22} strokeWidth={2} aria-hidden="true" /></span></div>
    </div>
    <div className="stage-tabs" role="tablist" aria-label="Services" onKeyDown={tabKeys}>
      {services.map((service, i) => <button key={service.short} id={`service-tab-${i}`} type="button" role="tab" className="stage-tab" aria-selected={active === i} aria-controls={`service-panel-${i}`} tabIndex={active === i ? 0 : -1} onClick={() => choose(i)}>
        <span className="stage-tab-number tabular-nums">0{i + 1}</span><span className="stage-tab-name">{service.short}</span>
      </button>)}
    </div>
    <div className="stage-details">
      {services.map((service, i) => <div key={service.short} id={`service-panel-${i}`} role="tabpanel" aria-labelledby={`service-tab-${i}`} className="stage-detail" data-active={active === i ? '' : undefined} inert={active !== i}>
        <h3>{service.title}</h3>
        <div className="stage-detail-copy"><p>{service.description}</p><p>{service.detail}</p></div>
        <div className="stage-detail-side"><div className="service-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div><button type="button" className="text-button" onClick={onContact}><span className="ul">Discuss this service</span><ArrowUpRight size={17} aria-hidden="true" /></button></div>
      </div>)}
    </div>
  </div>;
}
