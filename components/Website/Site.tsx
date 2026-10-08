import React, { useEffect, useId, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import { ArrowRight, ArrowUpRight, Check, Copy, Plus, X } from 'lucide-react';
import { PROJECTS, type Project } from '../../data/projects';
import { burstSparks, burstSparksAt } from './clickSpark';
import { PixelCanvas } from './PixelCanvas';
import { useMagnet, useReveal, useSiteInteractions, useSlidingIndicator } from './interactions';
import { LOCKUP } from './brandLockup';
import { Hero } from './Hero';
import { StickerPlayground } from './StickerPlayground';
import { cn, navigation } from './utils';

// The Work section, in order: the platforms, then the live websites.
const SHOWCASE_IDS = ['octane', 'propertylk', 'motormila', 'lankawa', 'dinaya-lk', 'koel-cse', 'serendib-trading', 'ceylon-stories', 'ceylon-hygiene', 'wax-in-the-city'];
export const showcase = SHOWCASE_IDS.map(id => PROJECTS.find(project => project.id === id)).filter((project): project is Project => Boolean(project));

export function Wordmark() { return <span className="site-wordmark">ardeno<span>studio</span></span>; }

// Header lockup, drawn from the official master (public/brand/ardeno-lockup-primary.svg, see scripts/generate-brand-lockup.cjs):
// the A is as tall as the wordmark's visible height, the gap is 0.32 times the symbol height, and the letters keep their natural spacing.
// The mark stays still. The wordmark rolls out from it on load, collapses into it when the page scrolls, and rolls out again at the top;
// the motion lives in brand.css. The small studio label is not part of the master lockup.
export function BrandLockup({ collapsed }: { collapsed: boolean }) {
  // On load the mark sits alone for a moment, then the wordmark rolls out (state 'intro' looks like 'collapsed'). Reduced motion skips the intro.
  const [introDone, setIntroDone] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 650);
    return () => window.clearTimeout(timer);
  }, []);
  const state = collapsed ? 'collapsed' : introDone ? 'restored' : 'intro';
  const clipId = `brand-clip-${useId().replace(/:/g, '')}`;
  return <span className="brand-lockup" data-state={state}>
    <svg className="brand-mark" viewBox={`0 0 ${LOCKUP.markBox} ${LOCKUP.height}`} aria-hidden="true" focusable="false">
      <path d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} />
    </svg>
    <span className="brand-word"><span className="brand-word-clip">
      <svg className="brand-wordmark" viewBox={`${LOCKUP.markBox} 0 ${LOCKUP.width - LOCKUP.markBox} ${LOCKUP.height}`} aria-hidden="true" focusable="false">
        <defs><clipPath id={clipId}><rect x={LOCKUP.markBox} y="0" width={LOCKUP.width} height={LOCKUP.height * 1.4} /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>{LOCKUP.glyphs.map((glyph, index) => <g key={index} className="brand-glyph" style={{ '--i': index } as React.CSSProperties}><path d={glyph.d} transform={glyph.transform} /></g>)}</g>
      </svg>
      <span className="brand-sub">studio</span>
    </span></span>
  </span>;
}

// A label split into letters that roll up one after another on hover (see the .roll-letter rules in interactions.css).
export function RollText({ text }: { text: string }) {
  return <span className="roll-text">
    <span className="sr-only">{text}</span>
    <span className="roll-letters" aria-hidden="true">{Array.from(text).map((letter, index) => <span key={index} className="roll-letter" style={{ '--i': index } as React.CSSProperties}><span>{letter}</span><span>{letter}</span></span>)}</span>
  </span>;
}

