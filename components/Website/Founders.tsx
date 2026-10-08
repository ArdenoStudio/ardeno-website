import React, { useEffect, useRef, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import { SiteHeader, SectionLabel, BuiltStrip, Contact, Footer } from './Site';
import { ContactDialog } from './ContactDialog';
import { PixelCanvas } from './PixelCanvas';
import { burstSparks } from './clickSpark';
import { useSiteInteractions, useReveal } from './interactions';
import { placeFill, useDotGlow } from './Hero';
import './website.css';
import './navigation.css';
import './hero.css';
import './interactions.css';
import './brand.css';
import './footer.css';
import './contact.css';
import './built.css';
import './founders.css';

// ─── Data ────────────────────────────────────────────────────────────────────

type Founder = {
  id: string;
  name: string;
  initials: string;
  role: string;
  line: string;
  tint: string;
  pixels: string[];
  sticker: string;
  bio: string[];
  owns: string[];
  tags: string[];
  links: { label: string; href: string }[];
  ask: [string, string][];
};

const FOUNDERS: Founder[] = [
  {
    id: 'suven-seoras',
    name: 'Suven Seoras',
    initials: 'SS',
    role: 'Product & engineering',
    line: 'The architecture, the platforms, the last 10%.',
    tint: '#d7d9e5',
    pixels: ['#0A7AFF', '#4098FF', '#80BCFF'],
    sticker: '/brand/studio-iced-coffee.png',
    bio: [
      'Suven is the engineering half of Ardeno. Architecture, platforms, performance, AI systems — the engine room, and the last 10% most people skip.',
      'Motormila\u2019s market data, Koel\u2019s prediction engine, Dinaya\u2019s booking core. If it runs in production, he probably built it.',
    ],
    owns: ['Architecture', 'Platforms', 'Performance', 'AI systems'],
    tags: ['TypeScript', 'React', 'Python', 'Machine learning', 'Data pipelines'],
    links: [
      { label: 'GitHub', href: 'https://github.com/SuvenSeo' },
      { label: 'Instagram', href: 'https://www.instagram.com/s.suven.s/' },
    ],
    ask: [
      ['Why is my site slow?', 'He\u2019ll find the bottleneck before your coffee cools.'],
      ['Can machine learning do this?', 'Probably. He\u2019ll tell you honestly when it can\u2019t.'],
      ['What\u2019s the last 10%?', 'The details everyone else ships without.'],
    ],
  },
  {
    id: 'ovindu-karunaratne',
    name: 'Ovindu Karunaratne',
    initials: 'OK',
    role: 'Design & client direction',
    line: 'The identity, the experience, the relationship.',
    tint: '#eadfbf',
    pixels: ['#D4AF37', '#E0C56D', '#EBD9A1'],
    sticker: '/brand/studio-binder-clip.png',
    bio: [
      'Ovindu is the design half of Ardeno. Identity, experience, client direction — the face of the work, and the relationship behind it.',
      'A builder in public and a hackathon regular. He led the Signal rebuild of the site you\u2019re reading now.',
    ],
    owns: ['Identity', 'Experience', 'Client direction', 'Delivery'],
    tags: ['Brand identity', 'UX design', 'Design systems', 'Client direction', 'Hackathons'],
    links: [
      { label: 'GitHub', href: 'https://github.com/Cookie-Cat21' },
    ],
    ask: [
      ['What should our brand feel like?', 'He\u2019ll show you, not tell you.'],
      ['How do we work together?', 'Directly. You\u2019ll talk to him, not an account manager.'],
      ['What\u2019s building in public like?', 'Ask him. He does it every week.'],
    ],
  },
];

const STATS = [
  { value: 3, suffix: '', label: 'Client sites live' },
  { value: 4, suffix: '', label: 'Platforms shipped' },
  { value: 7, suffix: '+', label: 'Projects in production' },
  { value: 2, suffix: '', label: 'Founders. Zero handoffs.' },
];

const STEPS: [string, string][] = [
  ['You talk to the founders.', 'The people on the call are the people doing the work. No account managers. No telephone game.'],
  ['Design and engineering, together.', 'Ovindu shapes it while Suven builds it. Nothing gets lost between disciplines.'],
  ['Small team, full ownership.', 'Two people carry your project from first sketch to launch. Then they stay for what\u2019s next.'],
  ['Support after launch.', 'You\u2019ll always know who to call. It\u2019s one of two numbers.'],
];

const TIMELINE = [
  { year: '2026', title: 'Two friends, one studio.', copy: 'Ardeno Studio is founded in Colombo. Two builders, one shared obsession: work that ships.' },
  { year: '2026', title: 'First client site goes live.', copy: 'A ladies-only salon in Nugegoda. Wax in the City opens its digital doors.' },
  { year: '2026', title: 'First platform ships.', copy: 'Motormila, the vehicle market tracker. Live prices, real data, out in the world.' },
  { year: '2026', title: 'The roster grows.', copy: 'Serendib Trading and Ceylon Hygiene Solutions join as clients. Dinaya, Koel and Lankawa ship as platforms.' },
  { year: 'Today', title: 'Two people. A real body of work.', copy: 'The studio is still two founders. The work speaks for itself.' },
];

const VALUES = ['Character.', 'Clarity.', 'Purpose.', 'Craft.', 'Colombo \u2197 Everywhere.'];


function DotLines({ glowRef }: { glowRef?: React.Ref<SVGSVGElement> }) {
  const words = (
    <>
      <text x="1500" y="242" textAnchor="end" fill="currentColor">two</text>
      <text x="1500" y="472" textAnchor="end" fill="currentColor">minds.</text>
    </>
  );
  return (
    <>
      <svg className="editorial-dot-type" viewBox="0 0 1500 550" focusable="false" aria-hidden="true">{words}</svg>
      <svg ref={glowRef} className="editorial-dot-type editorial-dot-glow" viewBox="0 0 1500 550" focusable="false" aria-hidden="true">{words}</svg>
    </>
  );
}

// A section that rises in once when it scrolls into view.
function RevealSection({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return <section ref={ref} id={id} className={`f-section ${className}`}>{children}</section>;
}

// Counts up when it scrolls into view. Reduced motion shows the final number straight away.
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setDisplay(value);
      return;
    }
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      const begin = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const t = Math.min(1, (now - begin) / duration);
        setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
}

