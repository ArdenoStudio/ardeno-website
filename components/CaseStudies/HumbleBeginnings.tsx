import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowLeft, ArrowUpRight, X,
  Coffee, Plane, Dumbbell, Trophy, Sparkles, Utensils,
  Shield, Zap, Award, PenTool
} from 'lucide-react';
import { GlobePulse } from '../UI/cobe-globe-pulse';
import './CaseStudiesPage.css';

const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    industry: 'Café',
    icon: Coffee,
    name: 'Cinnamon Oak Cafe',
    short: 'CINNAMON',
    desc: 'Elevating a boutique coffee experience with a sophisticated, artisanal digital storefront.',
    url: '#'
  },
  {
    id: 2,
    industry: 'Aviation',
    icon: Plane,
    name: 'Global Jet Concierge',
    short: 'AVIATION',
    desc: 'A high-altitude, luxury charter interface designed for precision and exclusivity.',
    url: '#'
  },
  {
    id: 3,
    industry: 'Gym',
    icon: Dumbbell,
    name: 'Lanka Fitness',
    short: 'FITNESS',
    desc: "High-impact, high-energy platform for Sri Lanka's leading boutique fitness community.",
    url: '#'
  },
  {
    id: 4,
    industry: 'Sports',
    icon: Trophy,
    name: 'Lanka Motion',
    short: 'MOTION',
    desc: 'Kinetic, performance-driven storytelling for a premier sports media collective.',
    url: '#'
  },
  {
    id: 5,
    industry: 'Salon',
    icon: Sparkles,
    name: 'Luxe Lanka',
    short: 'LUXE',
    desc: 'A digital sanctuary for high-end beauty, blending editorial aesthetics with seamless booking.',
    url: '#'
  },
  {
    id: 6,
    industry: 'Restaurant',
    icon: Utensils,
    name: 'Urban Kitchen',
    short: 'KITCHEN',
    desc: 'Crafting a visual feast for a modern culinary destination with fluid, seasonal layouts.',
    url: '#'
  }
];

const PortfolioGrid: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeProject = PORTFOLIO_PROJECTS.find(p => p.id === activeId);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveId(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="portfolio-section-container">
      {/* The Floating Overlay */}
      <AnimatePresence>
        {activeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveId(null)}
            className="portfolio-view-overlay"
          />
        )}
      </AnimatePresence>

      {/* The Grid */}
      <ul className="portfolio-grid">
        {PORTFOLIO_PROJECTS.map((p, idx) => (
          <li key={p.id} className="p-grid-item">
            <motion.div
              layoutId={`p-card-${p.id}`}
              onClick={() => setActiveId(p.id)}
              className="p-capsule p-grid-capsule"
              whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="p-card-header">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">0{idx + 1} / 06</span>
                  <motion.div layoutId={`p-icon-${p.id}`} className="text-accent">
                    <p.icon size={16} strokeWidth={1.5} />
                  </motion.div>
                </div>
                <div className="p-action-circle"><span className="text-white">+</span></div>
              </div>
              <motion.h3 layoutId={`p-name-${p.id}`} className="p-title-display">{p.name}</motion.h3>
            </motion.div>
          </li>
        ))}
      </ul>

      {/* The Shared Element Modal */}
      <AnimatePresence>
        {activeId && activeProject && (
          <div className="p-modal-root">
            <motion.div
              layoutId={`p-card-${activeProject.id}`}
              className="p-capsule p-modal-capsule"
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Noise Texture */}
              <div className="p-noise" />

              {/* Massive Background Text */}
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.03, scale: 1 }}
                className="p-modal-bg-text"
              >
                {activeProject.short}
              </motion.div>

              <div className="p-modal-content relative z-10">
                <div className="p-card-header mb-32">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-white/40 font-mono tracking-[0.3em] uppercase">PROJECT 0{activeProject.id}</span>
                    <motion.div layoutId={`p-icon-${activeProject.id}`} className="text-accent">
                      <activeProject.icon size={20} strokeWidth={1.5} />
                    </motion.div>
                  </div>

                  <button
                    className="p-close-circle"
                    onClick={(e) => { e.stopPropagation(); setActiveId(null); }}
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <motion.h3 layoutId={`p-name-${activeProject.id}`} className="p-modal-title">{activeProject.name}</motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="p-modal-footer"
                >
                  <p className="p-description-large">{activeProject.desc}</p>

                  <div className="flex items-center gap-8 mt-12">
                    <motion.a
                      href={activeProject.url}
                      className="p-cta-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      EXPLORE PROJECT <ArrowUpRight className="ml-2 w-4 h-4" />
                    </motion.a>

                    <div className="h-px w-24 bg-white/10" />
                    <span className="text-[10px] text-white/30 font-mono tracking-widest">CONCEPT WORK 2024</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