export function SiteHeader({ onContact }: { onContact: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string | null>('top');
  const contactAfterClose = useRef(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const headerLinks = [{ label: 'Home', id: 'top' }, ...navigation];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Shrinks past 48px and only expands again near the top, so it can't flicker around one threshold.
      setCompact(wasCompact => window.scrollY > (wasCompact ? 16 : 48));
      // The link for the section nearest the top of the screen is current; the FAQ and contact have no link.
      const line = window.innerHeight * 0.4;
      let current: string | null = 'top';
      for (const { id } of navigation) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) current = id;
      }
      const questions = document.getElementById('questions');
      if (questions && questions.getBoundingClientRect().top <= line) current = null;
      setActive(current);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    // A wider viewport replaces the mobile menu rather than leaving an overlay open.
    const desktop = window.matchMedia('(min-width: 761px)');
    const resize = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', resize);
    return () => { window.removeEventListener('scroll', scroll); desktop.removeEventListener('change', resize); cancelAnimationFrame(frame); };
  }, []);

  const menuContact = () => { contactAfterClose.current = true; setMenuOpen(false); };
  return <div className="site-header-space"><header className={cn('site-header', compact && 'is-compact')}>
    <div className="site-header-inner">
      <nav className="desktop-nav" aria-label="Main navigation">{headerLinks.map(item => <a key={item.id} aria-current={active === item.id ? 'location' : undefined} className="nav-roll-link" href={`#${item.id}`}><RollText text={`${item.label}.`} /></a>)}</nav>
      <a className="header-brand" href="#top" aria-label="Ardeno Studio home"><BrandLockup collapsed={compact} /></a>
      <div className="header-actions">
        <nav className="header-socials" aria-label="Studio social links"><a className="nav-roll-link" aria-label="Ardeno on Instagram" href="https://www.instagram.com/ardenostudio/" target="_blank" rel="noopener noreferrer"><RollText text="IG." /></a><a className="nav-roll-link" aria-label="Ardeno on LinkedIn" href="https://www.linkedin.com/company/ardentstudiolk" target="_blank" rel="noopener noreferrer"><RollText text="in." /></a></nav>
        <button className="header-contact" onClick={event => { burstSparks(event); onContact(); }}><span className="nav-roll"><span>Let’s talk</span><span aria-hidden="true">Let’s talk</span></span><ArrowUpRight size={16} aria-hidden="true" /></button>
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild><button ref={menuTrigger} className="mobile-menu icon-button" aria-label="Open navigation"><span className="menu-lines" aria-hidden="true"><span /><span /></span></button></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="site-nav-overlay" /><Dialog.Content className="site-nav-panel" onCloseAutoFocus={event => { if (contactAfterClose.current) { event.preventDefault(); contactAfterClose.current = false; menuTrigger.current?.focus({ preventScroll: true }); onContact(); } else if (window.matchMedia('(min-width: 761px)').matches) { event.preventDefault(); document.querySelector<HTMLAnchorElement>('.header-brand')?.focus({ preventScroll: true }); } }}>
            <Dialog.Title className="sr-only">Explore Ardeno</Dialog.Title><Dialog.Description className="sr-only">Find our work, services, and studio, or start a conversation.</Dialog.Description>
            <div className="site-nav-top"><a href="#top" aria-label="Ardeno Studio home" onClick={() => setMenuOpen(false)}><Wordmark /></a><div className="header-actions"><button className="header-contact" onClick={menuContact}>Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></button><Dialog.Close asChild><button className="icon-button" aria-label="Close navigation"><X size={22} aria-hidden="true" /></button></Dialog.Close></div></div>
            <nav className="site-nav-links" aria-label="Mobile navigation">{headerLinks.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><span><small aria-hidden="true">0{index + 1}</small>{item.label}.</span><ArrowUpRight size={26} aria-hidden="true" /></a>)}</nav>
            <div className="site-nav-bottom"><p>Independent minds.<br />Colombo ↗ Everywhere.</p><nav aria-label="Mobile social links"><a href="https://www.instagram.com/ardenostudio/" target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} aria-hidden="true" /></a><a href="https://www.linkedin.com/company/ardentstudiolk" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a></nav></div>
          </Dialog.Content></Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  </header></div>;
}

export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="section-label"><span className="tabular-nums">{number}</span><span>{children}</span><span className="section-label-line" /></div>;
}

// Filter name -> the status it shows (All work shows everything).
const WORK_FILTERS: Record<string, string> = { Platforms: 'Ardeno platform', Websites: 'Live website' };
const WORK_LABELS = ['All work', ...Object.keys(WORK_FILTERS)];