// ─── Sections ────────────────────────────────────────────────────────────────

function FoundersHero({ onContact }: { onContact: () => void }) {
  const hostRef = useRef<HTMLElement>(null);
  const glowRef = useRef<SVGSVGElement>(null);
  useDotGlow(hostRef, glowRef);

  return (
    <section ref={hostRef} className="editorial-hero founders-hero" aria-labelledby="founders-heading">
      <div className="editorial-meta">
        <span><span className="status-dot" aria-hidden="true" />The studio is two people.</span>
        <span>Est. 2026 — Colombo</span>
      </div>
      <div className="editorial-composition">
        <div className="editorial-backdrop" aria-hidden="true">
          <DotLines glowRef={glowRef} />
        </div>
        <div className="editorial-foreground">
          <div className="editorial-message">
            <h1 id="founders-heading"><span>The people behind</span><span className="founders-h1-muted">the pixels.</span></h1>
            <p className="editorial-description">Suven builds it. Ovindu shapes it.<br />You talk to both of them.</p>
            <div className="editorial-actions">
              <button
                className="editorial-cta"
                onPointerEnter={placeFill}
                onPointerLeave={placeFill}
                onClick={event => { burstSparks(event, ['--accent', '--ink', '--paper']); onContact(); }}
              >
                <span className="cta-fill" aria-hidden="true" />
                <span className="cta-label"><span>Work with us</span><span aria-hidden="true">Work with us</span></span>
                <span className="cta-arrow" aria-hidden="true"><ArrowUpRight size={18} /><ArrowUpRight size={18} /></span>
              </button>
              <a className="text-button" href="/"><span className="ul">See the studio&rsquo;s work</span><ArrowUpRight size={18} /></a>
            </div>
          </div>
          <ul className="founder-fan" aria-label="The founders">
            {FOUNDERS.map(founder => (
              <li key={founder.id}>
                <a className="founder-card" href={`#${founder.id}`}>
                  <span className="founder-card-visual" style={{ background: founder.tint }}>
                    <PixelCanvas colors={founder.pixels} />
                    <span className="founder-monogram" aria-hidden="true">{founder.initials}</span>
                    <img className="founder-sticker" src={founder.sticker} alt="" width={400} height={400} loading="lazy" decoding="async" draggable={false} />
                  </span>
                  <span className="founder-card-caption">
                    <strong>{founder.name}</strong><small>{founder.role}</small>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FounderChapter({ founder, flipped }: { founder: Founder; flipped: boolean }) {
  return (
    <article id={founder.id} className={`founder-chapter f-rise${flipped ? ' is-flipped' : ''}`}>
      <div className="founder-portrait-col">
        <div className="founder-portrait" style={{ background: founder.tint }}>
          <PixelCanvas colors={founder.pixels} />
          <span className="founder-monogram" aria-hidden="true">{founder.initials}</span>
        </div>
      </div>
      <div className="founder-copy">
        <p className="founder-eyebrow"><span className="status-dot" aria-hidden="true" />{founder.role}</p>
        <h2 className="founder-name">{founder.name}</h2>
        <p className="founder-line">{founder.line}</p>
        <div className="founder-bio">
          {founder.bio.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <p className="founder-owns-label">Owns</p>
        <ul className="founder-owns">
          {founder.owns.map(item => <li key={item}>{item}</li>)}
        </ul>
        <div className="service-tags">
          {founder.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
        <div className="founder-links">
          {founder.links.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              <span className="ul">{link.label}</span><ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="founder-ask">
          <p className="founder-ask-label">Ask me about</p>
          <Accordion.Root type="single" collapsible className="faq-list">
            {founder.ask.map(([question, answer], index) => (
              <Accordion.Item className="faq-item" key={question} value={`${founder.id}-ask-${index}`}>
                <Accordion.Header>
                  <Accordion.Trigger className="faq-trigger">
                    <span className="faq-question">{question}</span><Plus size={19} aria-hidden="true" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="faq-answer"><p>{answer}</p></Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </article>
  );
}

function StatsBand() {
  return (
    <div className="stats-band f-rise">
      {STATS.map(stat => (
        <div className="stat" key={stat.label}>
          <div className="stat-value"><CountUp value={stat.value} suffix={stat.suffix} /></div>
          <p className="stat-label">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function ValuesTicker() {
  return (
    <div className="values-ticker f-rise" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map(copy => (
          <div className="ticker-copy" key={copy}>
            {VALUES.map(value => <span key={value}>{value}<b>&thinsp;·</b></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FoundersPage() {
  useSiteInteractions();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contact, setContact] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillMessage, setPrefillMessage] = useState('');
  const contactTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = 'Founders — Ardeno Studio';
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    }
  }, []);

  const openContact = (email?: unknown, message?: unknown) => {
    setPrefillEmail(typeof email === 'string' ? email : '');
    setPrefillMessage(typeof message === 'string' ? message : '');
    contactTrigger.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setContact(true);
  };
  const returnContactFocus = () => {
    const target = contactTrigger.current?.isConnected
      ? contactTrigger.current
      : document.querySelector<HTMLButtonElement>('.header-contact');
    target?.focus();
  };

  return (
    <div className="ardeno-site">
      <div className="site-shell" id="top" ref={canvasRef}>
        <a className="site-skip-link" href="#founders">Skip to founders</a>
        <svg className="studio-sticker-defs" aria-hidden="true" width="0" height="0">
          <defs>
            <filter id="founders-sticker-filter" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="cutout" />
              <feFlood floodColor="#fff" />
              <feComposite in2="cutout" operator="in" />
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#20211f" floodOpacity=".2" />
            </filter>
          </defs>
        </svg>
        <SiteHeader onContact={() => openContact()} anchorBase="/" />
        <main>
          <FoundersHero onContact={() => openContact()} />

          <RevealSection id="founders" className="site-section founders-chapters">
            <div className="f-rise"><SectionLabel number="01">The founders</SectionLabel></div>
            {FOUNDERS.map((founder, index) => (
              <FounderChapter key={founder.id} founder={founder} flipped={index % 2 === 1} />
            ))}
            <StatsBand />
          </RevealSection>

          <RevealSection className="site-section founders-method">
            <div className="f-rise">
              <SectionLabel number="02">How we work together</SectionLabel>
              <div className="section-heading">
                <h2>One room. Two minds.<br /><span>No handoffs.</span></h2>
              </div>
            </div>
            <div className="process-grid f-rise">
              {STEPS.map(([title, description], index) => (
                <div className="process-step" key={title}>
                  <div className="step-top">
                    <span className="tabular-nums">0{index + 1}</span>
                    {index === 3 ? <Check size={22} /> : <ArrowRight size={22} />}
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection className="site-section founders-story">
            <div className="f-rise">
              <SectionLabel number="03">The story so far</SectionLabel>
              <div className="section-heading">
                <h2>The story<br /><span>so far.</span></h2>
              </div>
            </div>
            <ol className="founders-timeline f-rise">
              {TIMELINE.map(beat => (
                <li className="timeline-beat" key={beat.title}>
                  <span className="timeline-year tabular-nums">{beat.year}</span>
                  <h3>{beat.title}</h3>
                  <p>{beat.copy}</p>
                </li>
              ))}
              <li className="timeline-beat timeline-cta-beat">
                <span className="timeline-year tabular-nums">Next</span>
                <h3>Your project belongs here too.</h3>
                <button type="button" className="site-button" onClick={() => openContact()}>
                  <span>Start a conversation</span><ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </li>
            </ol>
          </RevealSection>

          <ValuesTicker />
          <BuiltStrip />
          <Contact onContact={openContact} />
        </main>
        <Footer onContact={openContact} anchorBase="/" />
        <ContactDialog
          open={contact}
          onOpenChange={setContact}
          returnFocus={returnContactFocus}
          defaultEmail={prefillEmail}
          defaultMessage={prefillMessage}
        />
      </div>
    </div>
  );
}