const MagneticLogo: React.FC<{ src: string; alt: string; className?: string; isNew?: boolean }> = ({ src, alt, className, isNew }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const springX = useSpring(x, { damping: 25, stiffness: 150 });
  const springY = useSpring(y, { damping: 25, stiffness: 150 });
  const springRotateX = useSpring(rotateX, { damping: 25, stiffness: 150 });
  const springRotateY = useSpring(rotateY, { damping: 25, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX * 0.4);
    y.set(mouseY * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springRotateX,
        rotateY: springRotateY,
        x: springX,
        y: springY,
      }}
      className={`logo-magnetic-wrap ${className}`}
    >
      <img
        src={src} alt={alt}
        style={{ width: isNew ? '160px' : '140px' }}
        className={isNew ? "drop-shadow-[0_0_40px_rgba(229,9,20,0.4)]" : "opacity-20 grayscale transition-all duration-500 group-hover:opacity-60 group-hover:grayscale-0"}
      />
    </motion.div>
  );
};

const ServiceCardPro: React.FC<{ num: string; title: string; desc: string }> = ({ num, title, desc }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="service-card-pro"
      whileInView="scroll-focus-active"
      viewport={{ once: false, amount: 0.6 }}
      variants={{
        "scroll-focus-active": { /* handled via CSS */ }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="service-glow-hub" />
      <span className="service-watermark">{num}</span>
      <p className="s-num">PHASE {num}</p>
      <h3 className="s-title">{title}</h3>
      <p className="s-desc">{desc}</p>
    </motion.div>
  );
};

const LogoPanelPro: React.FC<{ isNew?: boolean; badge: string; src: string; desc: React.ReactNode }> = ({ isNew, badge, src, desc }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`logo-panel-pro group ${isNew ? 'panel-new-pro' : 'panel-old-pro'}`}
      initial={{ opacity: 0, x: isNew ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: isNew ? 0.2 : 0, duration: 0.8 }}
    >
      <div className="service-glow-hub" />
      {isNew && (
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E50914]/15 blur-[60px] pointer-events-none"
          style={{ zIndex: 1 }}
        />
      )}
      <span className={`panel-badge-pro ${isNew ? 'adopted-pro' : ''}`}>{badge}</span>
      <MagneticLogo src={src} alt={badge} isNew={isNew} className="mb-12" />
      <div className="relative z-10">{desc}</div>
    </motion.div>
  );
};