function Work() {
  const [filter, setFilter] = useState('All work');
  const [selected, setSelected] = useState<Project | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  useSlidingIndicator(filtersRef, '.is-active', [filter]);
  const projectTrigger = useRef<HTMLElement | null>(null);
  const openProject = (project: Project) => {
    projectTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(project);
  };
  const filtered = showcase.filter(project => filter === 'All work' || project.status === WORK_FILTERS[filter]);
  return <section id="work" className="site-section work-section">
    <SectionLabel number="01">Selected work</SectionLabel>
    <div className="section-heading"><h2><>Independent ideas.<br /><span>Made real.</span></></h2><div className="heading-aside"><p>Real platforms and live websites.<br />Different challenges. The same care.</p><div ref={filtersRef} className="work-filters" aria-label="Filter selected work">{WORK_LABELS.map(value => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={cn(filter === value && 'is-active')}>{value}</button>)}<span className="filter-indicator" aria-hidden="true" /></div></div></div>
    <div className="project-grid" aria-live="polite">{filtered.map((project) => <article className={cn('project-card', `project-${project.id}`)} key={project.id}>
      <button className="project-visual" onClick={() => openProject(project)} aria-label={`View ${project.title} project`}>
        <span className="project-status">{project.status === 'Ardeno platform' ? 'Live platform' : project.status === 'Live website' ? 'Live website' : 'Studio concept'}</span>
        <img src={project.image} alt={`${project.title} website preview`} width="1280" height="800" loading="lazy" decoding="async" />
        <span className="project-open"><ArrowUpRight size={24} /></span>
      </button><div className="project-caption"><div><h3><button onClick={() => openProject(project)}><span className="ul">{project.title}</span></button></h3><p>{project.category}</p></div><span className="project-year tabular-nums">{project.year}</span></div>
    </article>)}</div>
    <div className="work-outro"><p>A new idea belongs here, too.</p><a href="#contact"><span className="ul">Let’s talk about yours</span><ArrowUpRight size={18} /></a></div>
    <Dialog.Root open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}><Dialog.Portal><Dialog.Overlay className="studio-overlay" /><Dialog.Content className="studio-modal project-modal" onCloseAutoFocus={event => { event.preventDefault(); projectTrigger.current?.focus(); }}><Dialog.Close asChild><button className="modal-close icon-button" aria-label="Close project"><X size={20} /></button></Dialog.Close>{selected && <><div className="project-modal-image"><img src={selected.image} alt={`${selected.title} website`} width="1280" height="800" /></div><div className="project-modal-copy"><span className="modal-eyebrow">{selected.status} · {selected.year}</span><Dialog.Title>{selected.title}</Dialog.Title><Dialog.Description>{selected.description}</Dialog.Description><div className="project-detail-grid"><div><h3>The challenge</h3><p>{selected.problem}</p></div><div><h3>Our approach</h3><p>{selected.solution}</p></div></div><div className="project-outcome"><h3>The result</h3><p>{selected.outcome}</p></div><div className="project-tags">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{selected.url && <a href={selected.url} target="_blank" rel="noopener noreferrer" className="site-button">{selected.status === 'Ardeno platform' ? 'Explore live platform' : selected.status === 'Live website' ? 'Visit the live site' : 'Explore the concept'}<ArrowUpRight size={18} /></a>}</div></>}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </section>;
}

const services = [
  { title: 'Websites with identity.', short: 'Web design & development', description: 'A thoughtful first impression, and everything that comes after it. Custom websites that feel like your brand and make the next step clear.', tags: ['Strategy', 'UI / UX', 'Development', 'SEO'], detail: 'From structure and copy direction to responsive design, development, and launch. Every build is shaped around your business, your visitors, and what you need the website to do.', path: '/services/business-websites' },
  { title: 'A fresh start, done right.', short: 'Website redesign', description: 'Your business has moved forward. Your website should too. We rethink the experience, sharpen the story, and rebuild what’s holding you back.', tags: ['Site audit', 'Design refresh', 'Performance'], detail: 'We review your current site, identify friction, and agree on a focused redesign scope. Existing content and working features are considered before anything is replaced.', path: '/services/website-redesign' },
  { title: 'Less admin. More business.', short: 'Booking & order systems', description: 'Practical products that take care of the everyday. Booking flows, order systems, and tools that make your team’s work easier.', tags: ['Product design', 'Workflows', 'Integrations'], detail: 'Booking, ordering, and internal workflows designed around how your team actually operates. We scope roles, notifications, and integrations with you before the build.', path: '/services/booking-systems' },
  { title: 'Better conversations, 24/7.', short: 'AI lead assistants', description: 'A helpful first hello, even after hours. Thoughtful AI experiences that answer questions and connect the right people with your team.', tags: ['AI assistants', 'Lead flows', 'Automation'], detail: 'An assistant grounded in your business information, with sensible boundaries and clear handoff paths. Built to help visitors, qualify enquiries, and support your team.', path: '/services/ai-lead-assistants' },
];

