import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarCheck, Database, FileText, Gauge, Globe, Instagram, LayoutTemplate, MessageCircle, Moon, PanelsTopLeft, SearchCheck, ShoppingBag, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { PROJECTS, type Project } from '../../data/projects';

// What an open service row shows beside its details (the Animated Beam idea from Magic UI, redrawn for Ardeno). The systems and AI
// rows get a diagram: three things come in on the left, flow through the Ardeno A in the middle and go out on the right, with a Signal
// beam travelling along each line. Every node is taken from that service's own copy in `services` (Site.tsx); Instagram and WhatsApp
// are the channels Dinaya's booking pages are shared on. The websites row shows two live websites instead. Styles: serviceVisual.css
// (imported in ArdenoWebsite.tsx after website.css, so its rules win ties).

type Point = { label: string; Icon: LucideIcon };
type Flow = { caption: string; summary: string; inputs: Point[]; outputs: Point[] };

const FLOWS: Record<string, Flow> = {
  'Website redesign': {
    caption: 'What we keep, what you get',
    summary: 'Your current site, its content and its working features go into the redesign, which brings a site audit, a design refresh and better performance.',
    inputs: [{ label: 'Your current site', Icon: PanelsTopLeft }, { label: 'Content', Icon: FileText }, { label: 'Working features', Icon: Database }],
    outputs: [{ label: 'Site audit', Icon: SearchCheck }, { label: 'Design refresh', Icon: LayoutTemplate }, { label: 'Performance', Icon: Gauge }],
  },
  'Booking & order systems': {
    caption: 'Where requests come from, and where they go',
    summary: 'Requests from Instagram, WhatsApp and your website go through one system, which turns them into bookings, orders and updates for your team.',
    inputs: [{ label: 'Instagram', Icon: Instagram }, { label: 'WhatsApp', Icon: MessageCircle }, { label: 'Your website', Icon: Globe }],
    outputs: [{ label: 'Bookings', Icon: CalendarCheck }, { label: 'Orders', Icon: ShoppingBag }, { label: 'Your team', Icon: Users }],
  },
  'AI lead assistants': {
    caption: 'From first question to your team',
    summary: 'Visitor questions, even after hours, are answered from your business information, and qualified enquiries are handed to your team.',
    inputs: [{ label: 'Questions', Icon: MessageCircle }, { label: 'After hours', Icon: Moon }, { label: 'Your business info', Icon: BookOpen }],
    outputs: [{ label: 'Instant answers', Icon: Sparkles }, { label: 'Qualified enquiries', Icon: SearchCheck }, { label: 'Your team', Icon: Users }],
  },
};

// Two of the live websites on the Built by Ardeno strip that the Selected work section above doesn't already feature.
const WEBSITE_IDS = ['wax-in-the-city', 'serendib-trading'];

export function ServiceVisual({ service }: { service: string }) {
  if (service === 'Web design & development') return <WebsiteProof />;
  const flow = FLOWS[service];
  return flow ? <BeamFlow flow={flow} /> : null;
}

function WebsiteProof() {
  const sites = WEBSITE_IDS.map(id => PROJECTS.find(project => project.id === id)).filter((project): project is Project => Boolean(project));
  return <figure className="service-visual service-proof">
    <figcaption className="service-visual-caption">Live websites we’ve built</figcaption>
    <div className="service-proof-grid">
      {sites.map((site, i) => <a key={site.id} className="service-proof-card" href={`/projects/${site.id}`} style={{ '--i': i } as React.CSSProperties}>
        <span className="service-proof-shot"><img src={site.image} alt="" width={1280} height={800} loading="lazy" decoding="async" /></span>
        <span className="service-proof-name"><span className="ul">{site.title}</span><ArrowUpRight size={14} aria-hidden="true" /></span>
        <span className="service-proof-kind">{site.category}</span>
      </a>)}
    </div>
  </figure>;
}

// Diagram geometry, in CSS px of the diagram's own box (the SVG's viewBox is its measured size, so nothing is scaled).
const HEIGHT = 252;
const NODE = 44; // the six outer circles
const LABEL_ROOM = 34; // under the bottom row, for its labels

function BeamFlow({ flow }: { flow: Flow }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const resize = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    resize.observe(el);
    // The beams only run while the diagram is on screen.
    const view = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => el.toggleAttribute('data-running', entry.isIntersecting)) : null;
    if (view) view.observe(el); else el.setAttribute('data-running', '');
    return () => { resize.disconnect(); view?.disconnect(); };
  }, []);

  const inner = HEIGHT - LABEL_ROOM;
  const left = NODE / 2 + 18;
  const right = width - left;
  const ys = [NODE / 2, inner / 2, inner - NODE / 2];
  const hub = { x: width / 2, y: inner / 2 };
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  };
  // Inputs flow into the hub, the hub flows out; each beam starts a little after the one before, and the outputs after the inputs.
  const beams = [
    ...ys.map((y, i) => ({ d: curve(left, y, hub.x, hub.y), delay: i * 0.35 })),
    ...ys.map((y, i) => ({ d: curve(hub.x, hub.y, right, y), delay: 1.8 + i * 0.35 })),
  ];

  return <figure className="service-visual service-flow">
    <figcaption className="service-visual-caption">{flow.caption}</figcaption>
    <div className="flow-box" ref={box} style={{ height: HEIGHT }} role="img" aria-label={flow.summary}>
      {width > 0 && <>
        <svg className="flow-lines" width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} aria-hidden="true" focusable="false">
          {beams.map((beam, i) => <g key={i} style={{ '--delay': `${beam.delay}s`, '--i': i } as React.CSSProperties}>
            <path className="flow-path" d={beam.d} pathLength={1} />
            <path className="flow-beam flow-beam-tail" d={beam.d} pathLength={1} />
            <path className="flow-beam flow-beam-head" d={beam.d} pathLength={1} />
          </g>)}
        </svg>
        {flow.inputs.map((point, i) => <FlowNode key={point.label} point={point} x={left} y={ys[i]} i={i} />)}
        <span className="flow-hub" style={{ left: hub.x, top: hub.y }} aria-hidden="true"><img src="/ardeno-logo.svg" alt="" width={30} height={27} /></span>
        {flow.outputs.map((point, i) => <FlowNode key={point.label} point={point} x={right} y={ys[i]} i={i + 4} />)}
      </>}
    </div>
  </figure>;
}

function FlowNode({ point: { label, Icon }, x, y, i }: { point: Point; x: number; y: number; i: number; key?: string }) {
  return <span className="flow-node" style={{ left: x, top: y, '--i': i } as React.CSSProperties} aria-hidden="true">
    <span className="flow-dot"><Icon size={19} strokeWidth={1.7} /></span>
    <span className="flow-label">{label}</span>
  </span>;
}