export const HumbleBeginnings: React.FC = () => {
  const [activeNavLabel, setActiveNavLabel] = useState('Overview');
  const [dockExpanded, setDockExpanded] = useState(false);
  const dockSections = [
    { id: 'hero', label: 'Overview' },
    { id: 's-origin', label: 'Origin' },
    { id: 's-market', label: 'Market' },
    { id: 's-identity', label: 'Identity' },
    { id: 's-services', label: 'Services' },
    { id: 's-build', label: 'The Build' },
    { id: 's-tech', label: 'Tech Stack' },
    { id: 's-portfolio', label: 'Portfolio' },
    { id: 's-process', label: 'Process' },
    { id: 's-learned', label: 'Lessons' },
  ];
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Progress
    const bar = document.getElementById('progress');
    const onScroll = () => {
      if (bar) {
        const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
        bar.style.width = Math.min(Math.round(pct), 100) + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Section reveal
    const sections = document.querySelectorAll('.section');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        e.target.querySelectorAll('.identity-row, .page-row').forEach((row, i) => {
          setTimeout(() => { row.classList.add('visible'); }, pref ? 0 : i * 80);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.07 });
    sections.forEach(s => obs.observe(s));

    // Active nav dots
    const ids = ['hero', 's-origin', 's-market', 's-identity', 's-services', 's-build', 's-tech', 's-portfolio', 's-process', 's-learned'];
    const targets = ids.map(id => document.getElementById(id)).filter(Boolean);
    const links = document.querySelectorAll('#chapter-nav a');
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const i = targets.indexOf(e.target as HTMLElement);
        if (i < 0) return;
        const labels = ['Overview', 'Origin', 'Market', 'Identity', 'Services', 'The Build', 'Tech Stack', 'Portfolio', 'Process', 'Lessons'];
        setActiveNavLabel(labels[i]);
        links.forEach((l, j) => {
          l.classList.toggle('active', j === i);
          l.setAttribute('aria-current', j === i ? 'true' : 'false');
        });
      });
    }, { threshold: 0.15 });
    targets.forEach(t => t && navObs.observe(t));

    // Hero parallax
    const heroGhost = document.querySelector('.hero-ghost') as HTMLElement;
    const heroContent = document.querySelector('.hero-content-wrap') as HTMLElement;
    const heroHeight = window.innerHeight;
    const scrollParallax = () => {
      const y = window.scrollY;
      if (y > heroHeight * 2) return; // limit parallax range
      if (heroGhost) heroGhost.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      if (heroContent) heroContent.style.transform = `translate3d(0, ${y * -0.1}px, 0)`;
    };
    window.addEventListener('scroll', scrollParallax, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', scrollParallax);
      // Reset transforms so back-navigation isn't broken
      if (heroGhost) heroGhost.style.transform = 'translate3d(0, 0, 0)';
      if (heroContent) heroContent.style.transform = 'translate3d(0, 0, 0)';
      obs.disconnect();
      navObs.disconnect();
    };
  }, []);

  const originRef = useRef(null);
  const { scrollYProgress: originScroll } = useScroll({
    target: originRef,
    offset: ["start end", "end start"]
  });
  const originParallax = useTransform(originScroll, [0, 1], [-100, 100]);

  return (
    <motion.div
      key="humble-beginnings-page"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="case-study-page"
    >



      <div id="progress" role="presentation" aria-hidden="true"></div>

      {/* Mobile Floating Nav Dock — Interactive Dynamic Island */}
      <>
        {/* Backdrop overlay when expanded */}
        <AnimatePresence>
          {dockExpanded && (
            <motion.div
              key="dock-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm"
              onClick={() => setDockExpanded(false)}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="mobile-nav-dock"
          initial={{ y: 100, x: "-50%" }}
          animate={{ y: 0, x: "-50%" }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            cursor: 'pointer',
            width: dockExpanded ? 'min(340px, 85vw)' : undefined,
            borderRadius: dockExpanded ? '20px' : '100px',
            height: dockExpanded ? 'auto' : '48px',
          }}
        >
          {/* Collapsed header — tap to expand/collapse */}
          <div
            className="flex items-center gap-3 w-full justify-center"
            onClick={(e) => { e.stopPropagation(); setDockExpanded(!dockExpanded); }}
            style={{ padding: dockExpanded ? '14px 16px 8px' : '0', minHeight: '48px' }}
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-accent ${dockExpanded ? '' : 'animate-pulse'}`} />
            <span className="dock-label">{activeNavLabel}</span>
            <motion.svg
              width="10" height="10" viewBox="0 0 10 10"
              style={{ marginLeft: '4px' }}
              animate={{ rotate: dockExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </div>

          {/* Expanded state — section list */}
          {dockExpanded && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '8px 4px 10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2px',
            }}>
              {dockSections.map((sec, i) => (
                <button
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDockExpanded(false);
                    setTimeout(() => {
                      const el = document.getElementById(sec.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeNavLabel === sec.label ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { if (activeNavLabel !== sec.label) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (activeNavLabel !== sec.label) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '8px',
                    color: activeNavLabel === sec.label ? '#E50914' : 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em',
                    minWidth: '16px',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '10px',
                    color: activeNavLabel === sec.label ? '#fff' : 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    fontWeight: activeNavLabel === sec.label ? 600 : 400,
                  }}>
                    {sec.label}
                  </span>
                  {activeNavLabel === sec.label && (
                    <div style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      background: '#E50914', marginLeft: 'auto',
                    }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </>

      {/* Floating Back Button */}
      <a
        href="/case-studies"
        onClick={(e) => handleNavClick(e, '/case-studies')}
        className="fixed top-8 left-6 md:top-12 md:left-12 z-[100] flex items-center gap-3 text-zinc-400 hover:text-white transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:scale-105 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ fontFamily: "var(--body)" }}>
          Back to Hub
        </span>
      </a>

      <nav id="chapter-nav" aria-label="Jump to section">
        <a href="#hero" className="active" aria-label="Overview" aria-current="true"><span className="dot"></span><span className="nav-label" aria-hidden="true">Overview</span></a>
        <a href="#s-origin" aria-label="The Origin" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Origin</span></a>
        <a href="#s-market" aria-label="The Market" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Market</span></a>
        <a href="#s-identity" aria-label="Identity and Rebrand" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Identity</span></a>
        <a href="#s-services" aria-label="Services" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Services</span></a>
        <a href="#s-build" aria-label="The Build" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">The Build</span></a>
        <a href="#s-tech" aria-label="Tech Stack" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Tech Stack</span></a>
        <a href="#s-portfolio" aria-label="Portfolio" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Portfolio</span></a>
        <a href="#s-process" aria-label="Process" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Process</span></a>
        <a href="#s-learned" aria-label="What We Learned" aria-current="false"><span className="dot"></span><span className="nav-label" aria-hidden="true">Lessons</span></a>
      </nav>

      <main id="main-content">

        <section id="hero" className="hero-story-mobile" aria-labelledby="hero-heading">
          <div className="hero-bg" aria-hidden="true"></div>
          <div className="hero-grid" aria-hidden="true"></div>
          <div className="hero-ghost" aria-hidden="true">
            <img
              src="/case-studies/humble/ardeno-logo.svg"
              alt=""
              className="w-[80vw] max-w-[1200px] h-auto object-contain opacity-[0.08]"
              style={{
                filter: 'brightness(0) invert(1)',
                WebkitMaskImage: 'radial-gradient(ellipse at 60% 50%, black 20%, transparent 72%)',
                maskImage: 'radial-gradient(ellipse at 60% 50%, black 20%, transparent 72%)'
              }}
            />
          </div>
          <div
            className="z-10 relative"
            style={{
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center md:items-start text-center md:text-left mt-[-10vh] md:mt-0"
            >
              <p className="hero-tag !justify-center md:!justify-start" aria-hidden="true">Case Study · March 2026</p>
              <h1
                id="hero-heading"
                className="hero-title w-full flex flex-col items-center md:items-start"
                style={{ fontSize: 'clamp(30px, 11vw, 116px)' }}
              >
                <span>HUMBLE</span>
                <span className="accent break-words md:whitespace-nowrap max-w-[90vw] block">BEGINNINGS</span>
              </h1>
              <p className="hero-sub !text-center md:!text-left !mx-auto md:!mx-0 mt-4 md:mt-0 max-w-[280px] md:max-w-md">
                How two people built Sri Lanka's premium web studio from zero.
              </p>
            </motion.div>

            <motion.dl
              className="w-full mx-auto md:mx-0 mt-10 md:mt-0 relative overflow-hidden transition-all duration-300 pointer-events-auto grid grid-cols-2 md:flex max-w-[340px] md:max-w-[640px] rounded-2xl md:rounded-lg"
              style={{
                alignItems: 'center',
                gap: 0,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
              aria-label="Project overview"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring', damping: 25, stiffness: 120 }}
            >
              <div className="flex-1 text-center md:text-left p-5 md:p-[18px_28px] border-r border-b border-white/10 md:border-b-0 relative hover:bg-[#e50914]/[0.04] transition-colors cursor-default">
                <dt className="flex justify-center md:justify-start font-mono text-[10px] md:text-[9px] text-[#E50914] tracking-[0.15em] uppercase mb-2 opacity-80">Studio</dt>
                <dd className="text-[20px] md:text-[22px] font-light text-white whitespace-nowrap" style={{ fontFamily: 'var(--body)' }}>Ardeno</dd>
                <div className="hidden md:block absolute right-0 top-[20%] h-[60%] w-px bg-white/10" />
              </div>
              <div className="flex-1 text-center md:text-left p-5 md:p-[18px_28px] border-b border-white/10 md:border-b-0 relative hover:bg-[#e50914]/[0.04] transition-colors cursor-default">
                <dt className="flex justify-center md:justify-start font-mono text-[10px] md:text-[9px] text-[#E50914] tracking-[0.15em] uppercase mb-2 opacity-80">Team</dt>
                <dd className="text-[20px] md:text-[22px] font-light text-white whitespace-nowrap" style={{ fontFamily: 'var(--body)' }}>2 Founders</dd>
                <div className="hidden md:block absolute right-0 top-[20%] h-[60%] w-px bg-white/10" />
              </div>
              <div className="flex-1 text-center md:text-left p-5 md:p-[18px_28px] border-r border-white/10 md:border-r-0 relative hover:bg-[#e50914]/[0.04] transition-colors cursor-default">
                <dt className="flex justify-center md:justify-start font-mono text-[10px] md:text-[9px] text-[#E50914] tracking-[0.15em] uppercase mb-2 opacity-80">Timeline</dt>
                <dd className="text-[20px] md:text-[22px] font-light text-white whitespace-nowrap" style={{ fontFamily: 'var(--body)' }}>2 Months</dd>
                <div className="hidden md:block absolute right-0 top-[20%] h-[60%] w-px bg-white/10" />
              </div>
              <div className="flex-1 text-center md:text-left p-5 md:p-[18px_28px] border-0 relative hover:bg-[#e50914]/[0.04] transition-colors cursor-default">
                <dt className="flex justify-center md:justify-start font-mono text-[10px] md:text-[9px] text-[#E50914] tracking-[0.15em] uppercase mb-2 opacity-80">Launched</dt>
                <dd className="text-[20px] md:text-[22px] font-light text-white whitespace-nowrap" style={{ fontFamily: 'var(--body)' }}>Mar 2026</dd>
              </div>
            </motion.dl>
          </div>
        </section>

        <section id="s-origin" ref={originRef} className="market-pro-section section" aria-labelledby="origin-h">
          <div className="parallax-watermark-container">
            <motion.span style={{ y: originParallax }} className="parallax-watermark">SILENCE</motion.span>
          </div>
          <div className="wrap">
            <motion.div
              className="glass-card-pro"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <header className="section-header">
                <span className="section-num" aria-hidden="true">02</span>
                <div className="section-title-wrap">
                  <p className="section-label">The Origin</p>
                  <h2 id="origin-h" className="section-title">The Brief<br />Was Silence</h2>
                  <div className="section-divider" aria-hidden="true"></div>
                </div>
              </header>
              <p className="body-lg">Ardeno didn't begin with a business plan. It began with a frustration — and a silence.</p>
              <p className="body-lg mt-32">Two people. A shared conviction that most websites are <strong>invisible</strong>. Generic builds that look like every competitor. Slow load times killing conversions before a word is read. Agencies that vanish after launch with no support, no iteration, no relationship.</p>
              <p className="body-lg mt-32">We knew we could do better. So we started reaching out — to potential clients, to collaborators, to anyone who might see what we were building. Nobody replied. Not because the idea was bad, but because we had nothing to point to. No name. No logo. No proof that we existed at all.</p>
              <p className="body-lg mt-32"><strong>That silence became the brief.</strong> We stopped waiting and started building.</p>
            </motion.div>
          </div>
        </section>

        <section id="s-market" className="market-pro-section" aria-labelledby="market-h">
          <div className="market-ambient-glow" />
          <div className="wrap-wide">
            <div className="market-grid-pro">
              <motion.div
                className="glass-card-pro"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.15 } }
                }}
              >
                <header className="section-header">
                  <motion.span
                    className="section-num" aria-hidden="true"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >03</motion.span>
                  <div className="section-title-wrap">
                    <motion.p
                      className="section-label !text-[#E50914]"
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >The Market</motion.p>
                    <motion.h2
                      id="market-h" className="section-title"
                      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >The Problem<br />With Web Design<br />in Sri Lanka</motion.h2>
                    <motion.div
                      className="section-divider" aria-hidden="true"
                      variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                </header>
                <motion.p className="body-lg" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>Sri Lanka has no shortage of web design agencies. What it lacks is studios that treat every project as a craft problem — not a production line.</motion.p>
                <motion.p className="body-lg mt-32" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>The big agencies charge serious money for work that looks like it came from a free template. Clients pay premium prices and receive websites that <strong className="text-white">embarrass their brands</strong>.</motion.p>
                <motion.p className="body-lg mt-32" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>A few studios do get it right — the work is there if you look hard enough. But they are the exception, not the rule. We started Ardeno because we believed the market deserved better.</motion.p>
                <motion.blockquote
                  className="pull-quote-pro"
                  variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p>"Your brand isn't generic. Your website shouldn't be either. We build from zero — every pixel considered, every interaction earned."</p>
                  <cite>— Ardeno Studio, 2026</cite>
                </motion.blockquote>
              </motion.div>

              <div className="market-visual">
                <div className="globe-silhouette-mobile" />
                <div className="globe-wrapper">
                  <div className="globe-glow-hub" />
                  <GlobePulse className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="s-identity" className="section" aria-labelledby="identity-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">04</span>
              <div className="section-title-wrap">
                <p className="section-label">Identity &amp; The Rebrand</p>
                <h2 id="identity-h" className="section-title">The Crisis That<br />Made Us Sharper</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">The first month was almost entirely about identity. And it nearly broke us.</p>

            <div className="logo-showcase-pro">
              <LogoPanelPro
                badge="ORIGINAL CONCEPT"
                src="/case-studies/humble/ardent-logo.svg"
                desc={
                  <p className="text-[13px] text-zinc-500 font-mono text-center leading-relaxed">
                    "Ardent Studio"<br />Strikingly similar to a French studio we discovered mid-process.
                  </p>
                }
              />

              <LogoPanelPro
                isNew
                badge="FINAL BRAND"
                src="/case-studies/humble/ardeno-logo.svg"
                desc={
                  <p className="text-[13px] text-white/80 font-mono text-center leading-relaxed">
                    <strong>Ardeno.</strong><br />A brand that is entirely ours. Built from zero.
                  </p>
                }
              />
            </div>


            <p className="body-lg mt-48"><strong>We scrapped everything.</strong> Starting over mid-process is one of the most demoralising things that can happen. But it forced us to ask harder questions — not just what looked good, but what was genuinely ours.</p>


            <dl className="identity-table mt-48" aria-label="What emerged from the reset">
              <div className="identity-row"><dt className="identity-key">Name</dt><dd className="identity-val"><strong>Ardeno.</strong> Distinct. Unmistakably ours.</dd></div>
              <div className="identity-row"><dt className="identity-key">Position</dt><dd className="identity-val">Sri Lanka's premium web studio. <strong>Not the cheapest. Not the fastest. The most considered.</strong></dd></div>
              <div className="identity-row"><dt className="identity-key">Visual</dt><dd className="identity-val">Dark and premium. Near-black backgrounds. <strong>Bold condensed typography. Orange-red accent.</strong> Geometric 'A' mark.</dd></div>
              <div className="identity-row"><dt className="identity-key">Voice</dt><dd className="identity-val"><strong>Punchy. Direct. Confident without arrogance.</strong> Craft, not templates.</dd></div>
            </dl>
          </div>
        </section>

        <section id="s-services" className="section" aria-labelledby="services-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">05</span>
              <div className="section-title-wrap">
                <p className="section-label">Services</p>
                <h2 id="services-h" className="section-title">What Ardeno<br />Actually Offers</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">Defining our services was harder than it sounds. The temptation was to list everything. The right move was to focus. We landed on four pillars.</p>
          </div>
          <div className="wrap-wide mt-48">
            <div className="services-bento-grid">
              <ServiceCardPro num="01" title="Custom Web Design" desc="No templates. Every pixel intentional, every layout earned." />
              <ServiceCardPro num="02" title="Fast Builds" desc="Modern stack. Sub-second load times. Next.js + TypeScript." />
              <ServiceCardPro num="03" title="SEO-Ready" desc="Built to rank on day one. Clean code, semantic structure." />
              <ServiceCardPro num="04" title="Client-First Process" desc="Transparent, collaborative, zero surprises." />
            </div>
          </div>
        </section>

        <section id="s-build" className="section" aria-labelledby="build-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">06</span>
              <div className="section-title-wrap">
                <p className="section-label">The Build</p>
                <h2 id="build-h" className="section-title">Five Pages.<br />Built From Scratch.</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">With the brand locked and the services defined, we turned to the hardest part: building the actual site. Five pages. A full visual system. Framer-powered interactions. All of it in Next.js and TypeScript.</p>

            <dl className="pages-list mt-48" aria-label="Pages delivered">
              <div className="page-row"><dt className="page-name">Landing</dt><dd className="page-desc">First impression. Bold headline, live badge, ghost 'A' mark. Premium. Precise.</dd></div>
              <div className="page-row"><dt className="page-name">Services</dt><dd className="page-desc">Clear, no-nonsense breakdown of the four pillars.</dd></div>
              <div className="page-row"><dt className="page-name">Work</dt><dd className="page-desc">Six concept projects across different industries — proof of range.</dd></div>
              <div className="page-row"><dt className="page-name">About</dt><dd className="page-desc">The story behind the studio.</dd></div>
              <div className="page-row"><dt className="page-name">Contact</dt><dd className="page-desc">Simple, direct, zero friction.</dd></div>
            </dl>
          </div>
        </section>

        <section id="s-tech" className="section" aria-labelledby="tech-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">07</span>
              <div className="section-title-wrap">
                <p className="section-label">Tech Stack</p>
                <h2 id="tech-h" className="section-title">The Engine<br />Behind the Art.</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">We don't use page builders or templates. We use a professional-grade development stack that ensures maximum performance, SEO, and long-term scalability.</p>
            <ul className="tech-stack mt-48" aria-label="Technology stack">
              <li className="tech-pill accent-pill">Next.js</li>
              <li className="tech-pill accent-pill">TypeScript</li>
              <li className="tech-pill accent-pill">Framer Motion</li>
              <li className="tech-pill">Vite</li>
              <li className="tech-pill">PostCSS</li>
              <li className="tech-pill">Performance routing</li>
              <li className="tech-pill">Scalable foundation</li>
              <li className="tech-pill">Clean, reliable code</li>
              <li className="tech-pill">Earned interactions</li>
            </ul>
          </div>
        </section>

        <section id="s-portfolio" className="section" aria-labelledby="portfolio-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">08</span>
              <div className="section-title-wrap">
                <p className="section-label">Concept Portfolio</p>
                <h2 id="portfolio-h" className="section-title">Proof in<br />Every Pixel.</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">Rather than launch with an empty work page, we designed six full concept projects — each across a different industry, each built to the same standard we'd deliver for a paying client. Proper design exercises, not quick mockups.</p>
          </div>
          <div className="wrap-wide mt-48">
            <PortfolioGrid />
          </div>
        </section>

        <section id="s-process" className="section" aria-labelledby="process-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">09</span>
              <div className="section-title-wrap">
                <p className="section-label">Our Process</p>
                <h2 id="process-h" className="section-title">Four Steps.<br />One Result.</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
          </div>
          <div className="wrap-wide mt-64 px-4 md:px-0">
            <div className="process-walkthrough-container">
              {/* Animated Connecting Track */}
              <div className="process-track-bg" />

              <ol className="process-walkthrough-list">
                {[
                  { num: '01', name: 'Discover', desc: 'A deep immersion into your brand ecosystem. We identify the core values, target audience, and market white space to build a strategic foundation that is impossible to ignore.' },
                  { num: '02', name: 'Design', desc: 'Crafting a unique visual vernacular. We compose every pixel from scratch, ensuring that your digital presence is not just a website, but a high-performance brand asset.' },
                  { num: '03', name: 'Build', desc: 'Engineering with surgical precision. Using our Pro-stack (Next.js, TS), we develop a lighting-fast, SEO-optimized engine designed for global scalability and rock-solid reliability.' },
                  { num: '04', name: 'Launch', desc: 'A strategic roll-out with zero-downtime deployment. We partner with you beyond the launch to ensure your brand maintains its momentum and performance at the highest level.' }
                ].map((s, idx) => (
                  <motion.li
                    key={s.num}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-150px" }}
                    transition={{ duration: 0.9, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="process-walkthrough-item"
                  >
                    <div className="process-step-card p-capsule">
                      <div className="p-noise" />

                      {/* Ghosted Parallax Number */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 0.04, scale: 1 }}
                        className="process-ghost-num"
                      >
                        {s.num}
                      </motion.div>

                      <div className="relative z-10">
                        <p className="process-phase-tag">PHASE {s.num}</p>
                        <h3 className="process-step-title">{s.name}</h3>
                        <p className="process-step-body">{s.desc}</p>
                      </div>

                      {/* Subtle Glow Hub */}
                      <div className="process-glow-hub" />
                    </div>

                    {/* Connecting Dot */}
                    <div className="process-track-dot" />
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="s-learned" className="section" aria-labelledby="learned-h">
          <div className="wrap">
            <header className="section-header">
              <span className="section-num" aria-hidden="true">10</span>
              <div className="section-title-wrap">
                <p className="section-label">What We Learned</p>
                <h2 id="learned-h" className="section-title">Four Lessons From<br />Building Ourselves</h2>
                <div className="section-divider" aria-hidden="true"></div>
              </div>
            </header>
            <p className="body-lg">Building a digital studio from the ground up forces you to confront the gap between your taste and your actual output. Here are the four foundational principles that emerged from the process.</p>
          </div>
          <div className="wrap-wide mt-48 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#E50914]/[0.05] blur-[120px] rounded-full pointer-events-none" />
            <div className="lessons-pro-grid">
              {[
                {
                  id: 1,
                  label: '01 / INTEGRITY',
                  title: 'Integrity over momentum',
                  body: "When we discovered the French studio, we could have launched anyway. We didn't. The rebrand cost us weeks. It gave us something better — a brand that is entirely ours."
                },
                {
                  id: 2,
                  label: '02 / CLARITY',
                  title: 'Clarity is the hardest design problem',
                  body: 'Anyone can make something that looks premium. Making something that communicates with precision takes longer. Every word on the Ardeno website was rewritten.'
                },
                {
                  id: 3,
                  label: '03 / PROOF',
                  title: 'Proof precedes trust',
                  body: 'Nobody replied to our early outreach because we had nothing to show. Now we do. The website, the portfolio, the identity — they do the talking before we say a word.'
                },
                {
                  id: 4,
                  label: '04 / THE BRIEF',
                  title: 'Building for yourself is the best brief',
                  body: "No client constraints. Only your own standards. When you're both the studio and the client, the only person you have to convince is yourself. That discipline transfers."
                }
              ].map((L, idx) => (
                <motion.article
                  key={L.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView="scroll-focus-active"
                  animate={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.6 }}
                  variants={{
                    "scroll-focus-active": { /* handled via CSS */ }
                  }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="lesson-card-pro"
                >
                  <span className="lesson-watermark">0{L.id}</span>
                  <span className="lesson-label-mono">{L.label}</span>
                  <h3 className="lesson-title-pro">{L.title}</h3>
                  <div className="section-divider-mini" aria-hidden="true" />
                  <p className="lesson-body-pro">{L.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer>
        <img
          src="/case-studies/humble/ardeno-logo.svg"
          alt="Ardeno logo"
          className="footer-logo"
          onError={(e) => { e.currentTarget.src = "/case-studies/humble/ardeno-logo.png" }}
        />
        <p className="footer-mark">Ardeno Studio</p>
        <p className="footer-url">ardeno-studio-website.vercel.app</p>
        <p className="footer-date">March 2026</p>
      </footer>


    </motion.div>
  );
};