function Services({ onContact }: { onContact: () => void }) {
  return <section id="services" className="site-section services-section">
    <SectionLabel number="02">What we do</SectionLabel><div className="section-heading"><h2><>The thinking.<br />The making.</></h2><p className="section-intro">Strategy, design, and development.<br />One small team, from first idea to final detail.</p></div>
    <Accordion.Root type="single" collapsible className="service-list">{services.map((service, i) => <Accordion.Item key={service.short} value={service.short} className="service-item"><Accordion.Header><Accordion.Trigger className="service-trigger"><span className="service-number tabular-nums">0{i + 1}</span><span className="service-heading"><span className="service-short">{service.short}</span><span className="service-title">{service.title}</span></span><span className="service-description">{service.description}</span><span className="service-plus"><Plus size={23} /></span></Accordion.Trigger></Accordion.Header><Accordion.Content className="service-content"><div><p>{service.detail}</p><div className="service-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div><button onClick={onContact}><span className="ul">Discuss this service</span><ArrowUpRight size={17} /></button></div></Accordion.Content></Accordion.Item>)}</Accordion.Root>
  </section>;
}

function Approach() {
  const steps = [
    ['Understand', 'We ask, listen, and get clear on the people, the problem, and what success looks like.'],
    ['Explore', 'We shape the structure and creative direction, with room for your feedback along the way.'],
    ['Build', 'We turn the direction into a responsive, carefully tested experience that works in the real world.'],
    ['Launch & evolve', 'We launch together, then stay close for support, refinements, and the next opportunity.'],
  ];
  return <section id="process" className="site-section approach-section"><SectionLabel number="03">How we work</SectionLabel><div className="section-heading"><h2><>A clear process.<br /><em>A close partnership.</em></></h2><p className="section-intro">No disappearing acts. No confusing handoffs.<br />Just an open conversation and a clear way forward.</p></div><div className="process-grid">{steps.map(([title, description], i) => <div className="process-step" key={title}><div className="step-top"><span className="tabular-nums">0{i + 1}</span>{i === 3 ? <Check size={22} /> : <ArrowRight size={22} />}</div><h3>{title}</h3><p>{description}</p></div>)}</div></section>;
}

function Studio({ onContact, canvasRef }: { onContact: () => void; canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const stickerFilter = `studio-sticker-${useId().replace(/:/g, '')}`;
  return <section id="about" className="site-section studio-section" aria-labelledby="studio-heading">
    <SectionLabel number="04">The studio</SectionLabel>
    <div className="studio-statement">
      <StickerPlayground canvasRef={canvasRef} filter={stickerFilter}>
        <h2 id="studio-heading">
          <span className="sr-only">Small team. Big ideas. All in on good work.</span>
          <span className="studio-statement-type" aria-hidden="true">
            <span className="statement-line statement-one">Small team.</span>
            <span className="statement-line statement-two">Big ideas.</span>
            <span className="statement-line statement-three">All in on</span>
            <span className="statement-line statement-four">Good work<span className="statement-period">.</span></span>
          </span>
        </h2>
        <svg className="studio-sticker-defs" aria-hidden="true" width="0" height="0">
          <defs>
            <filter id={stickerFilter} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="cutout" />
              <feFlood floodColor="#fff" />
              <feComposite in2="cutout" operator="in" />
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#20211f" floodOpacity=".2" />
            </filter>
          </defs>
        </svg>
      </StickerPlayground>
      <div className="statement-footnote"><span>Independent minds. Shared ambition.</span><span>Colombo ↗ Everywhere</span></div>
    </div>
    <div className="studio-layout">
      <div className="studio-copy">
        <p className="studio-lede">Close to the idea.<br /><span>Closer to the details.</span></p>
        <p>We’re Ardeno, an independent design and development studio in Colombo. We make websites and digital products with character, clarity, and purpose.</p>
        <p>From the first sketch to the last line of code, you work directly with the two founders. The people listening to your ideas are the people bringing them to life.</p>
      </div>
      <div className="studio-people">
        <p className="studio-people-label">The people behind the pixels</p>
        <div className="founder-grid">
          <a href="/founders.html#suven-seoras"><span className="founder-initial">SS</span><span><strong>Suven Seoras</strong><small>Product & engineering</small></span><ArrowUpRight size={17} /></a>
          <a href="/founders.html#ovindu-karunaratne"><span className="founder-initial">OK</span><span><strong>Ovindu Karunaratne</strong><small>Design & client direction</small></span><ArrowUpRight size={17} /></a>
        </div>
        <button className="text-button" onClick={onContact}><span className="ul">Meet your next creative partners</span><ArrowUpRight size={18} /></button>
      </div>
    </div>
    <div className="studio-principles"><span><Check size={16} /> Direct founder access</span><span><Check size={16} /> Custom design & code</span><span><Check size={16} /> Clear scope & communication</span><span><Check size={16} /> Support after launch</span></div>
  </section>;
}

const questions = [
  ['What kind of projects do you take on?', 'We build custom business websites, redesign existing sites, and develop practical digital products such as booking systems and AI lead assistants. If you have a different challenge in mind, we’re happy to hear it.'],
  ['How much will my project cost?', 'Every project starts with a conversation about your goals and scope. We’ll give you a clear proposal with deliverables, a timeline, and a cost before work begins. No surprise extras.'],
  ['How long does a project take?', 'The timeline depends on the scope, content, and integrations. We agree on milestones with you at the start and keep you updated as the project moves forward.'],
  ['Can we work together remotely?', 'Absolutely. We’re based in Colombo and work with teams wherever they are. We use calls, shared previews, and direct communication to keep the work moving.'],
  ['What happens after launch?', 'We stay close for post-launch support and refinements. We’ll agree on the support scope with you so you know who to contact and what’s covered.'],
];

function FAQ({ onContact }: { onContact: () => void }) {
  return <section id="questions" className="site-section faq-section"><div><SectionLabel number="05">A few answers</SectionLabel><h2>Before we<br /><em>say hello.</em></h2><p>Something else on your mind?</p><button className="text-button" onClick={onContact}><span className="ul">Just ask us</span><ArrowUpRight size={17} /></button></div><Accordion.Root type="single" collapsible className="faq-list">{questions.map(([question, answer], index) => <Accordion.Item className="faq-item" key={question} value={`question-${index}`}><Accordion.Header><Accordion.Trigger className="faq-trigger"><span className="faq-question">{question}</span><Plus size={19} /></Accordion.Trigger></Accordion.Header><Accordion.Content className="faq-answer"><p>{answer}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root></section>;
}

// The reply promise shown in the contact band. The old home hero and contact modal both say "Reply within 24 hrs" and the AI
// assistant's notes say Ardeno aims to respond within 24 hours, so this repeats what the studio already tells people. Change it here.
const REPLY_PROMISE = 'We reply within 24 hours';

// Quick starts under the intro, one per service on the page. Each opens the contact dialog with the first sentence of the message
// already written (a complete sentence, so even an unedited message reads properly).
const quickStarts = [
  ['New website', 'I’d like a new website. '],
  ['Website redesign', 'I’d like to redesign my website. '],
  ['Booking or order system', 'I’d like a booking or ordering system. '],
  ['AI assistant', 'I’d like an AI assistant for my website. '],
  ['Not sure yet', 'I’m not sure where to start yet. '],
] as const;

// The closing call to action. The headline is one big button with the ring arrow inline after "next?". When the band first scrolls
// into view the top row, the two headline lines and the bottom row rise in one after another, and the ring leans toward the pointer
// as it nears. The small text is Deep ink, as the brand guide asks for small text on orange. Styles are in contact.css.
export function Contact({ onContact }: { onContact: (email?: string, message?: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  useReveal(sectionRef);
  useMagnet(sectionRef, ringRef);
  return <section id="contact" ref={sectionRef} className="site-section contact-section">
    <div className="contact-top cr" style={delay(0)}>
      <div className="contact-kicker"><span className="status-dot" /> Your next chapter starts here.</div>
      <div className="contact-status"><span className="status-dot" aria-hidden="true" /><span>{REPLY_PROMISE}</span><span aria-hidden="true">·</span><ColomboClock /></div>
    </div>
    <h2 className="contact-title">
      <button type="button" className="contact-headline" data-sparks="--accent-ink --paper" onClick={() => onContact()}>
        <span className="contact-line"><span className="contact-line-in" style={delay(120)}>Ready for</span></span>{' '}
        <span className="contact-line"><span className="contact-line-in" style={delay(230)}>what’s next?<span ref={ringRef} className="contact-arrow" aria-hidden="true"><ArrowUpRight /></span></span></span>
        <span className="sr-only"> Start a conversation</span>
      </button>
    </h2>
    <div className="contact-bottom cr" style={delay(520)}>
      <div className="contact-ask">
        <p className="contact-intro">Tell us what you have in mind.<br />We’ll figure out the next step together.</p>
        <div className="contact-start" role="group" aria-label="What can we help with?">
          {quickStarts.map(([label, starter]) => <button key={label} type="button" className="contact-chip" data-sparks="--accent-ink --paper" onClick={() => onContact(undefined, starter)}>{label}</button>)}
        </div>
      </div>
      <div className="contact-mail">
        <a href={`mailto:${STUDIO_EMAIL}`}><span className="ul">{STUDIO_EMAIL}</span><ArrowUpRight size={16} aria-hidden="true" /></a>
        <CopyEmail sparks={['--accent-ink', '--paper']} />
      </div>
    </div>
  </section>;
}

// The time in Colombo (UTC+5:30, no daylight saving), split so the colon can blink. Falls back to plain arithmetic without Intl.
function colomboTime(now: Date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(now);
    const pick = (type: string) => parts.find(part => part.type === type)?.value ?? '';
    return { hour: pick('hour'), minute: pick('minute'), period: pick('dayPeriod') };
  } catch {
    const shifted = new Date(now.getTime() + 330 * 60_000);
    const hours = shifted.getUTCHours();
    return { hour: String(hours % 12 || 12), minute: String(shifted.getUTCMinutes()).padStart(2, '0'), period: hours < 12 ? 'AM' : 'PM' };
  }
}

// A live clock for the studio's home time. It only re-renders when the minute changes; the colon blinks in CSS.
function ColomboClock() {
  const [time, setTime] = useState(() => colomboTime(new Date()));
  useEffect(() => {
    const tick = () => setTime(previous => {
      const next = colomboTime(new Date());
      return previous.hour === next.hour && previous.minute === next.minute && previous.period === next.period ? previous : next;
    });
    const timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  return <span className="ar-clock"><span className="ar-clock-city">Colombo</span><span className="ar-clock-time">{time.hour}<span className="ar-clock-colon">:</span>{time.minute} {time.period}</span></span>;
}

const STUDIO_EMAIL = 'ardenostudio@gmail.com';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure pages: copy through a hidden field instead.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    return copied;
  }
}

// Copies the studio email on click. The label and icon roll over to "Copied" for a moment, with a few sparks.
function CopyEmail({ sparks = ['--accent', '--paper'] }: { sparks?: string[] }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { currentTarget: button, clientX, clientY } = event;
    const copied = await copyText(STUDIO_EMAIL);
    if (copied) burstSparksAt(button, clientX, clientY, sparks);
    setState(copied ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2200);
  };
  return <>
    <button type="button" className="ar-copy" data-state={state} onClick={copy}>
      <span className="ar-copy-icon" aria-hidden="true"><Copy size={15} /><Check size={15} /></span>
      <span className="ar-copy-label" aria-hidden="true"><span style={{ '--n': 0 } as React.CSSProperties}>Copy</span><span style={{ '--n': 1 } as React.CSSProperties}>Copied</span><span style={{ '--n': 2 } as React.CSSProperties}>Copy failed</span></span>
      <span className="sr-only">Copy email address</span>
    </button>
    <span className="sr-only" role="status">{state === 'copied' ? 'Email address copied' : state === 'failed' ? 'The email address could not be copied' : ''}</span>
  </>;
}

const footerLinks = [['Work', '#work'], ['Services', '#services'], ['Studio', '#about'], ['Contact', '#contact']];
const footerSocials = [
  ['Instagram', 'https://www.instagram.com/ardenostudio/'],
  ['LinkedIn', 'https://www.linkedin.com/company/ardentstudiolk'],
  ['WhatsApp', 'https://wa.me/94758504424'],
];
const delay = (ms: number) => ({ '--d': ms }) as React.CSSProperties;

// Big links, a conversation form, a social row and the reversed lockup (A in Signal, letters in paper) across the full width,
// as the brand guidelines ask for on ink. Everything rises in once when the footer scrolls into view; styles are in footer.css.
export function Footer({ onContact }: { onContact: (email?: string) => void }) {
  const footerRef = useRef<HTMLElement>(null);
  useReveal(footerRef);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    onContact(typeof email === 'string' ? email.trim() : undefined);
    event.currentTarget.reset();
  };
  return <footer ref={footerRef} className="site-footer ar-footer">
    <div className="ar-footer-top">
      <nav className="ar-footer-nav ar-r" style={delay(0)} aria-label="Footer navigation">{footerLinks.map(([label, href]) => <a key={label} className="nav-roll-link ar-footer-link" href={href}><RollText text={label} /></a>)}</nav>
      <div className="ar-footer-cta ar-r" style={delay(120)}>
        <p>Prefer to write?<br />Start with your email.</p>
        <form onSubmit={submit}>
          <label className="sr-only" htmlFor="footer-email">Your email address</label>
          <input id="footer-email" name="email" type="email" required placeholder="Your email address" autoComplete="email" maxLength={254} />
          <button type="submit" aria-label="Start a conversation"><ArrowRight size={22} aria-hidden="true" /></button>
        </form>
        <div className="ar-footer-contact">
          <a className="ar-footer-mail" href={`mailto:${STUDIO_EMAIL}`}><span className="ul">{STUDIO_EMAIL}</span><ArrowUpRight size={14} aria-hidden="true" /></a>
          <CopyEmail />
        </div>
      </div>
    </div>
    <div className="ar-footer-social ar-r" style={delay(240)}>
      <span className="ar-footer-rule" aria-hidden="true" />
      <nav aria-label="Social and resources">
        {footerSocials.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer"><span className="ul">{label}</span><ArrowUpRight size={15} aria-hidden="true" /></a>)}
        <a href="/docs"><span className="ul">Studio docs</span><ArrowUpRight size={15} aria-hidden="true" /></a>
      </nav>
    </div>
    <div className="ar-footer-mark">
      {/* The master has 8 units of padding on each side; crop it so the artwork lines up with the page edges. */}
      <svg viewBox={`8 -26 ${LOCKUP.width - 16} ${LOCKUP.height + 26}`} role="img" aria-label="ardeno">
        <title>ardeno</title>
        <path className="ar-footer-a" d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} />
        {LOCKUP.glyphs.map((glyph, index) => <g key={index} className="ar-glyph" style={{ '--i': index } as React.CSSProperties}><path d={glyph.d} transform={glyph.transform} /></g>)}
      </svg>
    </div>
    <div className="ar-footer-meta ar-r" style={delay(520)}>
      <span>© {new Date().getFullYear()} Ardeno Studio</span>
      <ColomboClock />
      <span>Independent by choice. Made in Colombo. Built for everywhere.</span>
      <a href="#top"><span className="ul">Back to top</span><ArrowUpRight size={14} aria-hidden="true" /></a>
    </div>
  </footer>;
}

// "Built by Ardeno": the sites the studio has built (the platforms and live websites in data/projects.ts) as a strip of cards.
// A card opens the live platform, and hovering it ripples a pixel shimmer out from its middle (PixelCanvas). Styles are in built.css.
// Every card comes from the project data, in the order of BUILT_IDS. LOOKS gives a platform its own face where
// it has one (files in public/images/logos): a logo instead of its name and its own shimmer colours.
// Logos are grey and a little faded at rest and in their own colours on hover (the black ones just fade). Without a look, a card shows
// the name with Signal orange shimmer.
type Look = { logo?: { src: string; width: number; height: number; text?: string }; pixels?: string[] };
type Built = { id: string; title: string; category: string; url?: string } & Look;
const PIXEL_COLORS = ['#ff3301', '#ff6a45', '#ffa088']; // Signal and two tints of it
const LOOKS: Record<string, Look> = {
  // Octane's italic wordmark as octane-smoky.vercel.app publishes it (the viewBox trimmed to the letters); one flat amber for the dots
  octane: { logo: { src: '/images/logos/octane-logo.svg', width: 92, height: 27 }, pixels: ['#F7A711'] },
  // Motormila's Apex M mark beside its name; dots in its electric blue and tints
  motormila: { logo: { src: '/images/logos/motormila-mark.png', width: 32, height: 32, text: 'Motormila' }, pixels: ['#0A7AFF', '#4098FF', '#80BCFF'] },
  // Dinaya's paperclip mark beside its wordmark (dinaya-lk.vercel.app sets it as the text "Dinaya.lk" in Cal Sans), spaced as on its login
  // page (.has-text in built.css); dots in the blue of its button
  'dinaya-lk': { logo: { src: '/images/logos/dinaya-mark.svg', width: 27, height: 27, text: 'Dinaya.lk' }, pixels: ['#2566e9', '#608fef', '#99b7f5'] },
  // koel's wordmark exactly as koel-cse.vercel.app publishes it; one flat dark tan for the dots
  'koel-cse': { logo: { src: '/images/logos/koel-logo.svg', width: 64, height: 28 }, pixels: ['#A0805A'] },
  // The last four each show the logo their own site publishes (Serendib's crest as it is; Ceylon Stories' black badge and Wax In The
  // City's maroon emblem scaled down from 4500px and 1200px PNGs to 288px WebP; CHS's mark with its path numbers rounded), with shimmer
  // in the brand's own colour and two tints of it: Serendib gold #D4AF37 (its buttons), Ceylon Stories olive green #5B6D43 (its colour
  // logo), CHS navy #063362 (its mark), Wax maroon #8B1235 (its buttons).
  'serendib-trading': { logo: { src: '/images/logos/serendib-logo.png', width: 60, height: 60 }, pixels: ['#D4AF37', '#E0C56D', '#EBD9A1'] },
  'ceylon-stories': { logo: { src: '/images/logos/ceylon-stories-logo.webp', width: 64, height: 64 }, pixels: ['#5B6D43', '#879476', '#B2BAA7'] },
  'ceylon-hygiene': { logo: { src: '/images/logos/chs-mark.svg', width: 52, height: 43 }, pixels: ['#063362', '#496A8C', '#8A9FB5'] },
  'wax-in-the-city': { logo: { src: '/images/logos/wax-in-the-city-logo.webp', width: 60, height: 60 }, pixels: ['#8B1235', '#AA526C', '#C890A0'] },
};
const BUILT_IDS = ['octane', 'propertylk', 'motormila', 'lankawa', 'dinaya-lk', 'koel-cse', 'serendib-trading', 'ceylon-stories', 'ceylon-hygiene', 'wax-in-the-city'];

export function BuiltStrip() {
  const platforms: Built[] = BUILT_IDS.map(id => PROJECTS.find(project => project.id === id)).filter((project): project is Project => Boolean(project)).map(project => ({ ...project, ...LOOKS[project.id] }));
  return <section className="built-strip" aria-labelledby="built-title">
    <div className="built-grid">
      <div className="built-intro">
        <h2 className="built-badge" id="built-title">Built by Ardeno</h2>
        <p>A small studio.<br /><strong>With work out in the world.</strong></p>
      </div>
      {platforms.map(project => <a key={project.id} className="built-card" href={project.url ?? '#work'} {...(project.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-label={`${project.title}, ${project.category}${project.url ? ' (opens in a new tab)' : ''}`}>
        <PixelCanvas colors={project.pixels ?? PIXEL_COLORS} />
        {project.logo
          ? <span className={project.logo.text ? 'built-logo has-text' : 'built-logo'}><img src={project.logo.src} alt="" width={project.logo.width} height={project.logo.height} loading="lazy" decoding="async" />{project.logo.text && <span>{project.logo.text}</span>}</span>
          : <span className="built-name">{project.title}</span>}
        <span className="built-kind">{project.category}</span>
        <ArrowUpRight className="built-arrow" size={14} aria-hidden="true" />
      </a>)}
    </div>
  </section>;
}

export function Site({ onContact }: { onContact: (email?: string, message?: string) => void }) {
  useSiteInteractions();
  const canvasRef = useRef<HTMLDivElement>(null);
  return <div className="site-shell" id="top" ref={canvasRef}>
    <a className="site-skip-link" href="#work">Skip to selected work</a>
    <SiteHeader onContact={onContact} />
    <main>
      <Hero onContact={onContact} />
      <BuiltStrip />
      <Work />
      <Services onContact={onContact} />
      <Approach />
      <Studio onContact={onContact} canvasRef={canvasRef} />
      <FAQ onContact={onContact} />
      <Contact onContact={onContact} />
    </main>
    <Footer onContact={onContact} />
  </div>;
}
